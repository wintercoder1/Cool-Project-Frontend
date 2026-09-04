import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import LogoHeader from './components/LogoHeader';
import AuthNavBar from './components/AuthNavBar';
import Footer from './components/Footer';
import networkManager from './network/NetworkManager';
import { answerDetailPath, queryTypeToLabel } from './lib/queryTypes';

interface FavoriteRow {
  id: number;
  query_type: string;
  answer_id: number;
  normalized_topic_name: string;
  /** null when the underlying answer row has been deleted. */
  topic: string | null;
  timestamp: string;
}

/**
 * The signed-in user's saved answers.
 *
 * Login-gated: signed-out visitors get a prompt rather than an error, since the
 * Favorites link in the nav is visible to everyone.
 */
export default function Favorites() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        const data = await networkManager.getFavorites(token, { limit: 200 });
        if (cancelled) return;
        setFavorites(Array.isArray(data?.favorites) ? data.favorites : []);
        setTotalCount(Number(data?.total_count ?? 0));
      } catch (err) {
        console.error('Failed to load favorites:', err);
        if (!cancelled) setError('Could not load your saved answers.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        <LogoHeader onClick={() => navigate('/')} />
      </div>
      <AuthNavBar className="mt-2" />

      <div className="flex-1 bg-gray-100 pt-8 pb-16 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-baseline justify-between mb-4">
            {/* Matches the nav link that leads here. "Favorites" names the
                collection; "Save" is the action — see FavoriteButton. */}
            <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
            {isSignedIn && !loading && !error && totalCount > 0 && (
              <span className="text-sm text-gray-500">
                {totalCount} saved
              </span>
            )}
          </div>

          {!isLoaded || loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              Loading…
            </div>
          ) : !isSignedIn ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-700">Sign in to see the answers you&apos;ve saved.</p>
              <Link
                to="/login?redirect_url=%2Ffavorites"
                className="inline-block mt-4 bg-black text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign in
              </Link>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-700">
              {error}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-700">You haven&apos;t saved anything yet.</p>
              <p className="text-sm text-gray-500 mt-1">
                Open an organization and choose Save to keep it here.
              </p>
              <Link
                to="/"
                className="inline-block mt-4 bg-black text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse organizations
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              {favorites.map((fav) => {
                // topic is null when the answer row behind it was deleted; the
                // saved entry still exists, so show it rather than dropping it
                // silently, using the normalized name we always have.
                const display = fav.topic ?? fav.normalized_topic_name;
                const missing = fav.topic == null;

                return (
                  <Link
                    key={`${fav.query_type}:${fav.answer_id}`}
                    to={answerDetailPath(fav.query_type, display, fav.answer_id)}
                    className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {display}
                        {missing && (
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            (answer no longer available)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {queryTypeToLabel(fav.query_type)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 flex-shrink-0 ml-4">
                      {new Date(fav.timestamp).toLocaleDateString()}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
