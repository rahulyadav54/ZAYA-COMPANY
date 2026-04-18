import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate | Zaya Code Hub",
  description: "Verify the authenticity of internship certificates issued by Zaya Code Hub. Enter the Credential ID to validate official records.",
  keywords: ["zaya code hub certificate verify", "verify zaya code hub certificate", "zaya code hub verify", "certificate verification"],
  openGraph: {
    title: "Zaya Code Hub Certificate Verify",
    description: "Verify official internship credentials and certificates from Zaya Code Hub.",
    url: "https://zayacodehub.in/verify",
  }
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
