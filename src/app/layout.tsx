import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScanBugs — IA Vision',
  description: 'Identifiez les nuisibles et insectes grâce à notre IA Vision',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
