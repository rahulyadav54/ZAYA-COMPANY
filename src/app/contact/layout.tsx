import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Get in Touch with ZAYA CODE HUB',
  description: 'Connect with ZAYA CODE HUB for technical support, business inquiries, partnership requests, or questions regarding our proctored exams and internships.',
  keywords: [
    'Contact ZAYA CODE HUB',
    'ZAYA support email',
    'ZAYA office phone number',
    'Salem Tamil Nadu IT company'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/contact',
  },
  openGraph: {
    title: 'Contact Us | ZAYA CODE HUB',
    description: 'Reach out to the ZAYA CODE HUB team for inquiries, support, and technical partnerships.',
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
