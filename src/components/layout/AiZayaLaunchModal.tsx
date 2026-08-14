'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, X, Star, Smartphone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AiZayaLaunchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has already seen or closed the modal in this session
    const isDismissed = sessionStorage.getItem('ai_zaya_launch_modal_dismissed');
    const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');

    if (!isDismissed && !isDashboard) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700); // Flash modal shortly after site load
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('ai_zaya_launch_modal_dismissed', 'true');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-600/20 z-10 text-white overflow-hidden"
        >
          {/* Background decorative glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors z-20"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Top Launch Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Official Product Launch</span>
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">AI ZAYA</span> App
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            We are excited to launch <strong>AI ZAYA</strong> on the Google Play Store! Your personal AI assistant for coding, instant queries, and smart daily automation.
          </p>

          {/* App Preview Image Box */}
          <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden mb-6 p-2 group shadow-inner">
            <Image
              src="/images/ai-zaya-app.png"
              alt="AI ZAYA App Preview"
              width={480}
              height={300}
              className="rounded-xl w-full h-44 sm:h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1 border border-amber-400/30">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              4.9 / 5 Rating on Play Store
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Instant AI Answers</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <Smartphone className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Android 8.0+ Ready</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.zayaai.app&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all text-center"
            >
              <Download className="h-4 w-4" />
              <span>Install from Play Store</span>
            </a>

            <Link
              href="/ai-zaya"
              onClick={handleClose}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all text-center border border-slate-700 flex items-center justify-center gap-1"
            >
              <span>Explore Features</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Dismiss link */}
          <div className="mt-4 text-center">
            <button
              onClick={handleClose}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
            >
              Maybe later, continue to website
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
