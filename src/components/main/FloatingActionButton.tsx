import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-8">
      <button 
        className="w-14 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
        onClick={onClick}
      >
        <Plus size={50} />
      </button>
    </div>
  );
};

export default FloatingActionButton;