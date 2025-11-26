// @ts-expect-error
import compass_logo from '../assets/compass_logo.png';

export default function Footer({ className = "" }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white text-gray-900 border-t border-gray-200 mt-auto ${className}`}>
      <div className="mx-6 sm:mx-8 lg:mx-12 py-12">
        {/* Company Info */}
        {/* <div className="flex items-center gap-3 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Tilt AI</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Advanced political intelligence and financial contribution analysis powered by AI. 
          Understanding the intersection of business and politics through data-driven insights.
        </p>
        <p className="text-sm text-gray-500">
          A product of Covariant Apps LLC
        </p> */}

        {/* Divider */}
        {/* <div className="border-t border-gray-200 mt-8 pt-8"> */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Copyright */}
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              <p>© {currentYear} Covariant Apps LLC. All rights reserved.</p>
              <p className="mt-1">
                Data sourced from public FEC filings and other regulatory sources.
              </p>
            </div>

            {/* Social Links / Contact Info */}
            <div className="flex space-x-6">
              <a 
                href="mailto:admin@correlation-apss.net" 
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>
            This website provides information derived from publicly available data. 
            Compass AI and Covariant Apps LLC do not endorse any political candidates or organizations mentioned.
          </p>
        </div>
      {/* </div> */}
    </footer>
  );
}