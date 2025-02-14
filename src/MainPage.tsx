import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { useNavigate} from 'react-router-dom';



const MainPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Page loaded?')
    const fetchData = async () => {
      try {
        const response = await fetch('http://18.188.2.109:443/getCachedPolitcalLeanings');
        // const response = await fetch('http://127.0.0.1:8000/getCachedPolitcalLeanings');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        console.log('data fetched:')
        console.log(jsonData)
        setData(jsonData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

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
    return `${baseStyle} ${isLiberal ? 'text-blue-600' : 'text-red-600'}`;
  };

  // Combine this with the above function for one combined function.
  const getCleanedLeanString = (rating) => {
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

  const handleOrganizationClick = (event, organization) => {
    console.log(event)
    // openDetailPageCurrentTab(organization)
    openDetailPageNewTab(organization)
  };

  const openDetailPageCurrentTab = (organization) => {
    navigate('organization', { state: organization});
  };

  const openDetailPageNewTab = (organization) => {
    // topic = `organization${organization.topic}`
    localStorage.setItem(`organizationData`, JSON.stringify(organization));
    {/* The hastag is for hash router */ }
    window.open('/#organization', "_blank", "noreferrer");
    // window.open('organization', "_blank", "noreferrer");
  }

  const handleNewQueryClick = (event) => {
    console.log(event)
    openNewQueryPageCurrentTab()
  };

  const openNewQueryPageCurrentTab = () => {
    navigate('query', {});
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
      {/* Logo */}
      <div className="absolute top-5 left-8">
          <h1 className="text-4xl font-bold text-black">CompassAI</h1>
        </div>
      <CardContent className="p-4">

        {/* Empty PLaceholder */}
        <div className="py-8">  </div>
        

        <div className="space-y-2">
          {data.map((item, index) => (
            <div 
                key={index}
                className="flex justify-between items-center p-2 border rounded"
                onClick={ (event) => handleOrganizationClick(event, item)}
              >
                <div className="font-medium">
                  {item.topic}
                </div>
                <div className={getLeaningStyle(item.rating, item.lean)}>
                  {item.rating} {getCleanedLeanString(item.lean)}
                </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button 
            className="w-22 h-22 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
            onClick={(event) => handleNewQueryClick(event)}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Empty PLaceholder This one is to allow the user to scroll up to let the content pass the (+) button. */}
        <div className="py-8">  </div>

      </CardContent>

    </Card>
  );
};


export default MainPage;