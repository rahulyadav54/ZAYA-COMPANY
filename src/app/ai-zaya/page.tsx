import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Download, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Code, 
  Bot, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  QrCode, 
  Share2,
  Cpu,
  Globe
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI ZAYA — Intelligent Mobile AI Assistant | ZAYA CODE HUB',
  description: 'Download and install AI ZAYA, our flagship AI mobile application for Android. Powered by advanced artificial intelligence for coding, productivity, and smart automation.',
};

export default function AiZayaPage() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: "Lightning Fast Responses",
      description: "Get instant answers, code snippets, and creative ideas powered by state-of-the-art AI engines."
    },
    {
      icon: <Code className="h-6 w-6 text-blue-500" />,
      title: "Built-in Code Assistant",
      description: "Debug code, generate full scripts, and solve programming problems directly from your phone."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      title: "Enterprise Security & Privacy",
      description: "Your conversations and queries are end-to-end protected with maximum data privacy."
    },
    {
      icon: <Bot className="h-6 w-6 text-purple-500" />,
      title: "Smart Conversational AI",
      description: "Engage in natural context-aware conversations for brainstorms, learning, and daily tasks."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-cyan-500" />,
      title: "Sleek Mobile UI",
      description: "Designed specifically for modern Android devices with smooth dark mode and quick actions."
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-500" />,
      title: "Multi-Language Support",
      description: "Communicates fluently in English, Hindi, and 30+ international languages."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Download App",
      description: "Click the Install button or scan the QR code to download AI ZAYA from Google Play or direct APK."
    },
    {
      step: "02",
      title: "Instant Setup",
      description: "Launch the app on your Android device and sign in with your ZAYA Code Hub or Google account."
    },
    {
      step: "03",
      title: "Start Using AI",
      description: "Ask questions, write code, automate workflows, and boost your daily productivity immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 selection:bg-blue-600 selection:text-white">
      {/* Background glow graphics */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-12 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4 animate-pulse text-amber-400" />
              <span>OFFICIALLY LAUNCHED — GET IT ON MOBILE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">AI ZAYA</span>
              <br />Your Personal AI Assistant
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              Supercharge your phone with AI ZAYA. From instant code debugging and smart writing to real-time problem solving, experience next-level artificial intelligence in the palm of your hand.
            </p>

            {/* Install Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <a
                href="https://play.google.com/store/apps/details?id=com.zayaai.app&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Download className="h-6 w-6" />
                <span>Install on Google Play</span>
              </a>

              <a
                href="#direct-apk"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-lg hover:bg-slate-800 transition-all"
              >
                <Smartphone className="h-5 w-5 text-blue-400" />
                <span>Direct APK Download</span>
              </a>
            </div>

            {/* Ratings & Quick Specs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-white ml-2">4.9 / 5</span>
              </div>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div>📱 Compatible with Android 8.0+</div>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div>⚡ 100% Free to Install</div>
            </div>
          </div>

          {/* App Preview Image Container */}
          <div className="flex-1 w-full max-w-md lg:max-w-xl relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-purple-600/30 blur-2xl rounded-full transform scale-90" />
            <div className="relative rounded-3xl p-3 bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden hover:border-blue-500/50 transition-colors">
              <Image
                src="/images/ai-zaya-app.png"
                alt="AI ZAYA Mobile Application Preview"
                width={600}
                height={600}
                className="rounded-2xl object-cover shadow-lg w-full h-auto"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/60">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Install <span className="text-blue-400">AI ZAYA</span>?
            </h2>
            <p className="text-slate-400 text-lg">
              Packed with cutting-edge tools to help developers, students, and professionals work smarter every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/80 transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-slate-800/60 w-fit mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Install Section */}
      <section className="py-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple 3-Step Installation
          </h2>
          <p className="text-slate-400 text-lg">Get AI ZAYA up and running on your phone in under a minute.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s, index) => (
            <div key={index} className="relative p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-4xl font-black text-blue-500/20 mb-4">{s.step}</div>
              <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QR Code & Direct Download Box */}
      <section id="direct-apk" className="py-16 container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 p-8 sm:p-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">GET THE APP NOW</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4">
                Ready to Experience AI ZAYA?
              </h3>
              <p className="text-slate-300 text-sm mb-6 max-w-lg">
                Click below to download the latest AI ZAYA APK directly or grab it from Google Play Store.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <a
                  href="https://play.google.com/store/apps/details?id=com.zayaai.app&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg"
                >
                  Get on Play Store
                </a>
                <a
                  href="#"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
                >
                  Download .APK (v1.0.4)
                </a>
              </div>
            </div>

            {/* QR Code Simulation */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white text-slate-900 shadow-xl">
              <QrCode className="h-28 w-28 text-slate-900 mb-2" />
              <span className="text-xs font-bold text-slate-700">Scan to Install on Mobile</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
