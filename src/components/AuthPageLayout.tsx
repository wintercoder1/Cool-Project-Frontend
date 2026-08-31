import { useNavigate } from 'react-router-dom';
import LogoHeader from './LogoHeader';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared shell for the auth pages: logo nav, then a centered column.
 *
 * Deliberately holds no card chrome of its own — Clerk's <SignIn /> and
 * <SignUp /> render their own card, and wrapping those in a second bordered
 * box gives a card-inside-a-card.
 */
export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-2">
        <LogoHeader onClick={() => navigate('/')} />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
