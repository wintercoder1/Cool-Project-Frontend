import _appLogo from './assets/compass_logo.png';

const _urlAppName = new URLSearchParams(window.location.search).get('appName');
export const APP_NAME: string = _urlAppName ?? import.meta.env.VITE_APP_NAME ?? 'Corporate Cipher';
const _logoOverride = import.meta.env.VITE_APP_LOGO_URL;
export const APP_LOGO: string = _logoOverride
  ? `${import.meta.env.BASE_URL}${_logoOverride}`.replace('//', '/')
  : _appLogo;

// Paid tier. Off while only the free tier ships: this un-registers the
// /upgrade route entirely (so the Paddle checkout can't be reached by a stale
// link or bookmark, not merely un-linked) and hides every upsell that points
// at it. ProCheckout.tsx stays in the build so it keeps type-checking.
// Flip to true to launch Pro — see the notes at the top of ProCheckout.tsx
// for what still needs doing before that.
export const PRO_ENABLED = false;
