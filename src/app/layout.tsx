import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Taskbar } from '@/components/Taskbar';

export const metadata: Metadata = {
  title: "Mare Observation Chamber",
  description: 'A personal blog with Windows 98 vibes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{ minHeight: '100vh', paddingBottom: '32px' }}>
            {children}
          </div>
          <Taskbar />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/character.png"
            alt=""
            style={{
              position: 'fixed',
              bottom: 28,
              right: 0,
              height: 280,

              width: 'auto',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
