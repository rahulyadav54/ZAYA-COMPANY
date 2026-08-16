import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Code & DSA Problems Online | Coding Arena',
  description: 'Solve 20+ Data Structures & Algorithms (DSA) challenges online in JavaScript, Python, C++, and Java. Live in-browser IDE runner with automated test cases on ZAYA CODE HUB.',
  keywords: [
    'practice code online',
    'practice dsa problems',
    'data structures and algorithms practice',
    'online coding arena',
    'leetcode practice online',
    'hackerrank coding challenges',
    'online IDE runner JS Python CPP Java',
    'ZAYA Code Hub Coding Arena'
  ],
  openGraph: {
    title: 'Practice Code & DSA Problems Online | ZAYA CODE HUB Coding Arena',
    description: 'Solve 20+ Data Structures & Algorithms (DSA) challenges online in JavaScript, Python, C++, and Java with live automated test case runners.',
    url: 'https://zayacodehub.in/practice/code',
  }
};

export default function CodingArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
