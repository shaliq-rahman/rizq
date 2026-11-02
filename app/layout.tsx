import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Rizq',
  description: 'Pay off debt, step by step.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: { capable: true, title: 'Rizq', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#0F2A1D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
