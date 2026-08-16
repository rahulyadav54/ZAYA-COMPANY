import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers & Remote Tech Internships | Work with ZAYA CODE HUB',
  description: 'Apply for remote software development internships and job openings at ZAYA CODE HUB. Positions available in Full Stack Web Development, Python, UI/UX Design, React, Node.js, and Mobile App Development.',
  keywords: [
    'ZAYA Careers',
    'remote internship software development',
    'remote web developer internship India',
    'Python developer internship with certificate',
    'frontend react developer internship',
    'UI UX designer internship remote',
    'college student summer internship'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/careers',
  },
  openGraph: {
    title: 'Careers & Remote Tech Internships | ZAYA CODE HUB',
    description: 'Join ZAYA CODE HUB. Work on live production projects, receive mentorship, get certified, and accelerate your engineering career.',
    url: 'https://zayacodehub.in/careers',
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
