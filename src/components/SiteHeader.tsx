import LogoHeader from './LogoHeader';
import AuthNavBar from './AuthNavBar';

// ─── Toggle this to show or hide the auth nav row ───────────────────────────
const SHOW_AUTH_NAV = true;
// ────────────────────────────────────────────────────────────────────────────

interface SiteHeaderProps {
  children?: React.ReactNode; // right-side slot (e.g. CategoryDropdown)
}

export default function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <div className="bg-white">
      {/* Main row: logo + right-side content */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8">
        <LogoHeader />
        {children}
      </div>

      {/* Auth nav row */}
      {SHOW_AUTH_NAV && <AuthNavBar className="mt-2" />}
    </div>
  );
}
