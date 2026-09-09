import { ChevronDown } from 'lucide-react';

const CategoryDropdown = ({
  category,
  categoryGroups,
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
        <>
          <div className="fixed inset-0 z-0" onClick={onToggleDropdown} />
          {/* Wider than the old w-48: the section headings plus the longest
              label ("Leadership Demographics") wrapped onto two lines there. */}
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10 py-1 overflow-hidden">
            {categoryGroups.map((group, groupIndex) => (
              <div
                key={group.title}
                className={groupIndex > 0 ? 'border-t border-gray-200 mt-1 pt-1' : ''}
              >
                {/* A label, not an option — muted and non-interactive so it
                    can't be mistaken for a selectable category. */}
                <div className="px-4 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 select-none">
                  {group.title}
                </div>
                {group.categories.map((cat) => (
                  <div
                    key={cat}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                      cat === category ? 'font-semibold text-black' : ''
                    }`}
                    onClick={() => onSelectCategory(cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryDropdown;
