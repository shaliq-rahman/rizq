'use client';

import { useEffect } from 'react';

// The Rizq UI is rendered by lib/rizq-app.js (it manages #root itself).
// Local-first: it starts instantly from localStorage; Firebase sync attaches afterwards.
export default function RizqApp() {
  useEffect(() => {
    (async () => {
      // Your personal starting data (lib/seed.json) is only used in local development,
      // for the one-time upload to the cloud. It is never included in the production build.
      const seed =
        process.env.NODE_ENV === 'production' ? null : (await import('../lib/seed.json')).default;
      const { startRizq } = await import('../lib/rizq-app.js');
      startRizq(seed);
      const { initCloud } = await import('../lib/cloud');
      initCloud();
    })();
  }, []);

  return (
    <>
      <div id="root" role="main" suppressHydrationWarning />
      <canvas id="confetti" />
    </>
  );
}
