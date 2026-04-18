'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import IDCard from '@/components/intern/IDCard';
import { Download, Share2, Printer, ShieldCheck, CreditCard } from 'lucide-react';

export default function InternIDCardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile({ ...data, ...user.user_metadata });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg">
               <CreditCard className="h-5 w-5" />
             </div>
             <span className="text-sm font-black text-blue-600 uppercase tracking-widest">Digital Identity</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Virtual ID Card</h1>
           <p className="text-slate-500 mt-2 text-lg">Your official ZAYA CODE HUB intern identity for the 2026 program.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all active:scale-95 shadow-lg">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20">
            <Download className="h-4 w-4" /> Download ID
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: ID Card Preview */}
        <div className="py-10">
           {profile && <IDCard profile={profile} />}
        </div>

        {/* Right: Info & Guidelines */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-6 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-500" />
                Security & Usage
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">1</div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">Official Verification</p>
                      <p className="text-sm text-slate-500 font-medium">This ID card is your official proof of internship at Zaya Code Hub. It can be verified by any employer using your unique Intern ID.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">2</div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">Digital-First Access</p>
                      <p className="text-sm text-slate-500 font-medium">Use this virtual ID for internal meetings, community events, and workshop access throughout your tenure.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">3</div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">Profile Sync</p>
                      <p className="text-sm text-slate-500 font-medium">Any changes you make to your profile settings will automatically be reflected on this ID card in real-time.</p>
                   </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-blue-600/5 rounded-2xl border border-blue-600/10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-blue-900 dark:text-blue-100 text-sm">Share on LinkedIn</span>
                 </div>
                 <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Copy Link</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
