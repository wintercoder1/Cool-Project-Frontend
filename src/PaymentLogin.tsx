import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from './config';
import LogoHeader from './components/LogoHeader';

export default function PaymentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    // TODO: replace with your auth backend call
    // e.g. await authClient.signIn({ email, password });
    setTimeout(() => {
      setLoading(false);
      setError('Auth backend not yet connected.');
    }, 800);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 px-8 py-2">
        <LogoHeader onClick={() => navigate('/')} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                PRO
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to your {APP_NAME} Pro account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-black transition-colors"
                    onClick={() => {/* TODO: forgot password flow */}}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="border-t border-gray-100 mt-6 pt-6 text-center text-sm text-gray-500">
              Don't have a Pro account?{' '}
              <button onClick={() => navigate('/payment/signup')} className="font-medium text-black hover:underline">
                Subscribe now
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Manage your subscription via{' '}
            <a
              href="https://customer.paddle.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-gray-600"
            >
              Paddle Customer Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
