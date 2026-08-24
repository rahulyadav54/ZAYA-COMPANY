"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zaya_cookie_consent");
      setConsent(stored);
      if (!stored) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const applyConsent = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem("zaya_cookie_consent", value);
      document.cookie = `zaya_cookie_consent=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch (e) {}
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 sm:inset-x-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black">Z</div>
        </div>

        <div className="flex-1">
          <h3 className="font-black text-sm">We use cookies to improve your experience</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">We and our partners use cookies for site functionality, analytics, and personalised content. You can accept all cookies or reject non-essential cookies.</p>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => applyConsent("accepted")} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Accept</button>
            <button onClick={() => applyConsent("rejected")} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">Reject</button>
            <Link href="/privacy-policy" className="text-xs text-slate-600 dark:text-slate-300 ml-2 underline">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
