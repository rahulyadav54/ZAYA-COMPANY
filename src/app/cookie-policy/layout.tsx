import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | ZAYA CODE HUB',
  description: 'Understand how ZAYA CODE HUB utilizes cookies and browser storage technologies to deliver a secure, personalized user experience.',
  alternates: {
    canonical: 'https://zayacodehub.in/cookie-policy',
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
