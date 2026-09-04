import { Link } from 'react-router-dom';
import { Show, UserButton } from '@clerk/react';

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
  return (
    // Side-specific border colors on purpose: plain `border-gray-300 border-black`
    // would each set all four sides, and the later utility would paint both
    // rules the same color.
    <div
      className={`w-full bg-white border-t border-t-gray-300 border-b-2 border-b-black ${className}`}
    >
      {/* px-8 matches the page gutter on the header row above, so it stays put
          while the bar's own vertical rhythm scales down.

          min-h-[36px] keeps this row — and so the whole 39px bar — exactly the
          same height in all three auth states. <Show> renders nothing while
          Clerk resolves the session, so without it the bar would collapse on
          load and then pop back; the overview pages position their content
          against a fixed-height bar (see PageHeader.tsx), so that would flash
          a gap. 36px = 24px of content + the 12px of py-1.5: box-sizing is
          border-box here, so min-height has to include the padding. */}
      <div className="flex justify-between items-center gap-1.5 px-8 py-1.5 min-h-[36px]">
        {/* Left: Favorites. Shown to everyone rather than only when signed in,
            so the feature is discoverable — /favorites prompts for sign-in
            itself. Keeping it always-present also stops the row's contents
            shifting sideways as the session resolves. */}
        <Link
          to="/favorites"
          className="text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-md"
        >
          Favorites
        </Link>

        {/* Right: auth controls. */}
        <div className="flex items-center gap-1.5">
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
    </div>
  );
}
