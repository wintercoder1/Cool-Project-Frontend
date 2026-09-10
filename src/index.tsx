import './index.css'
import ReactDOM from "react-dom/client";
import { APP_LOGO } from './config';

const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement ?? (() => {
  const el = document.createElement('link');
  el.rel = 'icon';
  document.head.appendChild(el);
  return el;
})();
favicon.href = APP_LOGO;
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ClerkProvider } from '@clerk/react'
import MainPage from './MainPage.tsx'
import OrganizationDetailOverview  from '@/OrganizationDetailOverview.tsx'
import OrganizationContributionTotals from '@/OrganizationContributionTotals.tsx'
import OrganizationQuery from '@/OrganizationQuery.tsx'
import OrganizationLeadershipContributionTotals from '@/OrganizationLeadershipContributionTotals.tsx'
import WaitingPage  from '@/WaitingPage.tsx'
import Login from '@/Login.tsx'
import Signup from '@/Signup.tsx'
import ProCheckout from '@/ProCheckout.tsx'
import LeadershipDetail from '@/LeadershipDetail.tsx'
import About from '@/About.tsx'
import Favorites from '@/Favorites.tsx'
import NotFound from '@/NotFound.tsx'
import { PRO_ENABLED } from '@/config'

// Forces a full remount of OrganizationDetailOverview when category or topic changes,
// so all state (fetched data, edits, etc.) resets cleanly for the new entity.
function KeyedOrganizationDetail() {
  const { category, topic } = useParams();
  // Leadership Demographics has its own page: the payload is a roster plus an
  // aggregate, not the lean/rating/context answer OrganizationDetailOverview
  // and OrganizationCard are built around.
  if (category === 'leadership_demographics') {
    return <LeadershipDetail key={`${category}/${topic}`} />;
  }
  return <OrganizationDetailOverview key={`${category}/${topic}`} />;
}

/**
 * Clerk's look, matched to the site's black-and-white palette.
 *
 * NOT Clerk's bundled `shadcn` theme, despite this project having a
 * components.json. That theme is built for Tailwind v4 / current shadcn, where
 * `--primary` etc. hold complete colors and are used as `var(--primary)`. This
 * project is Tailwind 3.4.17 with legacy shadcn variables holding bare HSL
 * triplets ("240 5.9% 10%") for use as `hsl(var(--primary))`, so the theme
 * resolved every color to an invalid value and rendered Clerk unstyled —
 * borderless inputs, an unfilled submit button. (Its stylesheet is also just
 * `@source "./shadcn.js"`, a Tailwind v4 directive that does nothing here.)
 *
 * Redefining those variables as whole colors to suit Clerk would break the
 * project's own shadcn components, which read them through hsl().
 */
const CLERK_APPEARANCE_VARIABLES = {
  colorPrimary: '#000000',
  colorPrimaryForeground: '#ffffff',
  borderRadius: '0.5rem',
};

/**
 * ClerkProvider, wired to react-router.
 *
 * It sits INSIDE BrowserRouter on purpose: routerPush/routerReplace need the
 * router's navigate(), and useNavigate() only works beneath a Router. Handing
 * Clerk those two makes its internal navigation (verification steps, SSO
 * callbacks, post-sign-in redirects) go through react-router instead of full
 * page reloads. They must be supplied as a pair or not at all.
 *
 * The publishable key is read automatically from VITE_CLERK_PUBLISHABLE_KEY,
 * so there is no key to pass — or to leak into source.
 */
function ClerkWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      appearance={{ variables: CLERK_APPEARANCE_VARIABLES }}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}

export default function MainRouter() {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
      <Routes>
        <Route path="/"
               element={<MainPage />} />
        <Route path="/organization"
               element={<OrganizationDetailOverview />} />
        <Route path="/organization/:category/:topic"
               element={<KeyedOrganizationDetail />} />
        <Route path="/organization/:category/:topic/edit"
               element={<KeyedOrganizationDetail />} />
        <Route path="/organizationRecipientsTotals"
               element={<OrganizationContributionTotals/>} />
        <Route path="/organizationLeadershipContributionTotals"
               element={<OrganizationLeadershipContributionTotals/>} />
        <Route path="/query"
               element={<OrganizationQuery />} />
        <Route path="/waiting"
               element={<WaitingPage />} />
        {/* Auth. The trailing /* is required: Clerk's <SignIn />/<SignUp />
            navigate to sub-paths for email verification, MFA and SSO
            callbacks, and a bare path breaks those steps. */}
        <Route path="/login/*"
               element={<Login />} />
        <Route path="/signup/*"
               element={<Signup />} />

        <Route path="/about"
               element={<About />} />

        {/* Saved answers. Registered for everyone; the page itself prompts for
            sign-in, so the nav link works signed-out. */}
        <Route path="/favorites"
               element={<Favorites />} />

        {/* Paid tier — deliberately not registered while PRO_ENABLED is false,
            so the Paddle checkout can't be reached at all (a stale link or
            bookmark falls through to the 404 below) rather than merely being
            unlinked from the UI. */}
        {PRO_ENABLED && (
          <Route path="/upgrade"
                 element={<ProCheckout />} />
        )}

        <Route path="*"
               element={<NotFound />} />
      </Routes>
      </ClerkWithRouter>
    </BrowserRouter>
  );
}

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode)
root.render(
  <StrictMode>
    <MainRouter />
    {/* <WaitingPage /> */}
  </StrictMode>
);
