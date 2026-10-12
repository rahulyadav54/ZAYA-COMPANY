import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Development Services in Nepal | ZAYA CODE HUB',
  description: 'Explore website development, mobile app development, custom business software, AI solutions, UI/UX design, and cloud services from ZAYA CODE HUB in Bengaluru and Lalitpur.',
  keywords: [
    'ZAYA Services',
    'web development company Nepal',
    'mobile app development Nepal',
    'custom software development Nepal',
    'IT services Lalitpur',
    'custom AI solutions',
    'Next.js development services',
    'enterprise cloud architecture',
    'UI UX design agency'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/services',
  },
  openGraph: {
    title: 'Software Development Services in Nepal | ZAYA CODE HUB',
    description: 'Custom websites, mobile apps, AI integrations, and business software from teams in Bengaluru, India, and Lalitpur, Nepal.',
    url: 'https://zayacodehub.in/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
