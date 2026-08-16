import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio & Case Studies | Successful Projects by ZAYA CODE HUB',
  description: 'Discover the innovative products and client solutions built by ZAYA CODE HUB, including the ZAYA AI Assistant, Anti-Cheating Exam Engine, and Cloud SaaS platforms.',
  keywords: [
    'ZAYA Portfolio',
    'software engineering projects',
    'web development case studies',
    'AI application showcase',
    'student projects ZAYA'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/portfolio',
  },
  openGraph: {
    title: 'Portfolio & Projects Showcase | ZAYA CODE HUB',
    description: 'Explore high-performance web applications, AI systems, and platforms crafted by ZAYA CODE HUB.',
    url: 'https://zayacodehub.in/portfolio',
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
