import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ZAYA CODE HUB',
  description: 'Read the official terms and conditions for accessing ZAYA CODE HUB services, exam portals, coding playground, and internship programs.',
  alternates: {
    canonical: 'https://zayacodehub.in/terms-of-service',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
