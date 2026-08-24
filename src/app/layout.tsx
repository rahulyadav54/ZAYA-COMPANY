import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientLayout from "@/components/layout/ClientLayout";
import CookieBanner from "@/components/layout/CookieBanner";

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
    default: "ZAYA CODE HUB | IT Company in India & Software Development",
    template: "%s | ZAYA CODE HUB",
  },
  description:
    "ZAYA CODE HUB is an IT company in India building custom web and mobile applications, AI automation, cloud integrations, and enterprise software for startups and businesses.",
  keywords: [
    "ZAYA CODE HUB",
    "ZAYA",
    "software development company",
    "it services",
    "web development",
    "mobile app development",
    "ai automation",
    "cloud solutions",
    "ui ux design",
    "enterprise software",
    "custom software development",
    "product engineering",
    "zayacodehub.in",
    "salem software company",
    "technology consultancy",
    "IT company in India",
    "best IT company in India",
  ],
  authors: [{ name: "ZAYA CODE HUB Team", url: "https://zayacodehub.in" }],
  creator: "ZAYA CODE HUB",
  publisher: "ZAYA CODE HUB",
  category: "technology",
  alternates: {
    canonical: "https://zayacodehub.in",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ✅ AdSense Verification & Search Engine Crawlers
  verification: {
    other: {
      "google-adsense-account": "ca-pub-1411920894777921",
    },
  },

  openGraph: {
    title: "ZAYA CODE HUB | IT Company in India & Software Development",
    description:
      "Custom software, web and mobile apps, AI solutions, and cloud services from an India-based product engineering team.",
    url: "https://zayacodehub.in",
    siteName: "ZAYA CODE HUB",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://zayacodehub.in/logo.png",
        width: 800,
        height: 800,
        alt: "ZAYA CODE HUB",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ZAYA CODE HUB | Software Development & IT Services",
    description:
      "Product engineering, web & mobile apps, AI automation, and cloud services for businesses and startups.",
    images: ["https://zayacodehub.in/logo.png"],
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://zayacodehub.in/#organization",
      "name": "ZAYA CODE HUB",
      "url": "https://zayacodehub.in",
      "logo": "https://zayacodehub.in/favicon.png",
      "description": "ZAYA CODE HUB is a software product engineering and IT services company delivering web, mobile, AI, and cloud solutions to businesses and startups.",
      "founder": { "@id": "https://zayacodehub.in/ceo/rahul-kumar-yadav#person" },
      "areaServed": { "@type": "Country", "name": "India" },
      "serviceType": ["Software development", "IT consulting", "Mobile app development", "AI automation"],
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
        "target": "https://zayacodehub.in/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "ZAYA CODE HUB - Product Suite",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "Contact",
        "priceCurrency": "INR"
      },
      "description": "A portfolio of enterprise and consumer products built and maintained by ZAYA CODE HUB including AI assistants, school management, telemedicine, and e-commerce solutions."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What services does ZAYA CODE HUB provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We provide custom web and mobile application development, AI & automation, UI/UX design, cloud integration, and long-term product engineering partnerships."
          }
        },
        {
          "@type": "Question",
          "name": "Who are your typical clients?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Startups, small businesses, educational institutions, and enterprises looking for end-to-end software development and maintenance."
          }
        },
        {
          "@type": "Question",
          "name": "How can I contact ZAYA CODE HUB for a project?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Visit our contact page at https://zayacodehub.in/contact or email zayacodehub@gmail.com to request a consultation and project estimate."
          }
        }
      ]
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
          <CookieBanner />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
