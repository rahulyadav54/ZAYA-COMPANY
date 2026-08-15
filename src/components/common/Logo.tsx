'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  forceWhite?: boolean;
}

export default function Logo({ subtitle, className = '', size = 'md', href = '/', forceWhite = false }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl'
  };

  const mainTextColor = forceWhite ? 'text-white' : 'text-slate-900 dark:text-white';
  const subTextColor = forceWhite ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400';

  const logoContent = (
    <div className={`flex items-center gap-3 group shrink-0 ${className}`}>
      {/* 3D Glassmorphic Tech Emblem */}
      <div className="relative shrink-0">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 opacity-60 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-300" />
        
        {/* Glassmorphic Container */}
        <div className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-0.5 border border-white/20 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
          {/* Inner Gloss Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50" />
          
          {/* Code Diamond Symbol */}
          <div className="relative flex items-center justify-center font-black tracking-tighter text-cyan-400 font-mono drop-shadow-[0_2px_4px_rgba(6,182,212,0.5)]">
            <span className="text-blue-500 font-bold">&lt;</span>
            <span className="text-white font-extrabold text-[1.1em] px-[1px]">/</span>
            <span className="text-cyan-400 font-bold">&gt;</span>
          </div>

          {/* Pulsating Live Status Dot */}
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-sm animate-pulse" />
        </div>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-black tracking-tight ${mainTextColor} leading-none whitespace-nowrap`}>
          <span>ZAYA</span>
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">CODE</span>
          <span>HUB</span>
        </span>
        
        {subtitle ? (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block mt-1 self-start border border-blue-500/20">
            {subtitle}
          </span>
        ) : (
          <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subTextColor} mt-1`}>
            Software & Tech Hub
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
