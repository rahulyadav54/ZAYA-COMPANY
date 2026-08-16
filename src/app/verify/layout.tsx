import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate | ZAYA CODE HUB",
  description: "Verify the authenticity of internship certificates and domain skill qualifications issued by ZAYA CODE HUB. Enter the Credential ID to validate official records.",
  keywords: [
    "zaya code hub certificate verify",
    "verify zaya code hub certificate",
    "zaya code hub verify",
    "certificate verification",
    "internship certificate verification India"
  ],
  alternates: {
    canonical: "https://zayacodehub.in/verify",
  },
  openGraph: {
    title: "Verify Certificate | ZAYA CODE HUB Official Record",
    description: "Verify official internship credentials, domain qualifications, and certificates from ZAYA CODE HUB.",
    url: "https://zayacodehub.in/verify",
  }
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
