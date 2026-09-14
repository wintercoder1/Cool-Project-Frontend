import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Show, UserButton, useAuth } from '@clerk/react';
import SignInPromptDialog from './SignInPromptDialog';

interface AuthNavBarProps {
  className?: string;
}

/**
 * Slim nav row that sits directly under the main page header.
 * White so it reads as part of the header rather than the gray content band
 * below it, divided from the logo row by a soft gray hairline, and anchored by
 * a solid black bottom rule.
 *
 * "Sign up" means the free tier and nothing else — it must never point at the
 * paid checkout, which is a separate flow reached from inside the app once
 * signed in. (It did point there originally, sending anyone who clicked it
 * straight into a Paddle subscription.)
 *
 * These link to /login and /signup rather than using Clerk's <SignInButton>
 * modals, because those routes mount <SignIn />/<SignUp /> as full pages.
 */
export default function AuthNavBar({ className = '' }: AuthNavBarProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [promptOpen, setPromptOpen] = useState(false);

  // Explain the gate instead of letting a signed-out visitor land on a page
  // that can only tell them to sign in. Left as a real <Link> so it still keeps
  // its href for middle-click and open-in-new-tab; those bypass this handler
  // and hit /favorites directly, where the page's own signed-out state catches
  // them. Only intercept once Clerk has resolved — while isLoaded is false we
  // don't yet know whether they're signed in, and wrongly showing this to a
  // signed-in user is worse than letting the navigation through.
  const handleFavoritesClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoaded && !isSignedIn) {
      event.preventDefault();
      setPromptOpen(true);
    }
  };

  return (
    // Side-specific border colors on purpose: plain `border-gray-300 border-black`
    // would each set all four sides, and the later utility would paint both
    // rules the same color.
    <div
      className={`w-full bg-white border-t border-t-gray-300 border-b-2 border-b-black ${className}`}
    >
      {/* px-8 matches the page gutter on the header row above, so it stays put
          while the bar's own vertical rhythm scales down.

          Below sm the bar becomes two levels — nav on top, auth underneath —
          rather than one row that has to fit five items. Five of them want
          ~379px and a 375px screen leaves 311px inside that gutter, so on one
          line "Log in" and "Sign up" wrapped mid-label and the bar grew to an
          accidental 55px. Two deliberate levels read better than one crowded
          one, and they leave room for a fourth nav item later.

          The min-heights pin every level in all three auth states. <Show>
          renders nothing while Clerk resolves the session, so without them the
          auth level would collapse on load and then pop back — and because the
          overview pages position their content against this bar's height (see
          PageHeader.tsx), that would drag their whole content band with it.
          24px is one link's line-height plus its py-1; 36px adds the py-1.5
          around it, since box-sizing is border-box here. */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 px-8 py-1.5 min-h-[36px]">
        {/* Left: About, Quiz, Favorites. All three shown to everyone rather
            than only when signed in, so the features are discoverable —
            /favorites prompts for sign-in itself and the quiz needs no account
            at all. Keeping them always-present also stops the row's contents
            shifting sideways as the session resolves.

            Quiz sits in the middle so About and Favorites keep the positions
            people already know. This strip is deliberately recessive, though,
            so it is the returning route rather than the discovery one — the
            prompt above the list on the main page is what actually invites a
            first run. */}
        <div className="flex items-center gap-1.5 min-h-[24px]">
          <Link
            to="/about"
            className="text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-md"
          >
            About
          </Link>
          <Link
            to="/quiz"
            className="text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-md"
          >
            Quiz
          </Link>
          <Link
            to="/favorites"
            onClick={handleFavoritesClick}
            className="text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-md"
          >
            Favorites
          </Link>
        </div>

        {/* Auth controls: the lower level on a phone, the right-hand end
            of the row from sm up. */}
        <div className="flex items-center gap-1.5 min-h-[24px]">
        <Show when="signed-out">
          <Link
            to="/login"
            className="text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-md"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-xs font-medium text-white bg-black hover:bg-gray-800 transition-colors px-3 py-1 rounded-md"
          >
            Sign up
          </Link>
        </Show>

        <Show when="signed-in">
          {/* Avatar pinned to 24px so it fits the 26px row — Clerk's default is
              taller and would push the bar past 41px when signed in. */}
          <UserButton
            appearance={{ elements: { avatarBox: 'w-6 h-6' } }}
          />
        </Show>
        </div>
      </div>

      <SignInPromptDialog
        open={promptOpen}
        onOpenChange={setPromptOpen}
        title="Sign in to view your favorites"
        description="You need to be signed in to see the queries you've saved."
      />
    </div>
  );
}
