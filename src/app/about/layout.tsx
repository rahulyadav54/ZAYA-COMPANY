import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ZAYA CODE HUB | Bengaluru Headquarters, Nepal Office',
  description: 'Discover ZAYA CODE HUB — our mission, leadership, product engineering expertise, and the enterprise software services we deliver to businesses and startups.',
  keywords: [
    'About ZAYA CODE HUB',
    'software engineering company Bengaluru India',
    'software engineering firm Lalitpur Nepal',
    'software company in Lalitpur',
    'IT company Lalitpur Nepal',
    'it services company',
    'product engineering',
    'enterprise software development'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/about',
  },
  openGraph: {
    title: 'About ZAYA CODE HUB | Bengaluru and Nepal',
    description: 'Meet the team and products of ZAYA CODE HUB, headquartered in Bengaluru with an office in Lalitpur, Nepal.',
    url: 'https://zayacodehub.in/about',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
