import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Link2 } from 'lucide-react';
import networkManager from '../../network/NetworkManager';

const VOTES_COOKIE = 'compassAIVotes';

const CATEGORY_MAP = {
  'Political Leaning': 'POLITICAL_LEANING',
  'DEI Friendliness': 'DEI_FRIENDLINESS',
  'Wokeness': 'WOKENESS',
  'Environmental Impact': 'ENVIRONMENTAL_IMPACT',
  'Immigration Support': 'IMMIGRATION_SUPPORT',
  'Technology Innovation': 'TECHNOLOGY_INNOVATION',
  'Financial Contributions': 'FINANCIAL_CONTRIBUTIONS',
};

const CATEGORY_TO_SLUG = {
  'Political Leaning': 'political_leaning',
  'DEI Friendliness': 'dei_friendliness',
  'Wokeness': 'wokeness',
  'Environmental Impact': 'environmental_impact',
  'Immigration Support': 'immigration_support',
  'Technology Innovation': 'technology_innovation',
  'Financial Contributions': 'financial_contributions',
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getVotesFromCookie(): Record<string, Record<string, 'up' | 'down'>> {
  const raw = getCookie(VOTES_COOKIE);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getVoteForItem(categoryKey: string, id: number): 'up' | 'down' | null {
  const votes = getVotesFromCookie();
  return votes[categoryKey]?.[String(id)] ?? null;
}

function recordVote(categoryKey: string, id: number, direction: 'up' | 'down') {
  const votes = getVotesFromCookie();
  if (!votes[categoryKey]) votes[categoryKey] = {};
  votes[categoryKey][String(id)] = direction;
  setCookie(VOTES_COOKIE, JSON.stringify(votes), 365);
}

const VoteSection = ({ organizationData, categoryData, showCounts = false, coloredVote = false }) => {
  const id: number | undefined = organizationData?.id;
  const categoryKey = CATEGORY_MAP[categoryData] ?? null;

  const existingVote = id != null && categoryKey ? getVoteForItem(categoryKey, id) : null;

  const [vote, setVote] = useState<'up' | 'down' | null>(existingVote);
  const [upvotes, setUpvotes] = useState<number>(organizationData?.upvote_count ?? 0);
  const [downvotes, setDownvotes] = useState<number>(organizationData?.downvote_count ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (id == null || !categoryKey) return null;

  const handleCopyLink = () => {
    const slug = CATEGORY_TO_SLUG[categoryData] ?? categoryData?.toLowerCase().replace(/\s+/g, '_');
    const url = `${window.location.origin}/organization/${slug}/${encodeURIComponent(organizationData?.topic ?? '')}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleVote = async (direction: 'up' | 'down') => {
    if (vote !== null || isLoading) return;
    setIsLoading(true);
    try {
      if (direction === 'up') {
        await networkManager.upvote(categoryData, id);
        setUpvotes(prev => prev + 1);
      } else {
        await networkManager.downvote(categoryData, id);
        setDownvotes(prev => prev + 1);
      }
      setVote(direction);
      recordVote(categoryKey, id, direction);
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const alreadyVoted = vote !== null;

  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-sm text-gray-400">Was this helpful?</span>
      <button
        onClick={() => handleVote('up')}
        disabled={alreadyVoted || isLoading}
        aria-label="Upvote"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors bg-transparent border ${
          vote === 'up'
            ? coloredVote ? 'border-green-400 text-green-600' : 'border-gray-800 text-gray-800'
            : alreadyVoted
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : coloredVote
            ? 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
            : 'border-gray-200 text-gray-500 hover:border-gray-800 hover:text-gray-800'
        }`}
      >
        <ThumbsUp size={14} />
        {showCounts && <span>{upvotes}</span>}
      </button>
      <button
        onClick={() => handleVote('down')}
        disabled={alreadyVoted || isLoading}
        aria-label="Downvote"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors bg-transparent border ${
          vote === 'down'
            ? coloredVote ? 'border-red-400 text-red-600' : 'border-gray-800 text-gray-800'
            : alreadyVoted
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : coloredVote
            ? 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600'
            : 'border-gray-200 text-gray-500 hover:border-gray-800 hover:text-gray-800'
        }`}
      >
        <ThumbsDown size={14} />
        {showCounts && <span>{downvotes}</span>}
      </button>
      <button
        onClick={handleCopyLink}
        aria-label="Copy shareable link"
        title={copied ? 'Copied!' : 'Copy link'}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors bg-transparent border border-gray-200 text-gray-400 hover:border-gray-800 hover:text-gray-700"
      >
        {copied ? <span className="text-xs text-gray-800 font-medium">Link copied!</span> : <Link2 size={14} />}
      </button>
    </div>
  );
};

export default VoteSection;
