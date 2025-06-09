import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPrevPage, 
  onNextPage 
}) => {
  return (
    <div className="flex justify-center items-center mt-6 mb-16">
      <button 
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={`p-2 rounded-md transition-colors ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
            : 'bg-gray-100 text-blue-500 hover:bg-blue-50 touch-manipulation'
          }`}
        >
        <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
          <ChevronLeft size={20} width={20} height={20}/>
        </span>
      </button>
      
      <span className="mx-4 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md transition-colors ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
            : 'bg-gray-100 text-blue-500 hover:bg-blue-50 active:bg-blue-100 touch-manipulation'
          }`}
        >
        <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
          <ChevronRight size={20} width={20} height={20}/>
        </span>
      </button>
    </div>
  );
};

export default PaginationControls;