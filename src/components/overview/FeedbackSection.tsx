import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import networkManager from '../../network/NetworkManager';

type Status = 'idle' | 'open' | 'submitting' | 'success' | 'error';

const FeedbackSection = ({ organizationData, categoryData }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setStatus('submitting');
    try {
      await networkManager.submitFeedback(
        categoryData,
        organizationData?.id,
        feedback.trim(),
        organizationData?.topic
      );
      setStatus('success');
      setFeedback('');
    } catch {
      setStatus('error');
    }
  };

  const handleCancel = () => {
    setStatus('idle');
    setFeedback('');
  };

  if (status === 'success') {
    return (
      <div className="text-sm text-gray-500 py-1">
        Thank you for your feedback!
      </div>
    );
  }

  if (status === 'idle') {
    return (
      <button
        onClick={() => setStatus('open')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 bg-transparent transition-colors p-0"
      >
        Leave feedback
        <MessageSquare size={14} />
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Share your thoughts on this analysis..."
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-800"
      />
      <div className="flex items-center justify-between">
        {status === 'error'
          ? <p className="text-xs text-red-500">Something went wrong — please try again.</p>
          : <span />}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-400 hover:text-gray-600 bg-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || status === 'submitting'}
            className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
