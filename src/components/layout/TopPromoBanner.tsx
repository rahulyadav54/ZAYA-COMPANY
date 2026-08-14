'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X, Smartphone } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TopPromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');
  if (isDashboard || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white text-xs sm:text-sm py-2 px-4 relative z-50 flex items-center justify-between shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center">
        <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full text-[11px] border border-amber-400/30">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
          NEW LAUNCH
        </span>

        <span className="font-medium text-slate-100 flex items-center gap-1.5">
          <Smartphone className="h-4 w-4 hidden sm:inline text-blue-200" />
          <span>Presenting <strong className="text-white font-bold">AI ZAYA</strong> — Our Flagship AI Mobile App!</span>
        </span>

        <Link
          href="/ai-zaya"
          className="inline-flex items-center gap-1 bg-white text-blue-700 hover:bg-blue-50 font-bold px-3 py-1 rounded-full transition-all text-xs shadow-sm hover:scale-105 active:scale-95 ml-1"
        >
          <span>Install Now</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
        aria-label="Close Announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
