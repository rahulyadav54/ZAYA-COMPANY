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
    default: "ZAYA CODE HUB | Practice Code, DSA Problems & Proctored Skill Tests",
    template: "%s | ZAYA CODE HUB",
  },
  description:
    "ZAYA CODE HUB is the ultimate platform to practice coding, solve DSA (Data Structures & Algorithms) challenges in JavaScript, Python, C++, and Java, take proctored domain skill tests, and land remote software development internships.",
  keywords: [
    "ZAYA Code Hub",
    "practice code online",
    "practice dsa problems",
    "data structures and algorithms practice",
    "online coding arena",
    "proctored skill test online",
    "online examination portal",
    "leetcode practice online",
    "hackerrank coding challenges",
    "online code runner js python cpp java",
    "remote internship with certificate",
    "full stack web developer internship",
    "ui ux design internship",
    "python developer internship",
    "android developer internship",
    "software development internship India",
    "zaya code hub certificate verify",
    "zaya ai app",
    "ai zaya",
  ],

  // ✅ AdSense Verification & Search Engine Crawlers
  verification: {
    other: {
      "google-adsense-account": "ca-pub-1411920894777921",
    },
  },

  openGraph: {
    title: "ZAYA CODE HUB | Practice Code, DSA & Proctored Skill Tests",
    description:
      "Practice 20+ algorithmic DSA challenges, evaluate multi-language code, take proctored skill qualification tests, and apply for remote software development internships at ZAYA CODE HUB.",
    url: "https://zayacodehub.in",
    siteName: "ZAYA CODE HUB",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://zayacodehub.in/favicon.png",
        width: 800,
        height: 800,
        alt: "ZAYA CODE HUB Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ZAYA CODE HUB | Practice Code, DSA & Proctored Skill Tests",
    description:
      "Solve DSA problems online in JavaScript, Python, C++, and Java. Take proctored skill tests and get remote internships at ZAYA CODE HUB.",
    images: ["https://zayacodehub.in/favicon.png"],
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://zayacodehub.in/#organization",
      "name": "ZAYA CODE HUB",
      "url": "https://zayacodehub.in",
      "logo": "https://zayacodehub.in/favicon.png",
      "description": "ZAYA CODE HUB is an advanced coding arena, proctored examination engine, and remote software development internship platform.",
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
    },
    {
      "@type": "WebSite",
      "@id": "https://zayacodehub.in/#website",
      "url": "https://zayacodehub.in",
      "name": "ZAYA CODE HUB",
      "publisher": {
        "@id": "https://zayacodehub.in/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://zayacodehub.in/practice/code?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "ZAYA CODE HUB Coding Skill Arena",
      "operatingSystem": "All",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "description": "Interactive multi-language online code execution runner for Data Structures & Algorithms (DSA) practice in JavaScript, Python, C++, and Java."
    }
  ]
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
