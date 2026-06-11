import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from './config';
import LogoHeader from './components/LogoHeader';

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void };
      Initialize: (opts: { token: string }) => void;
      Checkout: { open: (opts: object) => void };
    };
  }
}

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string;
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID as string;
const PADDLE_SANDBOX = import.meta.env.VITE_PADDLE_SANDBOX === 'true';

const PRO_FEATURES = [
  'Unlimited organization lookups',
  'Full political contribution history',
  'DEI, ESG & immigration scoring',
  'Priority AI analysis updates',
  'Export data as CSV',
  'Early access to new categories',
];

export default function PaymentSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [paddleReady, setPaddleReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (document.querySelector('script[src*="paddle.js"]')) {
      setPaddleReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        if (PADDLE_SANDBOX) window.Paddle.Environment.set('sandbox');
        window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
      }
      setPaddleReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const handleCheckout = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    window.Paddle?.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
      customer: { email },
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 px-8 py-2">
        <LogoHeader onClick={() => navigate('/')} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

          {/* Left — value prop */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-6">
              PRO
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {APP_NAME} Pro
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              The complete picture on every organization — powered by AI.
            </p>
            <ul className="space-y-3">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — checkout card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Get started</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Enter your email to continue to payment.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCheckout()}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-2"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={!paddleReady}
              className="w-full mt-3 bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paddleReady ? 'Continue to payment →' : 'Loading…'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Secure checkout powered by Paddle. Cancel anytime.
            </p>

            <div className="border-t border-gray-100 mt-6 pt-6 text-center text-sm text-gray-500">
              Already subscribed?{' '}
              <button onClick={() => navigate('/payment/login')} className="font-medium text-black hover:underline">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
