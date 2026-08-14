import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Download, ArrowRight, Zap, Bot, Star, Smartphone } from 'lucide-react';

export default function AiZayaFeatureSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300 border-b border-slate-200 dark:border-slate-800">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Visual Product Mockup */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 dark:opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <Image
                src="/images/ai-zaya-app.png"
                alt="AI ZAYA Mobile App Showcase"
                width={550}
                height={550}
                className="rounded-xl w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">AI ZAYA Android App</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Version 1.0.4 • Free Install</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  4.9
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
              <span>Flagship Product Launch</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              Experience the Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">AI ZAYA</span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              We are excited to introduce <strong>AI ZAYA</strong> — our newly launched mobile AI assistant. Designed to boost your productivity, answer queries, write code, and assist you 24/7 directly on your smartphone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant Answers</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Get fast solutions & smart coding assistance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart Automation</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Automate daily tasks effortlessly.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="https://play.google.com/store/apps/details?id=com.zayaai.app&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="h-5 w-5" />
                <span>Install AI ZAYA App</span>
              </a>
              <Link
                href="/ai-zaya"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <span>View Product Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
