'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 8 seconds
    const timer = setTimeout(() => router.push('/placement-prep/dashboard'), 8000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 scale-150" />
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Payment Successful!</h1>
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-8 text-base leading-relaxed">
          Your <strong>Placement Preparation Access</strong> is now active. Welcome to the portal!
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Amount Paid</span>
            <span className="font-black text-emerald-600">₹199</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Access</span>
            <span className="font-black text-slate-900 dark:text-white">Lifetime</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Status</span>
            <span className="font-black text-emerald-600">🟢 Active</span>
          </div>
        </div>

        <Link
          href="/placement-prep/dashboard"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider hover:shadow-xl hover:shadow-blue-600/25 transition-all active:scale-95"
        >
          Start Preparing <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-slate-400 mt-4">Redirecting automatically in a few seconds...</p>
      </div>
    </main>
  );
}
