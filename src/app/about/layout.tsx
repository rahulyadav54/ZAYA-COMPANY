import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | IT Services, Product Engineering & Software Development',
  description: 'Discover ZAYA CODE HUB — our mission, leadership, product engineering expertise, and the enterprise software services we deliver to businesses and startups.',
  keywords: [
    'About ZAYA CODE HUB',
    'software engineering firm Salem',
    'it services company',
    'product engineering',
    'enterprise software development'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/about',
  },
  openGraph: {
    title: 'About Us | ZAYA CODE HUB',
    description: 'Product engineering, custom software development, AI solutions and cloud services delivered by ZAYA CODE HUB.',
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
