import { Link } from 'react-router-dom';
import AuthPageLayout from './components/AuthPageLayout';

/**
 * Catch-all 404. Without this, an unmatched path renders a blank white screen,
 * which is what /upgrade would do while PRO_ENABLED is false.
 */
export default function NotFound() {
  return (
    <AuthPageLayout>
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-5xl font-bold text-gray-900">404</p>
        <h1 className="text-xl font-bold text-gray-900 mt-3">Page not found</h1>
        <p className="text-gray-500 text-sm mt-1">
          That page doesn&apos;t exist, or isn&apos;t available yet.
        </p>

        <Link
          to="/"
          className="block w-full mt-6 bg-black text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </AuthPageLayout>
  );
}
