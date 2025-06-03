import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';

const OrganizationQuery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Political Leaning');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Sample organization suggestions - you can replace this with your own data source
  const organizationSuggestions = [
    'Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Tesla', 'Netflix', 'Twitter',
    'Facebook', 'Instagram', 'YouTube', 'LinkedIn', 'Uber', 'Airbnb', 'Spotify',
    'Nike', 'Adidas', 'Coca-Cola', 'Pepsi', 'McDonald\'s', 'Starbucks', 'Walmart',
    'Target', 'Home Depot', 'Costco', 'Best Buy', 'GameStop', 'AMC', 'Disney',
    'Warner Bros', 'Sony', 'Nintendo', 'EA Sports', 'Activision', 'Blizzard',
    'Ford', 'General Motors', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz',
    'JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Goldman Sachs', 'Visa',
    'Mastercard', 'PayPal', 'Square', 'Robinhood', 'Coinbase', 'Binance'
  ];

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

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const lowerValue = value.toLowerCase();
      
      // Separate suggestions that start with the input vs those that contain it
      const startsWith = organizationSuggestions.filter(org =>
        org.toLowerCase().startsWith(lowerValue)
      );
      
      const contains = organizationSuggestions.filter(org =>
        org.toLowerCase().includes(lowerValue) && 
        !org.toLowerCase().startsWith(lowerValue)
      );
      
      // Combine with startsWith first, then contains
      const filtered = [...startsWith, ...contains].slice(0, 10);
      
      setFilteredSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
      setActiveSuggestion(-1);
    } else {
      setShowDropdown(false);
      setFilteredSuggestions([]);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowDropdown(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (activeSuggestion >= 0) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setActiveSuggestion(-1);
        break;
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
              
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type here."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  className="w-full border-2 rounded-md px-4 py-2 text-gray-600 bg-white"
                  required
                  autoComplete="off"
                />
                
                {showDropdown && filteredSuggestions.length > 0 && (
                  <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto mt-1"
                  >
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800 ${
                          index === activeSuggestion ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
