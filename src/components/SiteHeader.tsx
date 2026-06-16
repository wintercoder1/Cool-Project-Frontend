import { useNavigate } from 'react-router-dom';
import LogoHeader from './LogoHeader';

// ─── Toggle this to show or hide the auth nav row ───────────────────────────
const SHOW_AUTH_NAV = false; //true;
// ────────────────────────────────────────────────────────────────────────────

// Replace with real auth state once backend is wired up
const isLoggedIn = false;

interface SiteHeaderProps {
  children?: React.ReactNode; // right-side slot (e.g. CategoryDropdown)
}

export default function SiteHeader({ children }: SiteHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Main row: logo + right-side content */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8">
        <LogoHeader />
        {children}
      </div>

      {/* Auth nav row */}
      {SHOW_AUTH_NAV && (
        <div className="border-t border-gray-100 px-8 py-1.5 flex justify-end items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/payment/login')}
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Account
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/payment/login')}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/payment/signup')}
                className="text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors px-3 py-1 rounded-md"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
