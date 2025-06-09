import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import SuggestionDropdown from './SuggestionDropdown';

const AutocompleteInput = ({ 
  value, 
  onChange, 
  placeholder = "Type here.", 
  suggestions = [],
  maxSuggestions = 10,
  className = "",
  required = false,
  ...inputProps
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  const filterSuggestions = (inputValue) => {
    if (inputValue.length === 0) {
      return [];
    }

    const lowerValue = inputValue.toLowerCase();
    
    // Separate suggestions that start with the input vs those that contain it
    const startsWith = suggestions.filter(item =>
      item.toLowerCase().startsWith(lowerValue)
    );
    
    const contains = suggestions.filter(item =>
      item.toLowerCase().includes(lowerValue) && 
      !item.toLowerCase().startsWith(lowerValue)
    );
    
    // Combine with startsWith first, then contains
    return [...startsWith, ...contains].slice(0, maxSuggestions);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    const filtered = filterSuggestions(inputValue);
    setFilteredSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
    setActiveSuggestion(-1);
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      const filtered = filterSuggestions(value);
      if (filtered.length > 0) {
        setFilteredSuggestions(filtered);
        setShowDropdown(true);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowDropdown(false);
    setActiveSuggestion(-1);
    setFilteredSuggestions([]);
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

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        className={`w-full border-2 rounded-md px-4 py-2 text-gray-600 bg-white ${className}`}
        required={required}
        autoComplete="off"
        {...inputProps}
      />
      
      <SuggestionDropdown
        ref={dropdownRef}
        // @ts-expect-error
        suggestions={filteredSuggestions}
        activeSuggestion={activeSuggestion}
        onSuggestionClick={handleSuggestionClick}
        isVisible={showDropdown}
      />
    </div>
  );
};

export default AutocompleteInput;