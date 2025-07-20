// @ts-expect-error
import { useLocation } from 'react-router-dom';
import tilt_logo from '../assets/tilt_ai_logo.jpeg';

export default function LogoHeader({ onClick, className = "" }) {
  const location = useLocation();
  
  // Determine if header should be clickable based on URL
  const isClickable = () => {
    const path = location.pathname;
    
    // Make header non-clickable for specific routes
    // Example: non-clickable when on organization detail pages with category/topic
    if (path.includes('/organization/') && path.split('/').length > 3) {
      return false;
    }
    
    // You can add more conditions here based on your needs:
    // - Check for specific URL parameters
    // - Check for specific route patterns
    // - Check location.search for query parameters
    
    // Example: Check for a specific query parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('internal_test') === 'true') {
      return true;
    }
    
    // Default to not clickable.
    return false;

    // const searchParams = new URLSearchParams(location.search);
    // if (searchParams.get('disable_nav') === 'true') {
    //   return false;
    // }
    
    // // Default to clickable
    // return true;
  };
  
  const shouldBeClickable = isClickable() && onClick;
  
  return (
    <div 
      className={`flex items-center gap-2 justify-center sm:justify-start ${className} ${shouldBeClickable ? 'hover:opacity-80 transition-opacity' : ''}`}
      onClick={shouldBeClickable ? onClick : undefined}
      role={shouldBeClickable ? "button" : undefined}
      tabIndex={shouldBeClickable ? 0 : undefined}
      style={{ cursor: shouldBeClickable ? 'pointer' : 'default' }}
      onKeyDown={shouldBeClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
    >
      <img src={tilt_logo} className="block" width="55" height="55" alt="tilt_logo" />
      <h1 className={`text-4xl font-bold text-black ${shouldBeClickable ? '' : 'opacity-75'}`}>
        Tilt AI
      </h1>
    </div>
  );
}

// // @ts-expect-error
// import tilt_logo from '../assets/tilt_ai_logo.jpeg';

// export default function LogoHeader({ onClick, className = "" }) {
//   return (
//     <div 
//       className={`flex items-center gap-2 justify-center sm:justify-start ${className}`}
//       onClick={onClick}
//       role={onClick ? "button" : undefined}
//       tabIndex={onClick ? 0 : undefined}
//       style={{ cursor: onClick ? 'pointer' : 'default' }}
//     >
//       <img src={tilt_logo} className="block" width="55" height="55" alt="tilt_logo" />
//       <h1 className="text-4xl font-bold text-black">Tilt AI       </h1>
//     </div>
//   );
// }