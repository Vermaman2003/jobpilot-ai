import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { PwaRegister } from '@/components/layout/PwaRegister';

export const metadata: Metadata = {
  title: 'JobPilot AI — Truthful AI Job Search & Application Platform',
  description:
    'Manage your entire job search lifecycle with verified candidate integrity, truthful ATS-friendly resume tailoring, and automated tracking.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AppProvider>
          <PwaRegister />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
