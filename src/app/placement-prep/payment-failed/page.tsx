'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-red-950/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20 scale-150" />
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
            <XCircle className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Payment Failed</h1>

        <p className="text-slate-600 dark:text-slate-400 mb-8 text-base leading-relaxed">
          We couldn&apos;t verify your payment. Please try again. If your money was deducted, it will be refunded automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/placement-prep#unlock"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-blue-600/25 transition-all active:scale-95"
          >
            Try Again
          </Link>
          <a
            href="mailto:zayacodehub@gmail.com?subject=Placement Portal Payment Issue"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-8">
          <Link
            href="/placement-prep"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Landing Page
          </Link>
        </div>
      </div>
    </main>
  );
}
