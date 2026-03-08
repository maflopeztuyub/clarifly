import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clarifly - Smart Classroom Assistant',
  description:
    'Clarifly helps SPED students by recording lectures, generating smart task lists, and reading content aloud for clarity and accessibility.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90"></text></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 via-white to-yellow-50 min-h-screen">{children}</body>
    </html>
  );
}
