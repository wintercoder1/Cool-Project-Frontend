import { ChevronDown } from 'lucide-react';

const CategoryDropdown = ({ 
  category, 
  availableCategories, 
  dropdownOpen, 
  onToggleDropdown, 
  onSelectCategory 
}) => {
  return (
    <div className="relative mt-4 sm:mt-0 flex justify-center sm:justify-end">
      <button 
        className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
        onClick={onToggleDropdown}
      >
        {category} <ChevronDown size={16} />
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          {availableCategories.map((cat) => (
            <div 
              key={cat} 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;