// TODO: Make search work.

import { useState, useEffect } from 'react';
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
import SearchPopup from './components/main/SearchPopup';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  
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
    const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
    if (dataCache[cacheKey] != null) {
      // Data already cached for this category, page, sort, and order.
      return;
    }
    try {
      setLoading(true);
      console.log(`Fetching data for category: ${category}`);
      const offset = (currentPage - 1) * itemsPerPage;
      const jsonData = await networkManager.getSavedCategoryData(category, sortBy, sortOrder, itemsPerPage, offset);
      console.log('Data fetched:', jsonData);
      
      setDataCache(prevCache => ({
        ...prevCache,
        [cacheKey]: jsonData
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

  // Category dropdown handlers
  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectCategory = (newCategory) => {
    setCategory(newCategory);
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

  const openDetailPageNewTab = (organization, category) => {
    localStorage.setItem(`categoryData`, category);
    localStorage.setItem(`organizationData`, JSON.stringify(organization));
    window.open('#/organization', "_blank", "noreferrer");
  }

  const handleNewQueryClick = () => {
    navigate('query', {
      state: { current_category: category },
    });
  };

  // Search handlers
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      setShowSearchPopup(true);
      setTimeout(() => {
        setShowSearchPopup(false);
      }, 3000);
    }
  };

  const handleCloseSearchPopup = () => {
    setShowSearchPopup(false);
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
  const totalItems = totalItemsForCategoryCache[category];
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const cacheKey = `${category} p${currentPage} ${sortBy} ${sortOrder}`;
  const currentData = dataCache[cacheKey] || [];
  
  console.log('Rendering with:', { cacheKey, dataLength: currentData.length, currentData });
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
              <SearchBar onKeyPress={handleSearchKeyPress} />
              <SortControls 
                sortBy={sortBy}
                sortOrder={sortOrder}
                sortOptions={getSortOptions()}
                sortDropdownOpen={sortDropdownOpen}
                onToggleSortDropdown={handleToggleSortDropdown}
                onSelectSortOption={handleSelectSortOption}
                onToggleSortOrder={handleToggleSortOrder}
              />
            </div>
      
            <div className="py-0 bg-white"></div>

          
            <div className="py-0 bg-white bg-white rounded-lg shadow-sm pt-5 p-4 pb-5 ">
              <CompanyList 
                data={currentData}
                loading={loading}
                category={category}
                onItemClick={handleOrganizationClick}
                getCategoryValueLabel={getCategoryValueLabel}
              />
            </div>
      
            <SearchPopup 
              isOpen={showSearchPopup}
              onClose={handleCloseSearchPopup}
            />
          </div>
      </div>

      {/* Pagination Controls - Fixed to bottom with transparent background */}
      {/* <div className="fixed bottom-0 left-0 right-0 py-10"> */}
      
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      /> 
      {/* </div> */}
      <FloatingActionButton onClick={handleNewQueryClick} />
      <Footer />
    </div>
  );
};

export default MainPage;
