import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Romania Trip Map',
  description: 'Interactive map and itinerary for Romania trip',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

