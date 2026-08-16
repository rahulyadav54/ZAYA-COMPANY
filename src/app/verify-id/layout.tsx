import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intern ID Card Verification | Official Authenticity Portal',
  description: 'Verify official intern identification credentials issued by ZAYA CODE HUB. Instant real-time cryptographic verification of student identity, role, department, and valid duration.',
  keywords: [
    'ZAYA ID Card Verification',
    'verify intern id online',
    'student credential check',
    'official intern badge verification'
  ],
  alternates: {
    canonical: 'https://zayacodehub.in/verify-id',
  },
  openGraph: {
    title: 'Intern ID Card Verification | ZAYA CODE HUB',
    description: 'Instant real-time verification of student intern badges and credentials issued by ZAYA CODE HUB.',
    url: 'https://zayacodehub.in/verify-id',
  },
};

export default function VerifyIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
