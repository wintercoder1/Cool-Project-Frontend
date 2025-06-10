// @ts-expect-error
import tilt_logo from '../assets/tilt_ai_logo.jpeg';

export default function LogoHeader({ onClick, className = "" }) {
  return (
    <div 
      className={`flex items-center gap-2 justify-center sm:justify-start ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img src={tilt_logo} className="block" width="55" height="55" alt="blue_check_logo" />
      <h1 className="text-4xl font-bold text-black">Tilt AI       </h1>
    </div>
  );
}