import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string;
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT as string;

export default function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not yet loaded
    }
  }, []);

  if (!ADSENSE_CLIENT || ADSENSE_CLIENT.includes('XXXX')) return null;

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
