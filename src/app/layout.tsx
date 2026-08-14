import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientLayout from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zayacodehub.in"),
  title: {
    default: "ZAYA CODE HUB | Remote Internships, IT Solutions & Training",
    template: "%s | ZAYA CODE HUB",
  },
  description:
    "Apply for top remote internships at ZAYA CODE HUB in Web Development, UI/UX Design, Python, Android, and Digital Marketing. Get hands-on experience and verifiable certificates.",
  keywords: [
    "web designer internship",
    "full stack web developer internship",
    "ui ux design internship",
    "python developer internship",
    "android developer internship",
    "digital marketing internship",
    "graphic designer internship",
    "remote internship with certificate",
    "internship at zaya code hub",
    "zaya code hub internship",
    "zaya code hub certificate verify",
    "zaya ai app",
    "ai zaya",
    "software development internship",
    "IT training India",
    "Zaya Code Hub",
  ],

  // ✅ AdSense Verification
  verification: {
    other: {
      "google-adsense-account": "ca-pub-1411920894777921",
    },
  },

  openGraph: {
    title: "ZAYA CODE HUB | Remote Internships & Software Solutions",
    description:
      "Launch your career with an internship at Zaya Code Hub. Work on real-world projects, earn verifiable certificates, and gain expert mentorship.",
    url: "https://zayacodehub.in",
    siteName: "ZAYA CODE HUB",
    type: "website",
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "ZAYA CODE HUB",
  "url": "https://zayacodehub.in",
  "logo": "https://zayacodehub.in/favicon.png",
  "description": "ZAYA CODE HUB is a premier software development and IT training company offering hands-on remote internships and digital products.",
  "sameAs": [
    "https://github.com/rahulyadav54/ZAYA-COMPANY",
    "https://play.google.com/store/apps/details?id=com.zayaai.app"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Subramania Nagar",
    "addressLocality": "Salem",
    "addressRegion": "Tamil Nadu",
    "postalCode": "636005",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-7033399183",
    "contactType": "customer service",
    "email": "zayacodehub@gmail.com"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
