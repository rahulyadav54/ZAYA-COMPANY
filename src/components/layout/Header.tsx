'use client';

import React from 'react';
import TopPromoBanner from './TopPromoBanner';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');

  if (isDashboard) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <TopPromoBanner />
      <Navbar />
    </header>
  );
}
