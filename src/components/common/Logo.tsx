"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  forceWhite?: boolean;
}

export default function Logo({ subtitle, className = '', size = 'md', href = '/', forceWhite = false }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
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
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <Image src="/logo.png" alt="ZAYA CODE HUB" width={48} height={48} className="object-contain" />
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <div className={`${textSizes[size]} font-bold tracking-tight leading-none whitespace-nowrap flex items-center gap-1`}>
          <span className={mainTextColor}>
            ZAYA
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            CODE
          </span>
          <span className={mainTextColor}>
            HUB
          </span>
        </div>

        {subtitle ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block mt-1 self-start border border-blue-500/20">
            {subtitle}
          </span>
        ) : (
          <span className={`text-[9px] font-medium uppercase tracking-widest ${subTextColor} mt-1`}>
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
