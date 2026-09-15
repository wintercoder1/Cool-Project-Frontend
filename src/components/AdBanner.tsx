import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string;
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT as string;

/** Unconfigured, or still carrying the placeholder from the repo. */
const isConfigured = (): boolean =>
  Boolean(ADSENSE_CLIENT) && !ADSENSE_CLIENT.includes('XXXX');

/**
 * Load adsbygoogle.js on demand, once per document.
 *
 * This used to be a <script> tag in index.html, which meant it loaded on every
 * route — including /quiz/result?a=<token>. The ad request reports the page URL
 * in its `url=` parameter, and on that route the URL *is* the share token,
 * which decodes to the reader's political positions. So every shared result
 * handed those answers to Google's ad servers, on a page that never showed an
 * ad. Loading from the component instead means the script only ever enters a
 * document that is actually rendering an ad unit.
 */
function loadAdSenseOnce(): void {
  if (document.querySelector('script[data-adsense-loader]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
    encodeURIComponent(ADSENSE_CLIENT);
  script.dataset.adsenseLoader = 'true';
  document.head.appendChild(script);
}

/**
 * One ad unit, and the only thing that pulls in the AdSense script.
 *
 * Deliberately absent from /quiz and /quiz/result — see loadAdSenseOnce above.
 * Also kept off the auth pages, the waiting screen and the 404, which have no
 * publisher content of their own and so are a policy problem rather than a
 * design preference.
 *
 * NOTE: the script cannot be unloaded once injected, so a visitor who sees an
 * ad and then opens the quiz still has it in the document. That is harmless
 * while every ad unit is placed explicitly, because no <ins> on the quiz means
 * no ad request and so no URL reported. It stops being harmless if Auto Ads is
 * ever switched on in the AdSense dashboard — that lets the script place units
 * on any page it is loaded into, quiz pages included. Keep Auto Ads off.
 */
export default function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    if (!isConfigured() || pushed.current) return;
    pushed.current = true;

    loadAdSenseOnce();
    try {
      // The queue exists before the script does; pushes made now are drained
      // once it loads, so ordering here does not matter.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle unavailable (blocked, offline). Nothing to recover.
    }
  }, []);

  if (!isConfigured()) return null;

  return (
    <div className="w-full flex justify-center bg-white py-1">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
