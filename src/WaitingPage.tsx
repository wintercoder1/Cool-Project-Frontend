import React from 'react';
import { Loader2 } from 'lucide-react';

const WaitingPage = () => {
  return (
    <div className="min-h-screen w-screen flex  flex-col items-center space-y-40 py-40 bg-white space-y-8">
      {/* Top text */}
      <div className="text-2xl text-gray-500">
        Calculating...
      </div>

      {/* Spinner */}
      <div className="text-blue-400">
        <Loader2 className="h-28 w-28 animate-spin" />
      </div>

      {/* Bottom text */}
      <div className="text-lg text-gray-500">
        This may take a while..
      </div>
    </div>
  );
};

export default WaitingPage;