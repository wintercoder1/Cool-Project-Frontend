import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-8">
      <button 
        // bg-blue-400 before this: an off-palette blue, and its white icon sat
        // at 2.54:1 — a fail at every size. brand is 5.93:1 and is the same
        // accent the quiz and the primary buttons use.
        className="w-14 h-12 bg-brand rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-900 transition-colors"
        onClick={onClick}
      >
        <Plus size={50} />
      </button>
    </div>
  );
};

export default FloatingActionButton;