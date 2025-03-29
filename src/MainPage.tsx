import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('Political Leaning');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // @ts-expect-error
  const ENVIRONMENT_BASE_URL = import.meta.env.VITE_BASE_URL
  // const ENVIRONMENT_BASE_URL = 'http://127.0.0.1:8000'

  const categoryEndpoints = {
    'Political Leaning': ENVIRONMENT_BASE_URL + '/getCachedPoliticalLeanings',
    'DEI Friendliness': ENVIRONMENT_BASE_URL + '/getCachedDEIScores',
    'Wokeness': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
    'Financial Contributions': ENVIRONMENT_BASE_URL + '/getCachedFinancialContributions'
  };

  useEffect(() => {
    console.log('With base URL: ', ENVIRONMENT_BASE_URL);
    console.log('Fetching data for category:', category);
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
    // Set to empty before each request.
    setData([])
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

        <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* <svg width="40" height="40" viewBox="0 0 100 100" xmlns="assets/compass_pic.png"> */}
          <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="black" strokeWidth="1" />
          <circle cx="50" cy="50" r="4" fill="black" />
          
          {/* North-South needle */}
          <path d="M50 15 L54 45 L50 50 L46 45 Z" fill="black" />
          <path d="M50 85 L54 55 L50 50 L46 55 Z" fill="white" stroke="black" strokeWidth="1" />
          
          {/* Directional markers */}
          <text x="50" y="20" textAnchor="middle" fontSize="10" fontWeight="bold">N</text>
          <text x="50" y="85" textAnchor="middle" fontSize="10" fontWeight="bold">S</text>
          <text x="85" y="52" textAnchor="middle" fontSize="10" fontWeight="bold">E</text>
          <text x="15" y="52" textAnchor="middle" fontSize="10" fontWeight="bold">W</text>
          
          {/* Tick marks */}
          {Array.from({length: 36}).map((_, i) => (
            <line 
              key={i}
              x1={50 + 38 * Math.sin(i * 10 * Math.PI / 180)}
              y1={50 - 38 * Math.cos(i * 10 * Math.PI / 180)}
              x2={50 + 42 * Math.sin(i * 10 * Math.PI / 180)}
              y2={50 - 42 * Math.cos(i * 10 * Math.PI / 180)}
              stroke="black"
              strokeWidth="1"
            />
          ))}
        </svg>


        <h1 className="text-4xl font-bold text-black">Compass AI</h1>
        
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
              onClick={(event) => handleOrganizationClick(event, item, category)}
            >
              <div className="font-medium">
                {item.topic}
              </div>
              {/* <div className={getLeaningStyle(item.rating, item.lean)}>
                {getCategoryValueLabel()(item)}
              </div> */}
              <div className='text-right font-medium text-gray-600'> 
                {/* {getLeaningStyle(item.rating, item.lean)} */}
                {getCategoryValueLabel()(item)}
              </div>
            </div>
          ))}
        </div>

        {/* Temporarily disable the new company/indiviudal response button until this is corerctly wired up on the backed. */}
        {/* TODO: Make the backend for this work on financial contributions. */}
        {category !== 'Financial Contributions' && (
          <div className="fixed bottom-6 right-6">
            <button 
              className="w-14.5 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
              onClick={(event) => handleNewQueryClick(event)}
            >
              <Plus size={60} />
            </button>
          </div>
        )}

        {/* Empty Placeholder to allow scrolling past the (+) button */}
        <div className="py-10"></div>

      </CardContent>
    </Card>
  );
};

export default MainPage;