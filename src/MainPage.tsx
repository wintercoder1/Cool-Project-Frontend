import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import networkManager from './network/NetworkManager';
import LogoHeader from './components/LogoHeader.jsx';
import Footer from './components/Footer';
import CategoryDropdown from './components/main/CategoryDropdown';
import SearchBar from './components/main/SearchBar';
import SortControls from './components/SortControls.js';
import CompanyList from './components/main/CompanyList';
import PaginationControls from './components/PaginationControls.js';
import FloatingActionButton from './components/main/FloatingActionButton';

// Pulls a usable number out of whatever getCategoryItemCount returns. The
// endpoint returns the count wrapped in a single-element array, e.g. [167],
// so that's the main case; this also tolerates a bare number, a numeric
// string, or a wrapped object. Returns null when nothing numeric is present,
// so a bad response is never turned into NaN downstream.
const coerceCount = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? coerceCount(value[0]) : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  if (value && typeof value === 'object') {
    return coerceCount(value.count ?? value.total ?? value.totalCount ?? value.total_count);
  }
  return null;
};

// A cache entry only counts as real data if it's a non-empty array. An empty
// array (whether from a stale localStorage blob written by an older build, or
// from a backend that occasionally returns nothing) must NOT be treated as a
// hit — otherwise it silently suppresses the fetch forever and the page shows
// "no data". This is what caused pages 1 and 2 to stay blank while later
// (uncached) pages worked.
const isUsableCacheEntry = (entry) => Array.isArray(entry) && entry.length > 0;

const MainPage = () => {
  const itemsPerPage = 10;

  // How long to keep waiting on an empty backend response before giving up.
  // ~10 attempts x 800ms covers a cold-start backend; a genuinely empty page
  // settles to "no data" after these are exhausted.
  const MAX_EMPTY_RETRIES = 10;
  const EMPTY_RETRY_DELAY_MS = 800;

  // Initialize dataCache from localStorage if available, otherwise use empty object
  const [dataCache, setDataCache] = useState(() => {
    const savedCache = localStorage.getItem('compassAIDataCache');
    if (!savedCache) return {};
    try {
      const parsed = JSON.parse(savedCache);
      // Drop any empty/garbage entries on restore so a stale blob from an
      // older build can't suppress fetches for those pages.
      return Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => isUsableCacheEntry(v))
      );
    } catch {
      return {};
    }
  });

  const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
    const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
    return savedCache ? JSON.parse(savedCache) : {
      'Political Leaning': 0,
      'DEI Friendliness': 0,
      'Wokeness': 0,
      'Environmental Impact': 0,
      'Immigration': 0,
      'Technology Innovation': 0,
      'Financial Contributions': 0
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(() => {
    return localStorage.getItem('compassAILastCategory') || 'Political Leaning';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Name');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem('compassAICurrentPage') || '1', 10);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Mirror of dataCache so the async fetch/prefetch hit-checks always read the
  // current cache instead of the value captured when the function was created.
  const dataCacheRef = useRef(dataCache);
  useEffect(() => {
    dataCacheRef.current = dataCache;
  }, [dataCache]);

  // Tracks the view (category/page/sort) currently on screen, so an async
  // fetch or a scheduled retry can tell whether it's still relevant before it
  // touches state. Always points to the latest fetch closure for retries.
  const currentViewKeyRef = useRef('');
  const fetchRef = useRef(() => {});
  // Per-view count of consecutive empty responses, to bound retries.
  const emptyRetryRef = useRef({});

  const navigate = useNavigate();

  // Available categories for the dropdown
  const availableCategories = [
    'Political Leaning',
    'DEI Friendliness', 
    'Wokeness',
    'Environmental Impact',
    'Immigration Support',
    'Technology Innovation',
    'Financial Contributions'
  ];

  // Dynamic sort options based on category
  const getSortOptions = () => {
    if (category === 'Political Leaning') {
      return ['Name', 'Liberal lean', 'Conservative lean'];
    }
    if (category === 'Financial Contributions') {
      return ['Name'];
    }
    return ['Name', 'Rating'];
  };

  useEffect(() => {
    localStorage.setItem('compassAICurrentPage', String(currentPage));
  }, [currentPage]);

  // Save last selected category and fetch its item count when unknown.
  // NOTE: page/sort resets happen in handleSelectCategory (and clearCache) so
  // they batch atomically with the category change — otherwise the data effect
  // would fire once with the new category but the OLD sort, issuing a fetch
  // with a sort the new category doesn't support.
  useEffect(() => {
    localStorage.setItem('compassAILastCategory', category);

    console.log('Category is now:', category);
    if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
      fetchTotalItems(category);
    }
  }, [category]);

  // Fetch total number of items for pagination
  const fetchTotalItems = async (category) => {
    try {
      console.log('Fetching total items for category:', category);
      const count = await networkManager.getCategoryItemCount(category);
      console.log('The count:', count);

      // Coerce whatever came back to a number. If it isn't usable, leave the
      // existing value alone instead of storing undefined/NaN (which is what
      // produced "Page 1 of NaN").
      const numericCount = coerceCount(count);
      if (numericCount == null) {
        console.warn('getCategoryItemCount returned a non-numeric value:', count);
        return;
      }

      setTotalItemsForCategoryCache(prevCache => ({
        ...prevCache,
        [category]: numericCount
      }));
    } catch (err) {
      console.error('Error fetching total items:', err);
      setError(err.message);
    }
  };

  const fetchDataForCategory = async () => {
    const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
    if (isUsableCacheEntry(dataCacheRef.current[cacheKey])) {
      // Real data already cached for this category, page, sort, and order.
      setLoading(false);
      prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
      return;
    }
    try {
      setLoading(true);
      console.log(`Fetching data for category: ${category}`);
      const offset = (currentPage - 1) * itemsPerPage;
      const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
      console.log('Data fetched:', jsonData);

      // The view changed while this request was in flight — drop the result so
      // it can't overwrite or affect whatever is on screen now.
      if (currentViewKeyRef.current !== cacheKey) return;

      if (isUsableCacheEntry(jsonData)) {
        emptyRetryRef.current[cacheKey] = 0;
        setDataCache(prevCache => ({
          ...prevCache,
          [cacheKey]: jsonData
        }));
        setLoading(false);
        prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
        return;
      }

      // Empty response. On initial load this is just the backend warming up —
      // it WILL come. Don't cache the empty and don't flash "no data": keep the
      // loading state and retry until real data arrives (bounded so a page
      // that is genuinely empty eventually settles).
      const attempts = (emptyRetryRef.current[cacheKey] || 0) + 1;
      emptyRetryRef.current[cacheKey] = attempts;
      if (attempts <= MAX_EMPTY_RETRIES) {
        setTimeout(() => {
          if (currentViewKeyRef.current === cacheKey) {
            fetchRef.current();
          }
        }, EMPTY_RETRY_DELAY_MS);
        // Intentionally leave loading=true so the UI shows a spinner, not "no data".
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (currentViewKeyRef.current === cacheKey) {
        setError(err.message);
        setLoading(false);
      }
      console.error('Error fetching data:', err);
    }
  };

  const prefetchAdjacentPage = async (page, cat, sort, order) => {
    const prefetchKey = `${cat} p${page} ${sort} ${order}`;
    if (isUsableCacheEntry(dataCacheRef.current[prefetchKey])) return;
    try {
      const offset = (page - 1) * itemsPerPage;
      const jsonData = await networkManager.getSavedCategoryData(cat, sort, order, itemsPerPage, offset);
      if (isUsableCacheEntry(jsonData)) {
        setDataCache(prevCache => ({
          ...prevCache,
          [prefetchKey]: jsonData
        }));
      }
    } catch {
      // Prefetch failure is silent — main fetch will handle it on navigation
    }
  };

  // Fetch data with pagination, sort changes, or category changes
  useEffect(() => {
    const viewKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
    currentViewKeyRef.current = viewKey;
    fetchRef.current = fetchDataForCategory;
    console.log('Fetching data due to dependency change:', { currentPage, sortBy, sortOrder, category });
    fetchDataForCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder, category]);

  const clearCache = () => {
    localStorage.removeItem('compassAIDataCache');
    localStorage.removeItem('compassAILastCategory');
    localStorage.removeItem('compassAITotalItemsForCategory');
    localStorage.removeItem('compassAICurrentPage');
    setDataCache({});
    setTotalItemsForCategoryCache({
      'Political Leaning': 0,
      'DEI Friendliness': 0,
      'Wokeness': 0,
      'Environmental Impact': 0,
      'Financial Contributions': 0
    });
    setCategory('Political Leaning');
    setCurrentPage(1);
    setSortBy('Name');
    setSortOrder('asc');
  };

  // Category dropdown handlers
  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectCategory = (newCategory) => {
    if (newCategory === category) {
      setDropdownOpen(false);
      return;
    }
    // Reset page and sort together with the category so all four update in a
    // single render and the data effect fires exactly one consistent fetch.
    setCategory(newCategory);
    setCurrentPage(1);
    setSortBy('Name');
    setSortOrder('asc');
    setDropdownOpen(false);
  };

  // Sort handlers
  const handleToggleSortDropdown = () => {
    setSortDropdownOpen(!sortDropdownOpen);
  };

  const handleSelectSortOption = (option) => {
    setSortBy(option);
    setSortDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleToggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // TODO: Use this method only on Political leaning mode.
  // @ts-expect-error
  const getLeaningStyle = (rating, lean) => {
    const isLiberal = lean.toLowerCase().includes('liberal');
    const isNeutral = rating == '0';
    const baseStyle = 'text-right font-medium';

    if (isNeutral) {
      return `${baseStyle} ${'text-gray-600'}`;
    }

    if (isLiberal) {
      switch (rating) {
        case 1:
          return 'text-blue-100';
        case 2:
          return 'text-blue-300';
        case 3:
          return 'text-blue-500';
        case 4:
          return 'text-blue-700';
        case 5:
          return 'text-blue-900';
        default:
          return 'text-blue-900'
      }   
    } else {
      switch (rating) {
        case 1:
          return 'text-red-100'
        case 2:
          return 'text-red-300'
        case 3:
          return 'text-red-500'
        case 4:
          return 'text-red-700'
        case 5:
          return 'text-red-900'
        default:
          return 'text-red-900'
      }
    }
  };

  const getCleanedLeanString = (rating) => {
    if (!rating) {
      return 'Neutral'
    }
    const isLiberal = rating.toLowerCase().includes('liberal');
    const isConservative = rating.toLowerCase().includes('conservative');
    if (isLiberal) {
      return 'Liberal'
    }
    if (isConservative) {
      return 'Conservative'
    }
    return 'Neutral'
  }

  const getCategoryValueLabel = () => {
    switch(category) {
      case 'Political Leaning':
        return (item) => `${item.rating} ${getCleanedLeanString(item.lean)}`;
      case 'DEI Friendliness':
        return (item) => `${item.rating}/5`;
      case 'Wokeness':
        return (item) => `${item.rating}/5`;
      case 'Financial Contributions':
        return () => ``;
      default:
        return (item) => `${item.rating}`;
    }
  };

  // Navigation handlers
  const handleOrganizationClick = (organization) => {
    console.log('Organization clicked:', organization);
    openDetailPageNewTab(organization, category);
  };

  const CATEGORY_TO_SLUG = {
    'Political Leaning': 'political_leaning',
    'DEI Friendliness': 'dei_friendliness',
    'Wokeness': 'wokeness',
    'Environmental Impact': 'environmental_impact',
    'Immigration Support': 'immigration_support',
    'Technology Innovation': 'technology_innovation',
    'Financial Contributions': 'financial_contributions',
  };

  const openDetailPageNewTab = (organization, category) => {
    localStorage.setItem(`categoryData`, category);
    localStorage.setItem(`organizationData`, JSON.stringify(organization));
    const slug = CATEGORY_TO_SLUG[category] ?? category.toLowerCase().replace(/\s+/g, '_');
    const topic = encodeURIComponent(organization.topic);
    window.open(`/organization/${slug}/${topic}`, "_blank", "noreferrer");
  }

  const handleNewQueryClick = () => {
    navigate('query', {
      state: { current_category: category },
    });
  };

  // Search handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim() === '') {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await networkManager.searchPersistedAnswers(category, value.trim());
        setSearchResults(data.results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleSearchClear = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery('');
    setSearchResults(null);
    setSearchLoading(false);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate total pages and get current data
  const totalItems = coerceCount(totalItemsForCategoryCache[category]);
  // Guard against an unknown/non-numeric count so the UI never shows "of NaN".
  // Until a real count arrives, fall back to the current page as the floor.
  const totalPages = totalItems != null && totalItems > 0
    ? Math.ceil(totalItems / itemsPerPage)
    : currentPage;
  const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
  const currentData = dataCache[cacheKey] || [];

  const isSearchMode = searchQuery.trim().length > 0;
  const displayData = isSearchMode ? (searchResults || []) : currentData;
  const displayLoading = isSearchMode ? searchLoading : loading;

  // const length = currentData != null ? currentData.length : 0;

  // console.log('Rendering with:', { cacheKey, dataLength: length, currentData });
  console.log('   DataCache:', { dataCache });

  if (error) {
    return (
      <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
        {/* Header with Logo and Dropdown */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
          <LogoHeader />
        </div>

        <div className="flex justify-center items-center min-h-[calc(60vh-120px)] sm:min-h-[60vh] sm:mt-4">
          <div className="w-full max-w-md mx-auto">
            <div className="p-4 text-center">
              <div className="text-gray-800">Error loading data: {error}</div>
              <button 
                className="mt-2 px-4 py-2 bg-gray-200 rounded"
                onClick={clearCache}
              >
                Clear Cache and Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } 

  return (
    <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
      {/* Header with Logo and Dropdown */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        <LogoHeader />
        <CategoryDropdown 
          category={category}
          availableCategories={availableCategories}
          dropdownOpen={dropdownOpen}
          onToggleDropdown={handleToggleDropdown}
          onSelectCategory={handleSelectCategory}
        />
      </div>
      <div className="border-t border-gray-300 bg-gray-100 mt-2 pt-6 pb-10">

        <div className="p-5 mt-2 pt-0 pb-5"> {/* Added bottom padding to prevent overlap */}

            {/* Search Bar and Sort Controls */}
            <div className="flex justify-between items-center mb-4 px-4 pb-8 bg-white rounded-lg shadow-sm p-6 mb-6">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />
              {!isSearchMode && (
                <SortControls
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  sortOptions={getSortOptions()}
                  sortDropdownOpen={sortDropdownOpen}
                  onToggleSortDropdown={handleToggleSortDropdown}
                  onSelectSortOption={handleSelectSortOption}
                  onToggleSortOrder={handleToggleSortOrder}
                />
              )}
            </div>

            <div className="py-0 bg-white"></div>


            <div className="py-0 bg-white bg-white rounded-lg shadow-sm pt-5 p-4 pb-5 ">
              <CompanyList
                data={displayData}
                loading={displayLoading}
                category={category}
                onItemClick={handleOrganizationClick}
                getCategoryValueLabel={getCategoryValueLabel}
              />
            </div>
          </div>
      </div>

      {/* Pagination Controls - Fixed to bottom with transparent background */}
      {/* <div className="fixed bottom-0 left-0 right-0 py-10"> */}

      {!isSearchMode && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      )}
      {/* </div> */}
      <FloatingActionButton onClick={handleNewQueryClick} />
      <Footer />
    </div>
  );
};

export default MainPage;

// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import networkManager from './network/NetworkManager';
// import LogoHeader from './components/LogoHeader.jsx';
// import Footer from './components/Footer';
// import CategoryDropdown from './components/main/CategoryDropdown';
// import SearchBar from './components/main/SearchBar';
// import SortControls from './components/SortControls.js';
// import CompanyList from './components/main/CompanyList';
// import PaginationControls from './components/PaginationControls.js';
// import FloatingActionButton from './components/main/FloatingActionButton';

// // Pulls a usable number out of whatever getCategoryItemCount returns. The
// // endpoint returns the count wrapped in a single-element array, e.g. [167],
// // so that's the main case; this also tolerates a bare number, a numeric
// // string, or a wrapped object. Returns null when nothing numeric is present,
// // so a bad response is never turned into NaN downstream.
// const coerceCount = (value) => {
//   if (Array.isArray(value)) {
//     return value.length > 0 ? coerceCount(value[0]) : null;
//   }
//   if (typeof value === 'number' && Number.isFinite(value)) return value;
//   if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
//     return Number(value);
//   }
//   if (value && typeof value === 'object') {
//     return coerceCount(value.count ?? value.total ?? value.totalCount ?? value.total_count);
//   }
//   return null;
// };

// // A cache entry only counts as real data if it's a non-empty array. An empty
// // array (whether from a stale localStorage blob written by an older build, or
// // from a backend that occasionally returns nothing) must NOT be treated as a
// // hit — otherwise it silently suppresses the fetch forever and the page shows
// // "no data". This is what caused pages 1 and 2 to stay blank while later
// // (uncached) pages worked.
// const isUsableCacheEntry = (entry) => Array.isArray(entry) && entry.length > 0;

// const MainPage = () => {
//   const itemsPerPage = 10;

//   // Initialize dataCache from localStorage if available, otherwise use empty object
//   const [dataCache, setDataCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAIDataCache');
//     if (!savedCache) return {};
//     try {
//       const parsed = JSON.parse(savedCache);
//       // Drop any empty/garbage entries on restore so a stale blob from an
//       // older build can't suppress fetches for those pages.
//       return Object.fromEntries(
//         Object.entries(parsed).filter(([, v]) => isUsableCacheEntry(v))
//       );
//     } catch {
//       return {};
//     }
//   });

//   const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
//     return savedCache ? JSON.parse(savedCache) : {
//       'Political Leaning': 0,
//       'DEI Friendliness': 0,
//       'Wokeness': 0,
//       'Environmental Impact': 0,
//       'Immigration': 0,
//       'Technology Innovation': 0,
//       'Financial Contributions': 0
//     };
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [category, setCategory] = useState(() => {
//     return localStorage.getItem('compassAILastCategory') || 'Political Leaning';
//   });
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [sortBy, setSortBy] = useState('Name');
//   const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
//   const [sortOrder, setSortOrder] = useState('asc');
//   const [currentPage, setCurrentPage] = useState(() => {
//     return parseInt(localStorage.getItem('compassAICurrentPage') || '1', 10);
//   });

//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const searchTimeoutRef = useRef(null);

//   // Mirror of dataCache so the async fetch/prefetch hit-checks always read the
//   // current cache instead of the value captured when the function was created.
//   const dataCacheRef = useRef(dataCache);
//   useEffect(() => {
//     dataCacheRef.current = dataCache;
//   }, [dataCache]);

//   const navigate = useNavigate();

//   // Available categories for the dropdown
//   const availableCategories = [
//     'Political Leaning',
//     'DEI Friendliness', 
//     'Wokeness',
//     'Environmental Impact',
//     'Immigration Support',
//     'Technology Innovation',
//     'Financial Contributions'
//   ];

//   // Dynamic sort options based on category
//   const getSortOptions = () => {
//     if (category === 'Political Leaning') {
//       return ['Name', 'Liberal lean', 'Conservative lean'];
//     }
//     if (category === 'Financial Contributions') {
//       return ['Name'];
//     }
//     return ['Name', 'Rating'];
//   };

//   useEffect(() => {
//     localStorage.setItem('compassAICurrentPage', String(currentPage));
//   }, [currentPage]);

//   // Save last selected category and fetch its item count when unknown.
//   // NOTE: page/sort resets happen in handleSelectCategory (and clearCache) so
//   // they batch atomically with the category change — otherwise the data effect
//   // would fire once with the new category but the OLD sort, issuing a fetch
//   // with a sort the new category doesn't support.
//   useEffect(() => {
//     localStorage.setItem('compassAILastCategory', category);

//     console.log('Category is now:', category);
//     if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
//       fetchTotalItems(category);
//     }
//   }, [category]);

//   // Fetch total number of items for pagination
//   const fetchTotalItems = async (category) => {
//     try {
//       console.log('Fetching total items for category:', category);
//       const count = await networkManager.getCategoryItemCount(category);
//       console.log('The count:', count);

//       // Coerce whatever came back to a number. If it isn't usable, leave the
//       // existing value alone instead of storing undefined/NaN (which is what
//       // produced "Page 1 of NaN").
//       const numericCount = coerceCount(count);
//       if (numericCount == null) {
//         console.warn('getCategoryItemCount returned a non-numeric value:', count);
//         return;
//       }

//       setTotalItemsForCategoryCache(prevCache => ({
//         ...prevCache,
//         [category]: numericCount
//       }));
//     } catch (err) {
//       console.error('Error fetching total items:', err);
//       setError(err.message);
//     }
//   };

//   const fetchDataForCategory = async () => {
//     const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//     if (isUsableCacheEntry(dataCacheRef.current[cacheKey])) {
//       // Real data already cached for this category, page, sort, and order.
//       prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
//       return;
//     }
//     try {
//       setLoading(true);
//       console.log(`Fetching data for category: ${category}`);
//       const offset = (currentPage - 1) * itemsPerPage;
//       const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
//       console.log('Data fetched:', jsonData);

//       // Only cache real (non-empty) results. Caching an empty array would
//       // poison this page and prevent any later refetch.
//       if (isUsableCacheEntry(jsonData)) {
//         setDataCache(prevCache => ({
//           ...prevCache,
//           [cacheKey]: jsonData
//         }));
//       }

//       prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
//     } catch (err) {
//       setError(err.message);
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const prefetchAdjacentPage = async (page, cat, sort, order) => {
//     const prefetchKey = `${cat} p${page} ${sort} ${order}`;
//     if (isUsableCacheEntry(dataCacheRef.current[prefetchKey])) return;
//     try {
//       const offset = (page - 1) * itemsPerPage;
//       const jsonData = await networkManager.getSavedCategoryData(cat, sort, order, itemsPerPage, offset);
//       if (isUsableCacheEntry(jsonData)) {
//         setDataCache(prevCache => ({
//           ...prevCache,
//           [prefetchKey]: jsonData
//         }));
//       }
//     } catch {
//       // Prefetch failure is silent — main fetch will handle it on navigation
//     }
//   };

//   // Fetch data with pagination, sort changes, or category changes
//   useEffect(() => {
//     console.log('Fetching data due to dependency change:', { currentPage, sortBy, sortOrder, category });
//     fetchDataForCategory();
//   }, [currentPage, sortBy, sortOrder, category]);

//   const clearCache = () => {
//     localStorage.removeItem('compassAIDataCache');
//     localStorage.removeItem('compassAILastCategory');
//     localStorage.removeItem('compassAITotalItemsForCategory');
//     localStorage.removeItem('compassAICurrentPage');
//     setDataCache({});
//     setTotalItemsForCategoryCache({
//       'Political Leaning': 0,
//       'DEI Friendliness': 0,
//       'Wokeness': 0,
//       'Environmental Impact': 0,
//       'Financial Contributions': 0
//     });
//     setCategory('Political Leaning');
//     setCurrentPage(1);
//     setSortBy('Name');
//     setSortOrder('asc');
//   };

//   // Category dropdown handlers
//   const handleToggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const handleSelectCategory = (newCategory) => {
//     if (newCategory === category) {
//       setDropdownOpen(false);
//       return;
//     }
//     // Reset page and sort together with the category so all four update in a
//     // single render and the data effect fires exactly one consistent fetch.
//     setCategory(newCategory);
//     setCurrentPage(1);
//     setSortBy('Name');
//     setSortOrder('asc');
//     setDropdownOpen(false);
//   };

//   // Sort handlers
//   const handleToggleSortDropdown = () => {
//     setSortDropdownOpen(!sortDropdownOpen);
//   };

//   const handleSelectSortOption = (option) => {
//     setSortBy(option);
//     setSortDropdownOpen(false);
//     setCurrentPage(1);
//   };

//   const handleToggleSortOrder = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     setCurrentPage(1);
//   };

//   // TODO: Use this method only on Political leaning mode.
//   // @ts-expect-error
//   const getLeaningStyle = (rating, lean) => {
//     const isLiberal = lean.toLowerCase().includes('liberal');
//     const isNeutral = rating == '0';
//     const baseStyle = 'text-right font-medium';

//     if (isNeutral) {
//       return `${baseStyle} ${'text-gray-600'}`;
//     }

//     if (isLiberal) {
//       switch (rating) {
//         case 1:
//           return 'text-blue-100';
//         case 2:
//           return 'text-blue-300';
//         case 3:
//           return 'text-blue-500';
//         case 4:
//           return 'text-blue-700';
//         case 5:
//           return 'text-blue-900';
//         default:
//           return 'text-blue-900'
//       }   
//     } else {
//       switch (rating) {
//         case 1:
//           return 'text-red-100'
//         case 2:
//           return 'text-red-300'
//         case 3:
//           return 'text-red-500'
//         case 4:
//           return 'text-red-700'
//         case 5:
//           return 'text-red-900'
//         default:
//           return 'text-red-900'
//       }
//     }
//   };

//   const getCleanedLeanString = (rating) => {
//     if (!rating) {
//       return 'Neutral'
//     }
//     const isLiberal = rating.toLowerCase().includes('liberal');
//     const isConservative = rating.toLowerCase().includes('conservative');
//     if (isLiberal) {
//       return 'Liberal'
//     }
//     if (isConservative) {
//       return 'Conservative'
//     }
//     return 'Neutral'
//   }

//   const getCategoryValueLabel = () => {
//     switch(category) {
//       case 'Political Leaning':
//         return (item) => `${item.rating} ${getCleanedLeanString(item.lean)}`;
//       case 'DEI Friendliness':
//         return (item) => `${item.rating}/5`;
//       case 'Wokeness':
//         return (item) => `${item.rating}/5`;
//       case 'Financial Contributions':
//         return () => ``;
//       default:
//         return (item) => `${item.rating}`;
//     }
//   };

//   // Navigation handlers
//   const handleOrganizationClick = (organization) => {
//     console.log('Organization clicked:', organization);
//     openDetailPageNewTab(organization, category);
//   };

//   const CATEGORY_TO_SLUG = {
//     'Political Leaning': 'political_leaning',
//     'DEI Friendliness': 'dei_friendliness',
//     'Wokeness': 'wokeness',
//     'Environmental Impact': 'environmental_impact',
//     'Immigration Support': 'immigration_support',
//     'Technology Innovation': 'technology_innovation',
//     'Financial Contributions': 'financial_contributions',
//   };

//   const openDetailPageNewTab = (organization, category) => {
//     localStorage.setItem(`categoryData`, category);
//     localStorage.setItem(`organizationData`, JSON.stringify(organization));
//     const slug = CATEGORY_TO_SLUG[category] ?? category.toLowerCase().replace(/\s+/g, '_');
//     const topic = encodeURIComponent(organization.topic);
//     window.open(`/organization/${slug}/${topic}`, "_blank", "noreferrer");
//   }

//   const handleNewQueryClick = () => {
//     navigate('query', {
//       state: { current_category: category },
//     });
//   };

//   // Search handlers
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);

//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     if (value.trim() === '') {
//       setSearchResults(null);
//       setSearchLoading(false);
//       return;
//     }

//     setSearchLoading(true);
//     searchTimeoutRef.current = setTimeout(async () => {
//       try {
//         const data = await networkManager.searchPersistedAnswers(category, value.trim());
//         setSearchResults(data.results);
//       } catch (err) {
//         console.error('Search error:', err);
//         setSearchResults([]);
//       } finally {
//         setSearchLoading(false);
//       }
//     }, 400);
//   };

//   const handleSearchClear = () => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
//     setSearchQuery('');
//     setSearchResults(null);
//     setSearchLoading(false);
//   };

//   // Pagination handlers
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Calculate total pages and get current data
//   const totalItems = coerceCount(totalItemsForCategoryCache[category]);
//   // Guard against an unknown/non-numeric count so the UI never shows "of NaN".
//   // Until a real count arrives, fall back to the current page as the floor.
//   const totalPages = totalItems != null && totalItems > 0
//     ? Math.ceil(totalItems / itemsPerPage)
//     : currentPage;
//   const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//   const currentData = dataCache[cacheKey] || [];

//   const isSearchMode = searchQuery.trim().length > 0;
//   const displayData = isSearchMode ? (searchResults || []) : currentData;
//   const displayLoading = isSearchMode ? searchLoading : loading;

//   console.log('Rendering with:', { cacheKey, dataLength: currentData.length, currentData });
//   console.log('   DataCache:', { dataCache });

//   if (error) {
//     return (
//       <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
//         {/* Header with Logo and Dropdown */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
//           <LogoHeader />
//         </div>

//         <div className="flex justify-center items-center min-h-[calc(60vh-120px)] sm:min-h-[60vh] sm:mt-4">
//           <div className="w-full max-w-md mx-auto">
//             <div className="p-4 text-center">
//               <div className="text-gray-800">Error loading data: {error}</div>
//               <button 
//                 className="mt-2 px-4 py-2 bg-gray-200 rounded"
//                 onClick={clearCache}
//               >
//                 Clear Cache and Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   } 

//   return (
//     <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
//       {/* Header with Logo and Dropdown */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
//         <LogoHeader />
//         <CategoryDropdown 
//           category={category}
//           availableCategories={availableCategories}
//           dropdownOpen={dropdownOpen}
//           onToggleDropdown={handleToggleDropdown}
//           onSelectCategory={handleSelectCategory}
//         />
//       </div>
//       <div className="border-t border-gray-300 bg-gray-100 mt-2 pt-6 pb-10">

//         <div className="p-5 mt-2 pt-0 pb-5"> {/* Added bottom padding to prevent overlap */}

//             {/* Search Bar and Sort Controls */}
//             <div className="flex justify-between items-center mb-4 px-4 pb-8 bg-white rounded-lg shadow-sm p-6 mb-6">
//               <SearchBar
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 onClear={handleSearchClear}
//               />
//               {!isSearchMode && (
//                 <SortControls
//                   sortBy={sortBy}
//                   sortOrder={sortOrder}
//                   sortOptions={getSortOptions()}
//                   sortDropdownOpen={sortDropdownOpen}
//                   onToggleSortDropdown={handleToggleSortDropdown}
//                   onSelectSortOption={handleSelectSortOption}
//                   onToggleSortOrder={handleToggleSortOrder}
//                 />
//               )}
//             </div>

//             <div className="py-0 bg-white"></div>


//             <div className="py-0 bg-white bg-white rounded-lg shadow-sm pt-5 p-4 pb-5 ">
//               <CompanyList
//                 data={displayData}
//                 loading={displayLoading}
//                 category={category}
//                 onItemClick={handleOrganizationClick}
//                 getCategoryValueLabel={getCategoryValueLabel}
//               />
//             </div>
//           </div>
//       </div>

//       {/* Pagination Controls - Fixed to bottom with transparent background */}
//       {/* <div className="fixed bottom-0 left-0 right-0 py-10"> */}

//       {!isSearchMode && (
//         <PaginationControls
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPrevPage={handlePrevPage}
//           onNextPage={handleNextPage}
//         />
//       )}
//       {/* </div> */}
//       <FloatingActionButton onClick={handleNewQueryClick} />
//       <Footer />
//     </div>
//   );
// };

// export default MainPage;

// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import networkManager from './network/NetworkManager';
// import LogoHeader from './components/LogoHeader.jsx';
// import Footer from './components/Footer';
// import CategoryDropdown from './components/main/CategoryDropdown';
// import SearchBar from './components/main/SearchBar';
// import SortControls from './components/SortControls.js';
// import CompanyList from './components/main/CompanyList';
// import PaginationControls from './components/PaginationControls.js';
// import FloatingActionButton from './components/main/FloatingActionButton';

// // Pulls a usable number out of whatever getCategoryItemCount returns. The
// // endpoint returns the count wrapped in a single-element array, e.g. [167],
// // so that's the main case; this also tolerates a bare number, a numeric
// // string, or a wrapped object. Returns null when nothing numeric is present,
// // so a bad response is never turned into NaN downstream.
// const coerceCount = (value) => {
//   if (Array.isArray(value)) {
//     return value.length > 0 ? coerceCount(value[0]) : null;
//   }
//   if (typeof value === 'number' && Number.isFinite(value)) return value;
//   if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
//     return Number(value);
//   }
//   if (value && typeof value === 'object') {
//     return coerceCount(value.count ?? value.total ?? value.totalCount ?? value.total_count);
//   }
//   return null;
// };

// const MainPage = () => {
//   const itemsPerPage = 10;

//   // Initialize dataCache from localStorage if available, otherwise use empty object
//   const [dataCache, setDataCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAIDataCache');
//     return savedCache ? JSON.parse(savedCache) : {};
//   });

//   const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
//     return savedCache ? JSON.parse(savedCache) : {
//       'Political Leaning': 0,
//       'DEI Friendliness': 0,
//       'Wokeness': 0,
//       'Environmental Impact': 0,
//       'Immigration': 0,
//       'Technology Innovation': 0,
//       'Financial Contributions': 0
//     };
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [category, setCategory] = useState(() => {
//     return localStorage.getItem('compassAILastCategory') || 'Political Leaning';
//   });
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [sortBy, setSortBy] = useState('Name');
//   const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
//   const [sortOrder, setSortOrder] = useState('asc');
//   const [currentPage, setCurrentPage] = useState(() => {
//     return parseInt(localStorage.getItem('compassAICurrentPage') || '1', 10);
//   });

//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const searchTimeoutRef = useRef(null);
//   const isMountRef = useRef(true);

//   const navigate = useNavigate();

//   // Available categories for the dropdown
//   const availableCategories = [
//     'Political Leaning',
//     'DEI Friendliness', 
//     'Wokeness',
//     'Environmental Impact',
//     'Immigration Support',
//     'Technology Innovation',
//     'Financial Contributions'
//   ];

//   // Dynamic sort options based on category
//   const getSortOptions = () => {
//     if (category === 'Political Leaning') {
//       return ['Name', 'Liberal lean', 'Conservative lean'];
//     }
//     if (category === 'Financial Contributions') {
//       return ['Name'];
//     }
//     return ['Name', 'Rating'];
//   };

//   useEffect(() => {
//     localStorage.setItem('compassAICurrentPage', String(currentPage));
//   }, [currentPage]);

//   // Save last selected category and fetch initial data
//   useEffect(() => {
//     localStorage.setItem('compassAILastCategory', category);
    
//     // Fetch the total count for the new category

//     console.log('Category is now:', category);
//     if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
//       fetchTotalItems(category);
//     }
//     // Reset to page 1 when category changes

//     // On initial mount, keep the restored page; only reset when the user changes category
//     if (isMountRef.current) {
//       isMountRef.current = false;
//       return;
//     }
//     setCurrentPage(1);
//     // Reset sort parameters when category changes
//     setSortBy('Name');
//     setSortOrder('asc');
//   }, [category]);

//   // Fetch total number of items for pagination
//   const fetchTotalItems = async (category) => {
//     try {
//       console.log('Fetching total items for category:', category);
//       const count = await networkManager.getCategoryItemCount(category);
//       console.log('The count:', count);

//       // Coerce whatever came back to a number. If it isn't usable, leave the
//       // existing value alone instead of storing undefined/NaN (which is what
//       // produced "Page 1 of NaN").
//       const numericCount = coerceCount(count);
//       if (numericCount == null) {
//         console.warn('getCategoryItemCount returned a non-numeric value:', count);
//         return;
//       }

//       setTotalItemsForCategoryCache(prevCache => ({
//         ...prevCache,
//         [category]: numericCount
//       }));
//     } catch (err) {
//       console.error('Error fetching total items:', err);
//       setError(err.message);
//     }
//   };

//   const fetchDataForCategory = async () => {
//     const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//     if (dataCache[cacheKey] != null) {
//       // Data already cached for this category, page, sort, and order.
//       prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
//       return;
//     }
//     try {
//       setLoading(true);
//       console.log(`Fetching data for category: ${category}`);
//       const offset = (currentPage - 1) * itemsPerPage;
//       const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
//       console.log('Data fetched:', jsonData);

//       setDataCache(prevCache => ({
//         ...prevCache,
//         [cacheKey]: jsonData
//       }));

//       prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
//     } catch (err) {
//       setError(err.message);
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const prefetchAdjacentPage = async (page, cat, sort, order) => {
//     const prefetchKey = `${cat} p${page} ${sort} ${order}`;
//     if (dataCache[prefetchKey] != null) return;
//     try {
//       const offset = (page - 1) * itemsPerPage;
//       const jsonData = await networkManager.getSavedCategoryData(cat, sort, order, itemsPerPage, offset);
//       setDataCache(prevCache => ({
//         ...prevCache,
//         [prefetchKey]: jsonData
//       }));
//     } catch {
//       // Prefetch failure is silent — main fetch will handle it on navigation
//     }
//   };

//   // Fetch data with pagination, sort changes, or category changes
//   useEffect(() => {
//     console.log('Fetching data due to dependency change:', { currentPage, sortBy, sortOrder, category });
//     fetchDataForCategory();
//   }, [currentPage, sortBy, sortOrder, category]);

//   const clearCache = () => {
//     localStorage.removeItem('compassAIDataCache');
//     localStorage.removeItem('compassAILastCategory');
//     localStorage.removeItem('compassAITotalItemsForCategory');
//     localStorage.removeItem('compassAICurrentPage');
//     setDataCache({});
//     setTotalItemsForCategoryCache({
//       'Political Leaning': 0,
//       'DEI Friendliness': 0,
//       'Wokeness': 0,
//       'Environmental Impact': 0,
//       'Financial Contributions': 0
//     });
//     setCategory('Political Leaning');
//     setCurrentPage(1);
//     setSortBy('Name');
//     setSortOrder('asc');
//   };

//   // Category dropdown handlers
//   const handleToggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const handleSelectCategory = (newCategory) => {
//     setCategory(newCategory);
//     setDropdownOpen(false);
//   };

//   // Sort handlers
//   const handleToggleSortDropdown = () => {
//     setSortDropdownOpen(!sortDropdownOpen);
//   };

//   const handleSelectSortOption = (option) => {
//     setSortBy(option);
//     setSortDropdownOpen(false);
//     setCurrentPage(1);
//   };

//   const handleToggleSortOrder = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     setCurrentPage(1);
//   };

//   // TODO: Use this method only on Political leaning mode.
//   // @ts-expect-error
//   const getLeaningStyle = (rating, lean) => {
//     const isLiberal = lean.toLowerCase().includes('liberal');
//     const isNeutral = rating == '0';
//     const baseStyle = 'text-right font-medium';

//     if (isNeutral) {
//       return `${baseStyle} ${'text-gray-600'}`;
//     }

//     if (isLiberal) {
//       switch (rating) {
//         case 1:
//           return 'text-blue-100';
//         case 2:
//           return 'text-blue-300';
//         case 3:
//           return 'text-blue-500';
//         case 4:
//           return 'text-blue-700';
//         case 5:
//           return 'text-blue-900';
//         default:
//           return 'text-blue-900'
//       }   
//     } else {
//       switch (rating) {
//         case 1:
//           return 'text-red-100'
//         case 2:
//           return 'text-red-300'
//         case 3:
//           return 'text-red-500'
//         case 4:
//           return 'text-red-700'
//         case 5:
//           return 'text-red-900'
//         default:
//           return 'text-red-900'
//       }
//     }
//   };

//   const getCleanedLeanString = (rating) => {
//     if (!rating) {
//       return 'Neutral'
//     }
//     const isLiberal = rating.toLowerCase().includes('liberal');
//     const isConservative = rating.toLowerCase().includes('conservative');
//     if (isLiberal) {
//       return 'Liberal'
//     }
//     if (isConservative) {
//       return 'Conservative'
//     }
//     return 'Neutral'
//   }

//   const getCategoryValueLabel = () => {
//     switch(category) {
//       case 'Political Leaning':
//         return (item) => `${item.rating} ${getCleanedLeanString(item.lean)}`;
//       case 'DEI Friendliness':
//         return (item) => `${item.rating}/5`;
//       case 'Wokeness':
//         return (item) => `${item.rating}/5`;
//       case 'Financial Contributions':
//         return () => ``;
//       default:
//         return (item) => `${item.rating}`;
//     }
//   };

//   // Navigation handlers
//   const handleOrganizationClick = (organization) => {
//     console.log('Organization clicked:', organization);
//     openDetailPageNewTab(organization, category);
//   };

//   const CATEGORY_TO_SLUG = {
//     'Political Leaning': 'political_leaning',
//     'DEI Friendliness': 'dei_friendliness',
//     'Wokeness': 'wokeness',
//     'Environmental Impact': 'environmental_impact',
//     'Immigration Support': 'immigration_support',
//     'Technology Innovation': 'technology_innovation',
//     'Financial Contributions': 'financial_contributions',
//   };

//   const openDetailPageNewTab = (organization, category) => {
//     localStorage.setItem(`categoryData`, category);
//     localStorage.setItem(`organizationData`, JSON.stringify(organization));
//     const slug = CATEGORY_TO_SLUG[category] ?? category.toLowerCase().replace(/\s+/g, '_');
//     const topic = encodeURIComponent(organization.topic);
//     window.open(`#/organization/${slug}/${topic}`, "_blank", "noreferrer");
//   }

//   const handleNewQueryClick = () => {
//     navigate('query', {
//       state: { current_category: category },
//     });
//   };

//   // Search handlers
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);

//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     if (value.trim() === '') {
//       setSearchResults(null);
//       setSearchLoading(false);
//       return;
//     }

//     setSearchLoading(true);
//     searchTimeoutRef.current = setTimeout(async () => {
//       try {
//         const data = await networkManager.searchPersistedAnswers(category, value.trim());
//         setSearchResults(data.results);
//       } catch (err) {
//         console.error('Search error:', err);
//         setSearchResults([]);
//       } finally {
//         setSearchLoading(false);
//       }
//     }, 400);
//   };

//   const handleSearchClear = () => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
//     setSearchQuery('');
//     setSearchResults(null);
//     setSearchLoading(false);
//   };

//   // Pagination handlers
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Calculate total pages and get current data
//   const totalItems = coerceCount(totalItemsForCategoryCache[category]);
//   // Guard against an unknown/non-numeric count so the UI never shows "of NaN".
//   // Until a real count arrives, fall back to the current page as the floor.
//   const totalPages = totalItems != null && totalItems > 0
//     ? Math.ceil(totalItems / itemsPerPage)
//     : currentPage;
//   const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//   const currentData = dataCache[cacheKey] || [];

//   const isSearchMode = searchQuery.trim().length > 0;
//   const displayData = isSearchMode ? (searchResults || []) : currentData;
//   const displayLoading = isSearchMode ? searchLoading : loading;

//   console.log('Rendering with:', { cacheKey, dataLength: currentData.length, currentData });
//   console.log('   DataCache:', { dataCache });

//   if (error) {
//     return (
//       <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
//         {/* Header with Logo and Dropdown */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
//           <LogoHeader />
//         </div>

//         <div className="flex justify-center items-center min-h-[calc(60vh-120px)] sm:min-h-[60vh] sm:mt-4">
//           <div className="w-full max-w-md mx-auto">
//             <div className="p-4 text-center">
//               <div className="text-gray-800">Error loading data: {error}</div>
//               <button 
//                 className="mt-2 px-4 py-2 bg-gray-200 rounded"
//                 onClick={clearCache}
//               >
//                 Clear Cache and Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   } 

//   return (
//     <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
//       {/* Header with Logo and Dropdown */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
//         <LogoHeader />
//         <CategoryDropdown 
//           category={category}
//           availableCategories={availableCategories}
//           dropdownOpen={dropdownOpen}
//           onToggleDropdown={handleToggleDropdown}
//           onSelectCategory={handleSelectCategory}
//         />
//       </div>
//       <div className="border-t border-gray-300 bg-gray-100 mt-2 pt-6 pb-10">

//         <div className="p-5 mt-2 pt-0 pb-5"> {/* Added bottom padding to prevent overlap */}

//             {/* Search Bar and Sort Controls */}
//             <div className="flex justify-between items-center mb-4 px-4 pb-8 bg-white rounded-lg shadow-sm p-6 mb-6">
//               <SearchBar
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 onClear={handleSearchClear}
//               />
//               {!isSearchMode && (
//                 <SortControls
//                   sortBy={sortBy}
//                   sortOrder={sortOrder}
//                   sortOptions={getSortOptions()}
//                   sortDropdownOpen={sortDropdownOpen}
//                   onToggleSortDropdown={handleToggleSortDropdown}
//                   onSelectSortOption={handleSelectSortOption}
//                   onToggleSortOrder={handleToggleSortOrder}
//                 />
//               )}
//             </div>

//             <div className="py-0 bg-white"></div>


//             <div className="py-0 bg-white bg-white rounded-lg shadow-sm pt-5 p-4 pb-5 ">
//               <CompanyList
//                 data={displayData}
//                 loading={displayLoading}
//                 category={category}
//                 onItemClick={handleOrganizationClick}
//                 getCategoryValueLabel={getCategoryValueLabel}
//               />
//             </div>
//           </div>
//       </div>

//       {/* Pagination Controls - Fixed to bottom with transparent background */}
//       {/* <div className="fixed bottom-0 left-0 right-0 py-10"> */}

//       {!isSearchMode && (
//         <PaginationControls
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPrevPage={handlePrevPage}
//           onNextPage={handleNextPage}
//         />
//       )}
//       {/* </div> */}
//       <FloatingActionButton onClick={handleNewQueryClick} />
//       <Footer />
//     </div>
//   );
// };

// export default MainPage;
 
 
// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import networkManager from './network/NetworkManager';
// import SiteHeader from './components/SiteHeader';
// import Footer from './components/Footer';
// import CategoryDropdown from './components/main/CategoryDropdown';
// import SearchBar from './components/main/SearchBar';
// import SortControls from './components/SortControls.js';
// import CompanyList from './components/main/CompanyList';
// import PaginationControls from './components/PaginationControls.js';
// import FloatingActionButton from './components/main/FloatingActionButton';
// import AdBanner from './components/AdBanner';

// const MainPage = () => {
//   const itemsPerPage = 10;

//   // Initialize dataCache from localStorage if available, otherwise use empty object
//   const [dataCache, setDataCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAIDataCache');
//     return savedCache ? JSON.parse(savedCache) : {};
//   });

//   const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
//     return savedCache ? JSON.parse(savedCache) : {
//       'Political Leaning': 0,
//       'DEI Friendliness': 0,
//       'Wokeness': 0,
//       'Environmental Impact': 0,
//       'Immigration': 0,
//       'Technology Innovation': 0,
//       'Financial Contributions': 0
//     };
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [category, setCategory] = useState(() => {
//     return localStorage.getItem('compassAILastCategory') || 'Political Leaning';
//   });
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [sortBy, setSortBy] = useState('Name');
//   const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
//   const [sortOrder, setSortOrder] = useState('asc');
//   const [currentPage, setCurrentPage] = useState(() => {
//     return parseInt(localStorage.getItem('compassAICurrentPage') || '1', 10);
//   });

//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const searchTimeoutRef = useRef(null);
//   const isMountRef = useRef(true);

//   const navigate = useNavigate();

//   // Available categories for the dropdown
//   const availableCategories = [
//     'Political Leaning',
//     'DEI Friendliness', 
//     'Wokeness',
//     'Environmental Impact',
//     'Immigration Support',
//     'Technology Innovation',
//     'Financial Contributions'
//   ];

//   // Dynamic sort options based on category
//   const getSortOptions = () => {
//     if (category === 'Political Leaning') {
//       return ['Name', 'Liberal lean', 'Conservative lean'];
//     }
//     if (category === 'Financial Contributions') {
//       return ['Name'];
//     }
//     return ['Name', 'Rating'];
//   };

//   useEffect(() => {
//     localStorage.setItem('compassAICurrentPage', String(currentPage));
//   }, [currentPage]);

//   // Save last selected category and fetch initial data
//   useEffect(() => {
//     localStorage.setItem('compassAILastCategory', category);

//     console.log('Category is now:', category);
//     if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
//       fetchTotalItems(category);
//     }

//     // On initial mount, keep the restored page; only reset when the user changes category
//     if (isMountRef.current) {
//       isMountRef.current = false;
//       return;
//     }
//     setCurrentPage(1);
//     setSortBy('Name');
//     setSortOrder('asc');
//   }, [category]);

//   // Fetch total number of items for pagination
//   const fetchTotalItems = async (category) => {
//     try {
//       console.log('Fetching total items for category:', category);
//       const count = await networkManager.getCategoryItemCount(category);
//       console.log('The count:', count);

//       setTotalItemsForCategoryCache(prevCache => ({
//         ...prevCache,
//         [category]: count
//       }));
//     } catch (err) {
//       console.error('Error fetching total items:', err);
//       setError(err.message);
//     }
//   };
 
//   const fetchDataForCategory = async () => {
//     const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//     if (dataCache[cacheKey] != null) {
//       // Data already cached for this category, page, sort, and order.
//       prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
//       return;
//     }
//     try {
//       setLoading(true);
//       console.log(`Fetching data for category: ${category}`);
//       const offset = (currentPage - 1) * itemsPerPage;
//       const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
//       console.log('Data fetched:', jsonData);

//       setDataCache(prevCache => ({
//         ...prevCache,
//         [cacheKey]: jsonData
//       }));

//       prefetchAdjacentPage(currentPage + 1, category, sortBy, sortOrder);
//     } catch (err) {
//       setError(err.message);
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const prefetchAdjacentPage = async (page, cat, sort, order) => {
//     const prefetchKey = `${cat} p${page} ${sort} ${order}`;
//     if (dataCache[prefetchKey] != null) return;
//     try {
//       const offset = (page - 1) * itemsPerPage;
//       const jsonData = await networkManager.getSavedCategoryData(cat, sort, order, itemsPerPage, offset);
//       setDataCache(prevCache => ({
//         ...prevCache,
//         [prefetchKey]: jsonData
//       }));
//     } catch {
//       // Prefetch failure is silent — main fetch will handle it on navigation
//     }
//   };

//   // Fetch data with pagination, sort changes, or category changes
//   useEffect(() => {
//     console.log('Fetching data due to dependency change:', { currentPage, sortBy, sortOrder, category });
//     fetchDataForCategory();
//   }, [currentPage, sortBy, sortOrder, category]);

//   const clearCache = () => {
//     localStorage.removeItem('compassAIDataCache');
//     localStorage.removeItem('compassAILastCategory');
//     localStorage.removeItem('compassAITotalItemsForCategory');
//     localStorage.removeItem('compassAICurrentPage');
//     setDataCache({});
//     setTotalItemsForCategoryCache({
//       'Political Leaning': 0,
//       'DEI Friendliness': 0,
//       'Wokeness': 0,
//       'Environmental Impact': 0,
//       'Financial Contributions': 0
//     });
//     setCategory('Political Leaning');
//     setCurrentPage(1);
//     setSortBy('Name');
//     setSortOrder('asc');
//   };

//   // Category dropdown handlers
//   const handleToggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const handleSelectCategory = (newCategory) => {
//     setCategory(newCategory);
//     setDropdownOpen(false);
//   };

//   // Sort handlers
//   const handleToggleSortDropdown = () => {
//     setSortDropdownOpen(!sortDropdownOpen);
//   };

//   const handleSelectSortOption = (option) => {
//     setSortBy(option);
//     setSortDropdownOpen(false);
//     setCurrentPage(1);
//   };

//   const handleToggleSortOrder = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     setCurrentPage(1);
//   };
  
//   // TODO: Use this method only on Political leaning mode.
//   // @ts-expect-error
//   const getLeaningStyle = (rating, lean) => {
//     const isLiberal = lean.toLowerCase().includes('liberal');
//     const isNeutral = rating == '0';
//     const baseStyle = 'text-right font-medium';

//     if (isNeutral) {
//       return `${baseStyle} ${'text-gray-600'}`;
//     }

//     if (isLiberal) {
//       switch (rating) {
//         case 1:
//           return 'text-blue-100';
//         case 2:
//           return 'text-blue-300';
//         case 3:
//           return 'text-blue-500';
//         case 4:
//           return 'text-blue-700';
//         case 5:
//           return 'text-blue-900';
//         default:
//           return 'text-blue-900'
//       }   
//     } else {
//       switch (rating) {
//         case 1:
//           return 'text-red-100'
//         case 2:
//           return 'text-red-300'
//         case 3:
//           return 'text-red-500'
//         case 4:
//           return 'text-red-700'
//         case 5:
//           return 'text-red-900'
//         default:
//           return 'text-red-900'
//       }
//     }
//   };

//   const getCleanedLeanString = (rating) => {
//     if (!rating) {
//       return 'Neutral'
//     }
//     const isLiberal = rating.toLowerCase().includes('liberal');
//     const isConservative = rating.toLowerCase().includes('conservative');
//     if (isLiberal) {
//       return 'Liberal'
//     }
//     if (isConservative) {
//       return 'Conservative'
//     }
//     return 'Neutral'
//   }

//   const getCategoryValueLabel = () => {
//     switch(category) {
//       case 'Political Leaning':
//         return (item) => `${item.rating} ${getCleanedLeanString(item.lean)}`;
//       case 'DEI Friendliness':
//         return (item) => `${item.rating}/5`;
//       case 'Wokeness':
//         return (item) => `${item.rating}/5`;
//       case 'Financial Contributions':
//         return () => ``;
//       default:
//         return (item) => `${item.rating}`;
//     }
//   };

//   // Navigation handlers
//   const handleOrganizationClick = (organization) => {
//     console.log('Organization clicked:', organization);
//     openDetailPageNewTab(organization, category);
//   };

//   const CATEGORY_TO_SLUG = {
//     'Political Leaning': 'political_leaning',
//     'DEI Friendliness': 'dei_friendliness',
//     'Wokeness': 'wokeness',
//     'Environmental Impact': 'environmental_impact',
//     'Immigration Support': 'immigration_support',
//     'Technology Innovation': 'technology_innovation',
//     'Financial Contributions': 'financial_contributions',
//   };

//   const openDetailPageNewTab = (organization, category) => {
//     localStorage.setItem(`categoryData`, category);
//     localStorage.setItem(`organizationData`, JSON.stringify(organization));
//     const slug = CATEGORY_TO_SLUG[category] ?? category.toLowerCase().replace(/\s+/g, '_');
//     const topic = encodeURIComponent(organization.topic);
//     window.open(`/organization/${slug}/${topic}`, "_blank", "noreferrer");
//   }

//   const handleNewQueryClick = () => {
//     navigate('query', {
//       state: { current_category: category },
//     });
//   };

//   // Search handlers
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);

//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     if (value.trim() === '') {
//       setSearchResults(null);
//       setSearchLoading(false);
//       return;
//     }

//     setSearchLoading(true);
//     searchTimeoutRef.current = setTimeout(async () => {
//       try {
//         const data = await networkManager.searchPersistedAnswers(category, value.trim());
//         setSearchResults(data.results);
//       } catch (err) {
//         console.error('Search error:', err);
//         setSearchResults([]);
//       } finally {
//         setSearchLoading(false);
//       }
//     }, 400);
//   };

//   const handleSearchClear = () => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
//     setSearchQuery('');
//     setSearchResults(null);
//     setSearchLoading(false);
//   };

//   // Pagination handlers
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Calculate total pages and get current data
//   const totalItems = totalItemsForCategoryCache[category];
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//   const currentData = dataCache[cacheKey] || [];

//   const isSearchMode = searchQuery.trim().length > 0;
//   const displayData = isSearchMode ? (searchResults || []) : currentData;
//   const displayLoading = isSearchMode ? searchLoading : loading;
  
//   console.log('Rendering with:', { cacheKey, dataLength: currentData.length, currentData });
//   console.log('   DataCache:', { dataCache });

//   if (error) {
//     return (
//       <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
//         <SiteHeader />
         
//         <div className="flex justify-center items-center min-h-[calc(60vh-120px)] sm:min-h-[60vh] sm:mt-4">
//           <div className="w-full max-w-md mx-auto">
//             <div className="p-4 text-center">
//               <div className="text-gray-800">Error loading data: {error}</div>
//               <button 
//                 className="mt-2 px-4 py-2 bg-gray-200 rounded"
//                 onClick={clearCache}
//               >
//                 Clear Cache and Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   } 

//   return (
//     <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
//       <SiteHeader>
//         <CategoryDropdown
//           category={category}
//           availableCategories={availableCategories}
//           dropdownOpen={dropdownOpen}
//           onToggleDropdown={handleToggleDropdown}
//           onSelectCategory={handleSelectCategory}
//         />
//       </SiteHeader>
//       <AdBanner />
//       <div className="border-t border-gray-300 bg-gray-100 mt-2 pt-6 pb-10">
        
//         <div className="p-5 mt-2 pt-0 pb-5"> {/* Added bottom padding to prevent overlap */}
              
//             {/* Search Bar and Sort Controls */}
//             <div className="flex justify-between items-center mb-4 px-4 pb-8 bg-white rounded-lg shadow-sm p-6 mb-6">
//               <SearchBar
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 onClear={handleSearchClear}
//               />
//               {!isSearchMode && (
//                 <SortControls
//                   sortBy={sortBy}
//                   sortOrder={sortOrder}
//                   sortOptions={getSortOptions()}
//                   sortDropdownOpen={sortDropdownOpen}
//                   onToggleSortDropdown={handleToggleSortDropdown}
//                   onSelectSortOption={handleSelectSortOption}
//                   onToggleSortOrder={handleToggleSortOrder}
//                 />
//               )}
//             </div>

//             <div className="py-0 bg-white"></div>


//             <div className="py-0 bg-white bg-white rounded-lg shadow-sm pt-5 p-4 pb-5 ">
//               <CompanyList
//                 data={displayData}
//                 loading={displayLoading}
//                 category={category}
//                 onItemClick={handleOrganizationClick}
//                 getCategoryValueLabel={getCategoryValueLabel}
//               />
//             </div>
//           </div>
//       </div>

//       {/* Pagination Controls - Fixed to bottom with transparent background */}
//       {/* <div className="fixed bottom-0 left-0 right-0 py-10"> */}

//       {!isSearchMode && (
//         <PaginationControls
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPrevPage={handlePrevPage}
//           onNextPage={handleNextPage}
//         />
//       )}
//       {/* </div> */}
//       <FloatingActionButton onClick={handleNewQueryClick} />
//       <Footer />
//     </div>
//   );
// };

// export default MainPage;
