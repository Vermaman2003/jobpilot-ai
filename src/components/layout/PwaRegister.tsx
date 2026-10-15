'use client';

import { useEffect } from 'react';

export const PwaRegister: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.info('JobPilot AI PWA Service Worker registered:', registration.scope);
        })
        .catch((err) => {
          console.debug('Service Worker registration skipped:', err);
        });
    }
  }, []);

  return null;
};
