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
    console.log(location.state?.current_category)
    console.log('____ ____')
    if (location && location.state && location.state.current_category) {
      setCategory(location.state.current_category);
    }
  }, [location]);

  const getCategoryPrompt = () => {
    switch(category) {
      case 'Political Leaning':
        return "What organization do you want to find the political leaning of?";
      case 'DEI Friendliness':
        return "What organization do you want to find the DEI friendliness score of?";
      case 'Wokeness':
        return "What organization do you want to find the wokeness score of?";
      case 'Environmental Impact':
        return "What organization do you want to find the environmental impact score of?";
      case 'Immigration':
        return "What organization do you want to find the immigration friendliness score of?";
      default:
        return "What organization would you like to search for?";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`User searched for: ${searchTerm} in category: ${category}`);

    // Navigate to waiting page with search data
    navigate('/waiting', { 
      state: { 
        current_category: category,
        search_term: searchTerm
      }
    });
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
                required
              />
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-blue-100 hover:bg-blue-200 text-gray-800 px-6 py-2 rounded-md"
                disabled={!searchTerm.trim()}
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