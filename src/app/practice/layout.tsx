import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Skill Tests & Online Exams',
  description: 'Take online proctored domain skill qualification tests, track daily streaks, earn XP points, and unlock achievements on ZAYA CODE HUB.',
  keywords: [
    'ZAYA Code Hub Practice',
    'practice skill test online',
    'online exam portal',
    'proctored domain exam',
    'full stack developer exam',
    'coding certification test',
    'free online skill assessment'
  ],
  openGraph: {
    title: 'Practice Skill Tests & Proctored Exams | ZAYA CODE HUB',
    description: 'Take online proctored domain skill qualification tests, track daily streaks, earn XP points, and unlock achievements on ZAYA CODE HUB.',
    url: 'https://zayacodehub.in/practice',
  }
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
