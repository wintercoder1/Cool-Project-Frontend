import { useEffect, useState } from 'react';
import { shareUrlFor } from '@/lib/quiz';

interface ShareControlProps {
  shareToken: string;
  /** Shown verbatim beside the control — the contract requires it. */
  shareWarning: string;
}

/**
 * The share link, and the warning that has to travel with it.
 *
 * The token *is* the answers, compressed — there is no server-side record to
 * look up. That is what makes the quiz stateless, and it is also why anyone
 * holding the link can read the political positions that produced the result.
 * The warning is not decoration; it is the only thing standing between someone
 * and sharing their own stated views by accident.
 */
export default function ShareControl({ shareToken, shareWarning }: ShareControlProps) {
  const [copied, setCopied] = useState(false);
  const url = shareUrlFor(shareToken);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard is blocked in some contexts; the input is selectable, so
      // there is still a way to copy by hand.
      setCopied(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="flex-1 min-w-0 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-medium text-white bg-black hover:bg-blue-700 transition-colors px-4 py-2 rounded-md flex-shrink-0"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">{shareWarning}</p>
    </div>
  );
}
