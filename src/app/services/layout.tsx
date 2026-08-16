import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services | Full Stack Web, Mobile Apps, AI & Cloud Solutions',
  description: 'Explore professional technology solutions by ZAYA CODE HUB: Custom Web Development, Mobile Apps (React Native/Android), Enterprise AI Integrations, Cloud Infrastructure, and Technical Training.',
  keywords: [
    'ZAYA Services',
    'web development services India',
    'mobile app development company',
    'custom AI solutions',
    'Next.js development services',
    'enterprise cloud architecture',
    'UI UX design agency'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/services',
  },
  openGraph: {
    title: 'Enterprise Tech & Development Services | ZAYA CODE HUB',
    description: 'Custom Web Apps, Mobile Development, AI Integration, and Dedicated Developer Training Services.',
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
