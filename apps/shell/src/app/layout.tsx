import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevPulse AI — Intelligent Observability & Incident Intelligence',
  description: 'Real-time developer operations dashboard with AI-powered anomaly detection, incident prediction, and DORA metrics.',
  keywords: ['observability', 'incident intelligence', 'DORA metrics', 'AI', 'DevOps', 'GitHub Actions'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-950 text-surface-100 font-sans">
        {children}
      </body>
    </html>
  );
}
