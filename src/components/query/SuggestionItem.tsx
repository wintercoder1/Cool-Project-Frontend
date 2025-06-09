const SuggestionItem = ({ suggestion, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800 ${
        isActive ? 'bg-blue-50 text-blue-700' : ''
      }`}
    >
      {suggestion}
    </div>
  );
};

export default SuggestionItem;