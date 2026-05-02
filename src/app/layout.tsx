import type { Metadata } from 'next';
import './globals.css';
import { SoundProvider } from '@/components/shared/SoundProvider';
import { CommandPalette } from '@/components/shared/CommandPalette';

export const metadata: Metadata = {
  title: {
    default: 'InvoiceOS — Premium Freelance Invoicing',
    template: '%s | InvoiceOS',
  },
  description:
    'A bespoke, high-performance invoicing platform for elite freelance software developers.',
  keywords: ['invoice', 'freelance', 'billing', 'saas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SoundProvider>
          {children}
          <CommandPalette />
        </SoundProvider>
      </body>
    </html>
  );
}
