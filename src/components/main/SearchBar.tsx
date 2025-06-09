const SearchBar = ({ onKeyPress }) => {
  return (
    <div className="flex-1 mr-6">
      <input
        type="text"
        placeholder="Search companies..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
        onKeyPress={onKeyPress}
      />
    </div>
  );
};

export default SearchBar;