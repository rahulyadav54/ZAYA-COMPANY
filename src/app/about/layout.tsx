import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Leading IT Solutions & Developer Education',
  description: 'Learn about ZAYA CODE HUB — our vision, mission, leadership team, cutting-edge software engineering capabilities, and commitment to empowering developers across India.',
  keywords: [
    'About ZAYA CODE HUB',
    'ZAYA Company',
    'software engineering firm Salem',
    'developer training institute India',
    'remote tech internships',
    'AI education and web development'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/about',
  },
  openGraph: {
    title: 'About Us | ZAYA CODE HUB',
    description: 'Empowering future developers with hands-on practice, AI-assisted proctored testing, and enterprise-grade software development.',
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
