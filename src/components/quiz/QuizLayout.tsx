import { useNavigate } from 'react-router-dom';
import LogoHeader from '../LogoHeader';
import AuthNavBar from '../AuthNavBar';
import Footer from '../Footer';

/**
 * Page chrome shared by the quiz and the shared-result page, matching About
 * and Favorites: white header band, the nav strip, then a gray content field.
 */
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        <LogoHeader onClick={() => navigate('/')} />
      </div>
      <AuthNavBar className="mt-2" />

      <div className="flex-1 bg-gray-100 pt-8 pb-16 px-4">
        <div className="w-full max-w-3xl mx-auto">{children}</div>
      </div>

      <Footer />
    </div>
  );
}
