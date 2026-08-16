import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Magazine & Tech Blog | Web Dev, AI, Cloud & Coding Insights',
  description: 'Read the latest technical tutorials, web development tips, artificial intelligence updates, data structures and algorithms explanations, and developer guides from ZAYA CODE HUB.',
  keywords: [
    'ZAYA Magazine',
    'tech articles web development',
    'DSA tutorials JavaScript Python',
    'software engineering blogs',
    'AI developments news',
    'Next.js tutorials'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/magazine',
  },
  openGraph: {
    title: 'Magazine & Tech Blog | ZAYA CODE HUB',
    description: 'Read the latest technical articles, career advice, and coding tutorials from the ZAYA engineering team.',
    url: 'https://zayacodehub.in/magazine',
  },
};

export default function MagazineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
