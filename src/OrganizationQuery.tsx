import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import organizationSuggestions from "./data/OrganizationSuggestions";
import PageHeader from './components/overview/PageHeader';
import SearchForm from './components/query/SearchForm';

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

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
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

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-screen flex items-center py-10 justify-center bg-white">
      <PageHeader onLogoClick={handleLogoClick} />
      <div 
        className=""
        style={{
          position: 'absolute',
          top: '48px', // Adjust to your header height
          left: '0',
          right: '0',
          zIndex: 1
        }}
      >
        {/* justify-center */}
        <div className="flex justify-center border-t border-gray-300 bg-gray-100 mt-8 pt-14 pb-14">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 px-6 pb-8">
              <SearchForm
                category={category}
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                onSubmit={handleSubmit}
                suggestions={organizationSuggestions}
              />
            </CardContent>
          </Card>
        </div>
         <Footer />
      </div>
    </div>
  );
};

export default OrganizationQuery;