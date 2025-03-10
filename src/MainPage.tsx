import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MainPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('Political Leaning');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const ENVIRONMENT_BASE_URL = 'http://127.0.0.1:8000'
  //const  ENVIRONMENT_BASE_URL = 'http://18.188.2.109:443'

  const categoryEndpoints = {
    'Political Leaning': ENVIRONMENT_BASE_URL + '/getCachedPolitcalLeanings',
    'DEI Friendliness': ENVIRONMENT_BASE_URL + '/getCachedDEIScores',
    'Wokeness': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores'
  };

  useEffect(() => {
    console.log('Fetching data for category:', category);
    // Set to empty before each request.
    // if (location && location.state && location.state.current_category) {
    //   setCategory(location.state.current_category);
    // }
    const fetchData = async () => {
      try {
        const endpoint = categoryEndpoints[category];
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        console.log('Data fetched:', jsonData);
        setData(jsonData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [category]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const selectCategory = (newCategory) => {
    setCategory(newCategory);
    setData([])
    setDropdownOpen(false);
  };

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
      default:
        return (item) => `${item.rating}`;
    }
  };

  const handleOrganizationClick = (event, organization) => {
    console.log(event)
    openDetailPageNewTab(organization)
  };

  const openDetailPageNewTab = (organization) => {
    localStorage.setItem(`organizationData`, JSON.stringify(organization));
    window.open('/#organization', "_blank", "noreferrer");
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

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="text-red-500">Error loading data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="px-5 w-screen mx-auto bg-white">
      {/* Header with Logo and Dropdown */}
      <div className="flex justify-between items-center pt-5 px-8">
        <h1 className="text-4xl font-bold text-black">CompassAI</h1>
        
        {/* Category Dropdown */}
        <div className="relative">
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

      <CardContent className="p-4">
        <div className="py-4"></div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
              onClick={(event) => handleOrganizationClick(event, item)}
            >
              <div className="font-medium">
                {item.topic}
              </div>
              {/* <div className={getLeaningStyle(item.rating, item.lean)}>
                {getCategoryValueLabel()(item)}
              </div> */}
              <div className='text-right font-medium text-gray-600'> 
              {/* {getLeaningStyle(item.rating, item.lean)}> */}
                {getCategoryValueLabel()(item)}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button 
            className="w-14.5 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
            onClick={(event) => handleNewQueryClick(event)}
          >
            <Plus size={60} />
          </button>
        </div>

        {/* Empty Placeholder to allow scrolling past the (+) button */}
        <div className="py-10"></div>

      </CardContent>
    </Card>
  );
};

export default MainPage;