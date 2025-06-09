import { ChevronDown } from 'lucide-react';

const SortControls = ({ 
  sortBy, 
  sortOrder, 
  sortOptions, 
  sortDropdownOpen, 
  onToggleSortDropdown, 
  onSelectSortOption, 
  onToggleSortOrder 
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Sort by:</span>
      
      {/* Sort By Dropdown */}
      <div className="relative">
        <button 
          className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 min-w-[120px] justify-between"
          onClick={onToggleSortDropdown}
        >
          {sortBy} <ChevronDown size={16} />
        </button>
        
        {sortDropdownOpen && (
          <div className="absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
            {sortOptions.map((option) => (
              <div 
                key={option} 
                className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                  sortBy === option ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => onSelectSortOption(option)}
              >
                {sortBy === option && <span className="mr-2">✓</span>}
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sort Order Toggle */}
      <button 
        className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        onClick={onToggleSortOrder}
        title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
      >
        <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
          {sortOrder === 'asc' ? '↑': '↓'}
        </span>
      </button>
    </div>
  );
};

export default SortControls;