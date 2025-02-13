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
        // const response = await fetch('http://18.188.2.109:443/getCachedPolitcalLeanings');
        const response = await fetch('http://127.0.0.1:8000/getCachedPolitcalLeanings');
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
    const baseStyle = 'text-right font-medium';
    
    return `${baseStyle} ${isLiberal ? 'text-blue-600' : 'text-red-600'}`;
  };

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
    window.open('organization', "_blank", "noreferrer");
  }

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

      <CardContent className="p-4">

        <div className="text-xl font-bold mb-4 border-b pb-2">PolitiCheck.AI</div>
        
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
                  {item.rating} {item.lean}
                </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button 
            className="w-22 h-22 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
            onClick={() => window.open('about:blank', '_blank')}
          >
            <Plus size={24} />
          </button>
        </div>

      </CardContent>

    </Card>
  );
};


export default MainPage;