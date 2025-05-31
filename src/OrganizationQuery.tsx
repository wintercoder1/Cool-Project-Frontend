import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';

const OrganizationQuery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Political Leaning');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get category from location state if provided
    console.log('____ ____')
    console.log(location)
    console.log(location.state)
    console.log(location.state.current_category)
    // console.log(location.state.data)
    // console.log(location.state.data.current_category)
    // console.log(data)
    // console.log(data.current_category)
    // console.log(location.data)
    console.log('____ ____')
    if (location && location.state && location.state.current_category) {
      setCategory(location.state.current_category);
    }
  }, [location]);

  const ENVIRONMENT_BASE_URL = 'http://127.0.0.1:8000'
  //const  ENVIRONMENT_BASE_URL = 'http://18.188.2.109:443'

  const categoryEndpoints = {
    'Political Leaning': ENVIRONMENT_BASE_URL + '/getPoliticalLeaning/',
    'DEI Friendliness': ENVIRONMENT_BASE_URL + '/getDEIFriendlinessScore/',
    'Wokeness': ENVIRONMENT_BASE_URL + '/getWokenessScore/',
    'Financial Contributions': ENVIRONMENT_BASE_URL + '/getFinancialContributions/'
  };

  const getCategoryPrompt = () => {
    // setCategory('DEI Friendliness')
    switch(category) {
      case 'Political Leaning':
        return "What organization do you want to find the political leaning of?";
      case 'DEI Friendliness':
        return "What organization do you want to find the DEI friendliness score of?";
      case 'Wokeness':
        return "What organization do you want to find the wokeness score of?";
      default:
        return "What organization would you like to search for?";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`User searched for: ${searchTerm} in category: ${category}`);
    fetchData(searchTerm);
    openWaitingPageCurrentTab();
  };

  const fetchData = async (query_topic) => {
    try {
      const baseEndpoint = categoryEndpoints[category] || categoryEndpoints['Political Leaning'];
      const response = await fetch(`${baseEndpoint}${encodeURIComponent(query_topic)}`);
      
      if (!response.ok) {
        handleErrorOnUI();
        throw new Error('Network response was not ok');
      }
      
      const jsonData = await response.json();
      console.log('Data fetched:', jsonData);
      openDetailPageCurrentTab(jsonData);
    } catch (err) {
      console.error('Error fetching data:', err);
      handleErrorOnUI();
    }
  };

  const openDetailPageCurrentTab = (organization) => {
    navigate('/organization', { 
      state: { 
        ...organization, 
        category: category 
      }
    });
  };

  const openWaitingPageCurrentTab = () => {
    navigate('/waiting', { state: { category: category } });
  };

  const handleErrorOnUI = () => {
    console.log('Dialog should show now');
  };
 
  return (
    <div className="min-h-screen w-screen flex items-center py-10 justify-center bg-white">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-6">
              <h1 className="text-xl font-medium">
                {getCategoryPrompt()}
              </h1>
              
              <Input
                type="text"
                placeholder="Type here."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 rounded-md px-4 py-2 text-gray-600"
              />
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-blue-100 hover:bg-blue-200 text-gray-800 px-6 py-2 rounded-md"
              >
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationQuery;