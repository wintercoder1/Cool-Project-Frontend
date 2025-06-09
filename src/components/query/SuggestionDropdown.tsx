import { forwardRef } from 'react';
import SuggestionItem from './SuggestionItem';

const SuggestionDropdown = forwardRef(({ 
  // @ts-expect-error
  suggestions, 
  // @ts-expect-error
  activeSuggestion, 
  // @ts-expect-error
  onSuggestionClick,
  // @ts-expect-error
  isVisible 
}, ref) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      // @ts-expect-error
      ref={ref}
      className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto mt-1"
    >
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={suggestion}
          suggestion={suggestion}
          isActive={index === activeSuggestion}
          onClick={() => onSuggestionClick(suggestion)}
        />
      ))}
    </div>
  );
});

SuggestionDropdown.displayName = 'SuggestionDropdown';

export default SuggestionDropdown;