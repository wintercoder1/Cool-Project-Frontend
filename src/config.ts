import _appLogo from './assets/compass_logo.png';

const _urlAppName = new URLSearchParams(window.location.search).get('appName');
export const APP_NAME: string = _urlAppName ?? import.meta.env.VITE_APP_NAME ?? 'Compass AI';
const _logoOverride = import.meta.env.VITE_APP_LOGO_URL;
export const APP_LOGO: string = _logoOverride
  ? `${import.meta.env.BASE_URL}${_logoOverride}`.replace('//', '/')
  : _appLogo;
