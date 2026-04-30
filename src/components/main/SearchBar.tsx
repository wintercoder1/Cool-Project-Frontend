const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <div className="flex-1 mr-6 relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search companies..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none bg-transparent"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;
