import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// @ts-expect-error
import checkmark_logo from './assets/blue_checkmark_logo.png';

const MainPage = () => {

  const itemsPerPage = 15;

  // @ts-expect-error
  // const ENVIRONMENT_BASE_URL = import.meta.env.VITE_BASE_URL
  const ENVIRONMENT_BASE_URL = 'http://127.0.0.1:8000'


  // Initialize dataCache from localStorage if available, otherwise use empty arrays
  const [dataCache, setDataCache] = useState(() => {
    const savedCache = localStorage.getItem('compassAIDataCache');
    return savedCache ? JSON.parse(savedCache) : {
      'Political Leaning p0': [],
      'DEI Friendliness p0': [],
      'Wokeness p0': [],
      'Environmental Impact p0': [],
      'Financial Contributions p0': []
    };
  });


  const [totalItemsForCategoryCache, setTotalItemsForCategoryCache] = useState(() => {
    const savedCache = localStorage.getItem('compassAITotalItemsForCategory');
      return savedCache ? JSON.parse(savedCache) : {
        'Political Leaning': 0,
        'DEI Friendliness': 0,
        'Wokeness': 0,
        'Environmental Impact': 0,
        'Financial Contributions': 0
      };
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(() => {
    return localStorage.getItem('compassAILastCategory') || 'Political Leaning';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalItems, setTotalItems] = useState(0);
  
  const categoryEndpoints = {
    'Political Leaning': ENVIRONMENT_BASE_URL + '/getCachedPoliticalLeanings',
    'DEI Friendliness': ENVIRONMENT_BASE_URL + '/getCachedDEIScores',
    'Wokeness': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
    'Environmental Impact': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
    'Financial Contributions': ENVIRONMENT_BASE_URL + '/getCachedFinancialContributions'
  };

  // Save last selected category
  useEffect(() => {
    localStorage.setItem('compassAILastCategory', category);
    
    // set totalpage count to zero when changing categories
    // setTotalItems(0)
    // Fetch the total count for the new category
    console.log('Category is now:', category);
    if (totalItemsForCategoryCache[category] == 0 || totalItemsForCategoryCache[category] == null) {
      fetchTotalItems(category);
    }
    // Reset to page 1 when category changes
    setCurrentPage(1);
    const category_first_page = category + ' p0'
    if (dataCache[category_first_page] == 0 || dataCache[category_first_page] == null) {
      fetchDataForCategory();
    }
  }, [category]);

  // Fetch total number of items for pagination
  const fetchTotalItems = async (category) => {
    try {
      const category_upper = category.toUpperCase()
      const endpoint = `${ENVIRONMENT_BASE_URL}/getNumberOfTopics?queryType=${category_upper}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch total items');
      }
      
      console.log('Total count data fetched:', response);

      const data = await response.json();
      console.log('Total count data fetched:', data);
      const count = data[0]
      console.log('The count :', count);
      // setTotalItems(count);

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
    // 
    if ( dataCache[`${category} p${currentPage}`] == null) {
      setLoading(true);
    }
    const offset = (currentPage - 1) * itemsPerPage;
    
    try {
      const endpoint = `${categoryEndpoints[category]}?limit=${itemsPerPage}&offset=${offset}`;
      console.log(`Fetching data for category: ${category} from ${endpoint}`);
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const jsonData = await response.json();
      console.log('Data fetched:', jsonData);
      
      setDataCache(prevCache => ({
        ...prevCache,
        [`${category} p${currentPage}`]: jsonData
      }));
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data with pagination
  useEffect(() => {
    fetchDataForCategory();
  }, [currentPage]);

  const clearCache = () => {
    localStorage.removeItem('compassAIDataCache');
    localStorage.removeItem('compassAILastCategory');
    localStorage.removeItem('compassAITotalItemsForCategory');
    setDataCache({
      'Political Leaning p1': [],
      'DEI Friendliness p1': [],
      'Wokeness p1': [],
      'Environmental Impact p1': [],
      'Financial Contributions p1': []
    });
    setTotalItemsForCategoryCache({
      'Political Leaning': 0,
      'DEI Friendliness': 0,
      'Wokeness': 0,
      'Environmental Impact': 0,
      'Financial Contributions': 0
    });
    setCategory('Political Leaning');
    setCurrentPage(1);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const selectCategory = (newCategory) => {
    setCategory(newCategory);
    setDropdownOpen(false);
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

  const handleOrganizationClick = (event, organization, category) => {
    console.log(event)
    openDetailPageNewTab(organization, category)
    // openDetailPageCurrnetTab(organization, category)
  };

  const openDetailPageNewTab = (organization, category) => {
    localStorage.setItem(`organizationData`, JSON.stringify(organization));
    localStorage.setItem(`categoryData`, category);
    window.open('#/organization', "_blank", "noreferrer");
  }

  const handleNewQueryClick = (event) => {
    console.log(event)
    openNewQueryPageCurrentTab()
  };

  const openNewQueryPageCurrentTab = () => {
    navigate('query', {
        state: {current_category: category},
    });
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

  // Get the data for the current category from the cache
  let currentData = dataCache[`${category} p${currentPage}`] || [];

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

        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <img src={checkmark_logo} className="block" width="55" height="55" alt="blue_check_logo" />
          <h1 className="text-4xl font-bold text-black">MoralCheck AI</h1>
        </div>

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
              {Object.keys(categoryEndpoints).map((cat) => (
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
        <div className="py-0"></div>
        
        <div className="space-y-2 px-4">
          {currentData.map((item, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
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
        {(currentData.length === 0 || loading) && (
          <div className="py-4 text-center text-gray-500">
            <br/>
            <br/>
            <br/>
            <br/>
            {loading ? "Loading data..." : "No data available"}
          </div>
        )}


        {/* Pagination Controls */}
        {/* {totalItems > 0 && ( */}
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
        {/* )} */}
        

        {/* New company/individual response button */}
        {category !== 'Financial Contributions' && (
          <div className="fixed bottom-6 right-8">
            <button 
              className="w-14 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
              onClick={(event) => handleNewQueryClick(event)}
            >
              <Plus size={50} />
            </button>
          </div>
        )}

      </div>
    </div>
  );

};

export default MainPage;