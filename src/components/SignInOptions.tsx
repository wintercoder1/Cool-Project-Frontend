import { useNavigate } from 'react-router-dom';

interface SignInOptionsProps {
  /** Supply the justification (e.g. sm:justify-end, justify-center) plus spacing. */
  className?: string;
}

/**
 * The Log in / Sign up pair, in the header bar's order and emphasis: Log in
 * quiet on the left, Sign up dark on the right.
 *
 * Shared by the sign-in dialog and the favorites page so the same two choices
 * can't drift into looking like two different decisions — they already had to
 * be corrected once for exactly that.
 *
 * Both carry redirect_url for the current location, so signing in returns
 * people to whatever they were trying to do.
 */
export default function SignInOptions({ className = '' }: SignInOptionsProps) {
  const navigate = useNavigate();

  const go = (path: string) => {
    const here = window.location.pathname + window.location.search;
    navigate(`${path}?redirect_url=${encodeURIComponent(here)}`);
  };

  return (
    <div className={`flex flex-col-reverse sm:flex-row gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => go('/login')}
        className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
      >
        Log in
      </button>
      <button
        type="button"
        onClick={() => go('/signup')}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-black text-white hover:bg-brand transition-colors"
      >
        Sign up
      </button>
    </div>
  );
}
