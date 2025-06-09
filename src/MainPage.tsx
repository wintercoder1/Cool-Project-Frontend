// TODO: Make search work.

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import networkManager from './network/NetworkManager.js';
import LogoHeader from './components/LogoHeader';
// @ts-expect-error
import checkmark_logo from './assets/blue_checkmark_logo.png';

const MainPage = () => {
  const itemsPerPage = 10;

  // Initialize dataCache from localStorage if available, otherwise use empty object
  const [dataCache, setDataCache] = useState(() => {
    const savedCache = localStorage.getItem('compassAIDataCache');
    return savedCache ? JSON.parse(savedCache) : {};
  });

  const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
    const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
      return savedCache ? JSON.parse(savedCache) : {
        'Political Leaning': 0,
        'DEI Friendliness': 0,
        'Wokeness': 0,
        'Environmental Impact': 0,
        'Immigration': 0,
        'Technology Innovation':0,
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
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Search popup state
  const [showSearchPopup, setShowSearchPopup] = useState(false);

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

  // Save last selected category and fetch initial data
  useEffect(() => {
    localStorage.setItem('compassAILastCategory', category);
    
    // Fetch the total count for the new category
    console.log('Category is now:', category);
    if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
      fetchTotalItems(category);
    }
    // Reset to page 1 when category changes
    setCurrentPage(1);
    // Reset sort parameters when category changes
    setSortBy('Name');
    setSortOrder('asc');
    
    // Always fetch data when category changes
    // We'll let the fetchDataForCategory useEffect handle the actual fetching
  }, [category]);

  // Fetch total number of items for pagination
  const fetchTotalItems = async (category) => {
    try {
      console.log('Fetching total items for category:', category);
      const count = await networkManager.getCategoryItemCount(category);
      console.log('The count:', count);

      setTotalItemsForCategoryCache(prevCache => ({
        ...prevCache,
        [category]: count
      }));

    } catch (err) {
      console.error('Error fetching total items:', err);
      setError(err.message);
    }
  };
 
  const fetchDataForCategory = async () => {
    if (dataCache[`${category} p${currentPage}`] == null) {
      setLoading(true);
    }
    const offset = (currentPage - 1) * itemsPerPage;
    
    try {
      console.log(`Fetching data for category: ${category}`);
      
      const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
      console.log('Data fetched:', jsonData);
      
      setDataCache(prevCache => ({
        ...prevCache,
        // [`${category} p${currentPage}`]: jsonData
        [`${category} p${currentPage} ${sortBy} ${sortOrder}`]: jsonData
      }));
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data with pagination, sort changes, or category changes
  useEffect(() => {
    console.log('Fetching data due to dependency change:', { currentPage, sortBy, sortOrder, category });
    fetchDataForCategory();
  }, [currentPage, sortBy, sortOrder, category]);

  const clearCache = () => {
    localStorage.removeItem('compassAIDataCache');
    localStorage.removeItem('compassAILastCategory');
    localStorage.removeItem('compassAITotalItemsForCategory');
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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const selectCategory = (newCategory) => {
    setCategory(newCategory);
    setDropdownOpen(false);
  };

  const toggleSortDropdown = () => {
    setSortDropdownOpen(!sortDropdownOpen);
  };

  const selectSortOption = (option) => {
    setSortBy(option);
    setSortDropdownOpen(false);
    // Reset to page 1 when sort changes
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    // Reset to page 1 when sort order changes
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
    }
    else {
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

  // Remove the getSortedData function since we're using API sorting
  // Sort the current data based on selected criteria - NOT NEEDED ANYMORE

  const handleOrganizationClick = (event, organization, category) => {
    console.log(event)
    // TODO: Make this open on current tab not on a new one.
    openDetailPageNewTab(organization, category)
    // openDetailPageCurrentTab(organization, category)
  };

  // TODO: Make this use navigation state not loca storage. Be more consistent with the way it is passed
  // Through the rest of the app.
  const openDetailPageNewTab = (organization, category) => {
    localStorage.setItem(`organizationData`, JSON.stringify(organization));
    localStorage.setItem(`categoryData`, category);
    window.open('#/organization', "_blank", "noreferrer");
  }

  // TODO: This is wrong. Do this the correct way.
  // const openDetailPageCurrentTab = (organization, category) => {
  //   localStorage.setItem(`organizationData`, JSON.stringify(organization));
  //   localStorage.setItem(`categoryData`, category);
  //   navigate('organization', {
  //       state: {current_category: category},
  //   });
  // }

  const handleNewQueryClick = (event) => {
    console.log(event)
    openNewQueryPageCurrentTab()
  };

  const openNewQueryPageCurrentTab = () => {
    navigate('query', {
        state: {current_category: category},
    });
  };

  // Handle search enter key press
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      setShowSearchPopup(true);
      // Auto-hide the popup after 3 seconds
      setTimeout(() => {
        setShowSearchPopup(false);
      }, 3000);
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      currentData =  [];
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate total pages
  const totalItems = totalItemsForCategoryCache[category]
  let totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get the data for the current category from the cache (no client-side sorting needed)
  const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
  let currentData = dataCache[cacheKey] || [];
  
  console.log('Rendering with:', { cacheKey, dataLength: currentData.length, currentData });
  console.log('   DataCache:', {dataCache});
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="p-4">
          <div className="text-red-500">Error loading data: {error}</div>
          {/* Optional: Add a button to clear cache if there's an error */}
          <button 
            className="mt-2 px-4 py-2 bg-gray-200 rounded"
            onClick={clearCache}
          >
            Clear Cache and Retry
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className="absolute top-2  w-screen mx-auto min-h-screen bg-white">
      {/* Header with Logo and Dropdown */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        
        {/* Logo */}
        <LogoHeader />

        {/* Category Dropdown */}
        <div className="relative mt-4 sm:mt-0 flex justify-center sm:justify-end">
          <button 
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
            onClick={toggleDropdown}
          >
            {category} <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
              {availableCategories.map((cat) => (
                <div 
                  key={cat} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 mt-2">
        {/* Search Bar and Sort Controls */}
        <div className="flex justify-between items-center mb-4 px-4">
          {/* Search Bar */}
          <div className="flex-1 mr-6">
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              onKeyPress={handleSearchKeyPress}
            />
          </div> 
          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            
            {/* Sort By Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 min-w-[120px] justify-between"
                onClick={toggleSortDropdown}
              >
                {sortBy} <ChevronDown size={16} />
              </button>
              
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {getSortOptions().map((option) => (
                    <div 
                      key={option} 
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                        sortBy === option ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                      onClick={() => selectSortOption(option)}
                    >
                      {sortBy === option && <span className="mr-2">✓</span>}
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Order Toggle */}
            <button 
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={toggleSortOrder}
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
                {sortOrder === 'asc' ? '↑': '↓'}
              </span>
            </button>
          </div>
        </div>

        <div className="py-0"></div>
        
        <div className="space-y-2 px-4">
          {currentData.map((item, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-4 border rounded cursor-pointer hover:bg-gray-50"
              onClick={(event) => handleOrganizationClick(event, item, category)}
            >
              <div className="font-medium">
                {item.topic}
              </div>
              <div className='text-right font-medium text-gray-600'> 
                {getCategoryValueLabel()(item)}
              </div>
            </div>
          ))}
        </div>

        {/* Show a message when no data is available */}
        {(currentData.length === 0 && !loading) && (
          <div className="py-4 text-center text-gray-500">
            <br/>
            <br/>
            <br/>
            <br/>
            No data available
          </div>
        )}

        {loading && (
          <div className="py-4 text-center text-gray-500">
            <br/>
            <br/>
            <br/>
            <br/>
            Loading data...
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6 mb-16">
          <button 
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-md transition-colors ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-gray-100 text-blue-500 hover:bg-blue-50 touch-manipulation'
              }`}
            >
            <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
              <ChevronLeft size={20} width={20} height={20}/>
            </span>
          </button>
          
          <span className="mx-4 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md transition-colors ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-gray-100 text-blue-500 hover:bg-blue-50 active:bg-blue-100 touch-manipulation'
              }`}
            >
            <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
              <ChevronRight size={20} width={20} height={20}/>
            </span>
          </button>
        </div>

        {/* New company/individual response button */}
        <div className="fixed bottom-6 right-8">
          <button 
            className="w-14 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
            onClick={(event) => handleNewQueryClick(event)}
          >
            <Plus size={50} />
          </button>
        </div>

        {/* Search Popup */}
        {showSearchPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Search coming soon!!
                </h3>
                <button
                  onClick={() => setShowSearchPopup(false)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MainPage;

// // TODO: Make search work.

// import { useState, useEffect } from 'react';
// import { Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import networkManager from './network/NetworkManager.js';
// import LogoHeader from './components/LogoHeader';
// // @ts-expect-error
// import checkmark_logo from './assets/blue_checkmark_logo.png';

// const MainPage = () => {
//   const itemsPerPage = 10;

//   // Initialize dataCache from localStorage if available, otherwise use empty object
//   const [dataCache, setDataCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAIDataCache');
//     return savedCache ? JSON.parse(savedCache) : {};
//   });

//   const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
//     const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
//       return savedCache ? JSON.parse(savedCache) : {
//         'Political Leaning': 0,
//         'DEI Friendliness': 0,
//         'Wokeness': 0,
//         'Environmental Impact': 0,
//         'Immigration': 0,
//         'Technology Innovation':0,
//         'Financial Contributions': 0
//       };
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
//   const navigate = useNavigate();

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);

//   // Search popup state
//   const [showSearchPopup, setShowSearchPopup] = useState(false);

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

//   // Available sort options
//   const sortOptions = ['Name', 'Rating'];

//   // Save last selected category and fetch initial data
//   useEffect(() => {
//     localStorage.setItem('compassAILastCategory', category);
    
//     // Fetch the total count for the new category
//     console.log('Category is now:', category);
//     if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
//       fetchTotalItems(category);
//     }
//     // Reset to page 1 when category changes
//     setCurrentPage(1);
//     // Reset sort parameters when category changes
//     setSortBy('Name');
//     setSortOrder('asc');
    
//     // Always fetch data when category changes
//     // We'll let the fetchDataForCategory useEffect handle the actual fetching
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
//     if (dataCache[`${category} p${currentPage}`] == null) {
//       setLoading(true);
//     }
//     const offset = (currentPage - 1) * itemsPerPage;
    
//     try {
//       console.log(`Fetching data for category: ${category}`);
      
//       const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
//       console.log('Data fetched:', jsonData);
      
//       setDataCache(prevCache => ({
//         ...prevCache,
//         // [`${category} p${currentPage}`]: jsonData
//         [`${category} p${currentPage} ${sortBy} ${sortOrder}`]: jsonData
//       }));
      
//     } catch (err) {
//       setError(err.message);
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
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

//   const toggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const selectCategory = (newCategory) => {
//     setCategory(newCategory);
//     setDropdownOpen(false);
//   };

//   const toggleSortDropdown = () => {
//     setSortDropdownOpen(!sortDropdownOpen);
//   };

//   const selectSortOption = (option) => {
//     setSortBy(option);
//     setSortDropdownOpen(false);
//     // Reset to page 1 when sort changes
//     setCurrentPage(1);
//   };

//   const toggleSortOrder = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     // Reset to page 1 when sort order changes
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
//     }
//     else {
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

//   // Remove the getSortedData function since we're using API sorting
//   // Sort the current data based on selected criteria - NOT NEEDED ANYMORE

//   const handleOrganizationClick = (event, organization, category) => {
//     console.log(event)
//     // TODO: Make this open on current tab not on a new one.
//     openDetailPageNewTab(organization, category)
//     // openDetailPageCurrentTab(organization, category)
//   };

//   // TODO: Make this use navigation state not loca storage. Be more consistent with the way it is passed
//   // Through the rest of the app.
//   const openDetailPageNewTab = (organization, category) => {
//     localStorage.setItem(`organizationData`, JSON.stringify(organization));
//     localStorage.setItem(`categoryData`, category);
//     window.open('#/organization', "_blank", "noreferrer");
//   }

//   // TODO: This is wrong. Do this the correct way.
//   // const openDetailPageCurrentTab = (organization, category) => {
//   //   localStorage.setItem(`organizationData`, JSON.stringify(organization));
//   //   localStorage.setItem(`categoryData`, category);
//   //   navigate('organization', {
//   //       state: {current_category: category},
//   //   });
//   // }

//   const handleNewQueryClick = (event) => {
//     console.log(event)
//     openNewQueryPageCurrentTab()
//   };

//   const openNewQueryPageCurrentTab = () => {
//     navigate('query', {
//         state: {current_category: category},
//     });
//   };

//   // Handle search enter key press
//   const handleSearchKeyPress = (event) => {
//     if (event.key === 'Enter') {
//       setShowSearchPopup(true);
//       // Auto-hide the popup after 3 seconds
//       setTimeout(() => {
//         setShowSearchPopup(false);
//       }, 3000);
//     }
//   };

//   // Pagination handlers
//   const goToNextPage = () => {
//     if (currentPage < totalPages) {
//       currentData =  [];
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const goToPrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Calculate total pages
//   const totalItems = totalItemsForCategoryCache[category]
//   let totalPages = Math.ceil(totalItems / itemsPerPage);

//   // Get the data for the current category from the cache (no client-side sorting needed)
//   const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
//   let currentData = dataCache[cacheKey] || [];
  
//   console.log('Rendering with:', { cacheKey, dataLength: currentData.length, currentData });
//   console.log('   DataCache:', {dataCache});
//   if (error) {
//     return (
//       <div className="w-full max-w-md mx-auto">
//         <div className="p-4">
//           <div className="text-red-500">Error loading data: {error}</div>
//           {/* Optional: Add a button to clear cache if there's an error */}
//           <button 
//             className="mt-2 px-4 py-2 bg-gray-200 rounded"
//             onClick={clearCache}
//           >
//             Clear Cache and Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return(
//     <div className="absolute top-2  w-screen mx-auto min-h-screen bg-white">
//       {/* Header with Logo and Dropdown */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        
//         {/* Logo */}
//         <LogoHeader />

//         {/* Category Dropdown */}
//         <div className="relative mt-4 sm:mt-0 flex justify-center sm:justify-end">
//           <button 
//             className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
//             onClick={toggleDropdown}
//           >
//             {category} <ChevronDown size={16} />
//           </button>
          
//           {dropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
//               {availableCategories.map((cat) => (
//                 <div 
//                   key={cat} 
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                   onClick={() => selectCategory(cat)}
//                 >
//                   {cat}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="p-4 mt-2">
//         {/* Search Bar and Sort Controls */}
//         <div className="flex justify-between items-center mb-4 px-4">
//           {/* Search Bar */}
//           <div className="flex-1 mr-6">
//             <input
//               type="text"
//               placeholder="Search companies..."
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
//               onKeyPress={handleSearchKeyPress}
//             />
//           </div> 
//           {/* Sort Controls */}
//           <div className="flex items-center gap-3">
//             <span className="text-sm text-gray-600">Sort by:</span>
            
//             {/* Sort By Dropdown */}
//             <div className="relative">
//               <button 
//                 className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 min-w-[120px] justify-between"
//                 onClick={toggleSortDropdown}
//               >
//                 {sortBy} <ChevronDown size={16} />
//               </button>
              
//               {sortDropdownOpen && (
//                 <div className="absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                   {sortOptions.map((option) => (
//                     <div 
//                       key={option} 
//                       className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
//                         sortBy === option ? 'bg-blue-50 text-blue-600' : ''
//                       }`}
//                       onClick={() => selectSortOption(option)}
//                     >
//                       {sortBy === option && <span className="mr-2">✓</span>}
//                       {option}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Sort Order Toggle */}
//             <button 
//               className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
//               onClick={toggleSortOrder}
//               title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
//             >
//               <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
//                 {sortOrder === 'asc' ? '↑': '↓'}
//               </span>
//             </button>
//           </div>
//         </div>

//         <div className="py-0"></div>
        
//         <div className="space-y-2 px-4">
//           {currentData.map((item, index) => (
//             <div 
//               key={index}
//               className="flex justify-between items-center p-4 border rounded cursor-pointer hover:bg-gray-50"
//               onClick={(event) => handleOrganizationClick(event, item, category)}
//             >
//               <div className="font-medium">
//                 {item.topic}
//               </div>
//               <div className='text-right font-medium text-gray-600'> 
//                 {getCategoryValueLabel()(item)}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Show a message when no data is available */}
//         {(currentData.length === 0 && !loading) && (
//           <div className="py-4 text-center text-gray-500">
//             <br/>
//             <br/>
//             <br/>
//             <br/>
//             No data available
//           </div>
//         )}

//         {loading && (
//           <div className="py-4 text-center text-gray-500">
//             <br/>
//             <br/>
//             <br/>
//             <br/>
//             Loading data...
//           </div>
//         )}

//         {/* Pagination Controls */}
//         <div className="flex justify-center items-center mt-6 mb-16">
//           <button 
//             onClick={goToPrevPage}
//             disabled={currentPage === 1}
//             className={`p-2 rounded-md transition-colors ${
//               currentPage === 1 
//                 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
//                 : 'bg-gray-100 text-blue-500 hover:bg-blue-50 touch-manipulation'
//               }`}
//             >
//             <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
//               <ChevronLeft size={20} width={20} height={20}/>
//             </span>
//           </button>
          
//           <span className="mx-4 text-sm">
//             Page {currentPage} of {totalPages}
//           </span>
          
//           <button 
//             onClick={goToNextPage}
//             disabled={currentPage === totalPages}
//             className={`p-2 rounded-md transition-colors ${
//               currentPage === totalPages 
//                 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
//                 : 'bg-gray-100 text-blue-500 hover:bg-blue-50 active:bg-blue-100 touch-manipulation'
//               }`}
//             >
//             <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
//               <ChevronRight size={20} width={20} height={20}/>
//             </span>
//           </button>
//         </div>

//         {/* New company/individual response button */}
//         <div className="fixed bottom-6 right-8">
//           <button 
//             className="w-14 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
//             onClick={(event) => handleNewQueryClick(event)}
//           >
//             <Plus size={50} />
//           </button>
//         </div>

//         {/* Search Popup */}
//         {showSearchPopup && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
//               <div className="text-center">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                   Search coming soon!!
//                 </h3>
//                 <button
//                   onClick={() => setShowSearchPopup(false)}
//                   className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//                 >
//                   OK
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default MainPage;
