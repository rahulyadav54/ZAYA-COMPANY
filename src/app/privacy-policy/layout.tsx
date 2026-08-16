import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ZAYA CODE HUB',
  description: 'Read the official privacy policy of ZAYA CODE HUB regarding data protection, user security, cookies, and user privacy.',
  alternates: {
    canonical: 'https://zayacodehub.in/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
