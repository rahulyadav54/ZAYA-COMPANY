import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact ZAYA CODE HUB | Bengaluru HQ & Nepal Office',
  description: 'Contact ZAYA CODE HUB, headquartered in Bengaluru with an office in Lalitpur, Nepal, about software, mobile apps, AI projects, partnerships, and support.',
  keywords: [
    'Contact ZAYA CODE HUB',
    'ZAYA support email',
    'ZAYA office phone number',
    'IT company Bengaluru',
    'IT company Lalitpur Nepal'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/contact',
  },
  openGraph: {
    title: 'Contact ZAYA CODE HUB | Bengaluru and Nepal',
    description: 'Reach our headquarters in Bengaluru or office in Lalitpur, Nepal about software, apps, AI, and partnerships.',
    url: 'https://zayacodehub.in/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
