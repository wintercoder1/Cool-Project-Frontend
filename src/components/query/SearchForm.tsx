import CategoryPrompt from './CategoryPrompt';
import AutoCompleteInput from './AutoCompleteInput';
import SubmitButton from './SubmitButton';

const SearchForm = ({ 
  category,
  searchTerm,
  onSearchTermChange,
  onSubmit,
  suggestions = [],
  className = ""
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-8 ${className}`}>
      <div className="text-center space-y-6">
        <CategoryPrompt category={category} />
        
        <AutoCompleteInput
          value={searchTerm}
          onChange={onSearchTermChange}
          suggestions={suggestions}
          placeholder="Type here."
          required
        />
      </div>

      <SubmitButton 
        disabled={!searchTerm.trim()}
      />
    </form>
  );
};

export default SearchForm;