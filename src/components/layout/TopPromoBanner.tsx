'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TopPromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');
  if (isDashboard || !isVisible) return null;

  return (
    <div className="bg-slate-900 text-white text-xs sm:text-sm py-2 px-4 relative z-50 flex items-center justify-between">
      <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center">
        <span className="text-slate-300">
          AI ZAYA App — AI Assistant
        </span>
        <Link
          href="/ai-zaya"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <span>Learn more</span>
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors absolute right-4"
        aria-label="Close Announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
