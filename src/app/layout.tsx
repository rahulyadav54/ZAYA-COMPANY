import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ZAYA CODE HUB | Internships, Software Development & Training",
    template: "%s | ZAYA CODE HUB"
  },
  description: "Join the best internship at Zaya Code Hub. We provide top-tier software development, mobile app development, and hands-on internship programs with verifiable certificates.",
  keywords: ["internship at zaya code hub", "zaya code hub internship", "zaya code hub certificate verify", "software development internship", "IT training", "Zaya Code Hub"],
  openGraph: {
    title: "ZAYA CODE HUB | Internships & IT Solutions",
    description: "Launch your career with an internship at Zaya Code Hub. Verifiable certificates, real-world projects, and expert mentorship.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
