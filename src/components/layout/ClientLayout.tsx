'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AiZayaLaunchModal from "@/components/layout/AiZayaLaunchModal";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');
  const isExamRoom = (pathname?.startsWith('/practice/') && pathname !== '/practice' && pathname !== '/practice/code') ||
                     (pathname?.startsWith('/practice/code/') && pathname !== '/practice/code');

  if (isDashboard || isExamRoom) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-background text-foreground">
      <Header />
      <AiZayaLaunchModal />
      <main className="flex-grow pt-32 sm:pt-36">
        {children}
      </main>
      <Footer />
    </div>
  );
}
