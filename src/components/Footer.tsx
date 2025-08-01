// @ts-expect-error
import tilt_logo from '../assets/tilt_ai_logo.jpeg';

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
          A product of Correlation LLC
        </p> */}

        {/* Divider */}
        {/* <div className="border-t border-gray-200 mt-8 pt-8"> */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Copyright */}
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              <p>© {currentYear} Correlation LLC. All rights reserved.</p>
              <p className="mt-1">
                Data sourced from public FEC filings and other regulatory sources.
              </p>
            </div>

            {/* Social Links / Contact Info */}
            <div className="flex space-x-6">
              <a 
                href="mailto:info@correlation-llc.com" 
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
            Tilt AI and Correlation LLC do not endorse any political candidates or organizations mentioned.
          </p>
        </div>
      {/* </div> */}
    </footer>
  );
}

// // @ts-expect-error
// import tilt_logo from '../assets/tilt_ai_logo.jpeg';

// export default function Footer({ className = "" }) {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className={`bg-white text-gray-900 border-t border-gray-200 mt-auto ${className}`}>
//       <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Main Footer Content */}
//         {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> */}
          
//           {/* Company Info */}
//           {/* <div className="col-span-1 lg:col-span-2"> */}
//             <div className="flex items-center gap-3 mb-4">
//               <img src={tilt_logo} className="block" width="40" height="40" alt="Tilt AI Logo" />
//               <h3 className="text-2xl font-bold text-gray-900">Tilt AI</h3>
//             </div>
//             <p className="text-gray-600 mb-4 max-w-md">
//               Advanced political intelligence and financial contribution analysis powered by AI. 
//               Understanding the intersection of business and politics through data-driven insights.
//             </p>
//             <p className="text-sm text-gray-500">
//               A product of Correlation LLC
//             </p>
//           {/* </div> */}
 

//         {/* </div> */}

//         {/* Divider */}
//         <div className="border-t border-gray-200 mt-8 pt-8">
//           <div className="flex flex-col md:flex-row justify-between items-center">
            
//             {/* Copyright */}
//             <div className="text-sm text-gray-500 mb-4 md:mb-0">
//               <p>© {currentYear} Correlation LLC. All rights reserved.</p>
//               <p className="mt-1">
//                 Data sourced from public FEC filings and other regulatory sources.
//               </p>
//             </div>

//             {/* Social Links / Contact Info */}
//             <div className="flex space-x-6">
//               <a 
//                 href="mailto:info@correlation-llc.com" 
//                 className="text-gray-500 hover:text-gray-900 transition-colors"
//                 aria-label="Email"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                   <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                 </svg>
//               </a>
               
//             </div>
//           </div>
//         </div>

//         {/* Disclaimer */}
//         <div className="mt-6 text-xs text-gray-500 text-center">
//           <p>
//             This website provides information derived from publicly available data. 
//             Tilt AI and Correlation LLC do not endorse any political candidates or organizations mentioned.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }


//
// Original
//

// export default function Footer({ className = "" }) {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className={`bg-white text-gray-900 border-t border-gray-200 mt-auto ${className}`}>
//       <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Main Footer Content */}
//         {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> */}
          
//           {/* Company Info */}
//           {/* <div className="col-span-1 lg:col-span-2"> */}
//             <div className="flex items-center gap-3 mb-4">
//               <img src={tilt_logo} className="block" width="40" height="40" alt="Tilt AI Logo" />
//               <h3 className="text-2xl font-bold text-gray-900">Tilt AI</h3>
//             </div>
//             <p className="text-gray-600 mb-4 max-w-md">
//               Advanced political intelligence and financial contribution analysis powered by AI. 
//               Understanding the intersection of business and politics through data-driven insights.
//             </p>
//             <p className="text-sm text-gray-500">
//               A product of Correlation LLC
//             </p>
//           {/* </div> */}

//           {/* Navigation Links */}
//           {/* <div>
//             <h4 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h4>
//             <nav className="space-y-2">
//               <Link to="/" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Home
//               </Link>
//               <Link to="/organization" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Organizations
//               </Link>
//               <Link to="/query" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Search
//               </Link>
//             </nav>
//           </div> */}

//           {/* Legal & Support */}
//           {/* <div>
//             <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal & Support</h4>
//             <nav className="space-y-2">
//               <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Privacy Policy
//               </a>
//               <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Terms of Service
//               </a>
//               <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Data Sources
//               </a>
//               <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">
//                 Contact Support
//               </a>
//             </nav>
//           </div> */}

//         {/* </div> */}

//         {/* Divider */}
//         <div className="border-t border-gray-200 mt-8 pt-8">
//           <div className="flex flex-col md:flex-row justify-between items-center">
            
//             {/* Copyright */}
//             <div className="text-sm text-gray-500 mb-4 md:mb-0">
//               <p>© {currentYear} Correlation LLC. All rights reserved.</p>
//               <p className="mt-1">
//                 Data sourced from public FEC filings and other regulatory sources.
//               </p>
//             </div>

//             {/* Social Links / Contact Info */}
//             <div className="flex space-x-6">
//               <a 
//                 href="mailto:info@correlation-llc.com" 
//                 className="text-gray-500 hover:text-gray-900 transition-colors"
//                 aria-label="Email"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                   <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                 </svg>
//               </a>
              
//               {/* <a 
//                 href="#" 
//                 className="text-gray-500 hover:text-gray-900 transition-colors"
//                 aria-label="LinkedIn"
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
//                 </svg>
//               </a> */}
//             </div>
//           </div>
//         </div>

//         {/* Disclaimer */}
//         <div className="mt-6 text-xs text-gray-500 text-center">
//           <p>
//             This website provides information derived from publicly available data. 
//             Tilt AI and Correlation LLC do not endorse any political candidates or organizations mentioned.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }