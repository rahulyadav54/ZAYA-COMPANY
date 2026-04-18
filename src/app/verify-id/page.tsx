'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Search, User, Calendar, CheckCircle2, XCircle, Code2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function IDVerificationPage() {
  const [inputId, setInputId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Extract the original UUID part from ZAYA-ID-XXXXXXXX
      const searchPart = inputId.replace('ZAYA-ID-', '').toLowerCase();
      
      // We need to find a profile where the first 8 chars of the ID match
      // Since we can't easily query by slice in simple Supabase client without RPC, 
      // we'll fetch all and filter if it's a small number, OR just use the full UUID if provided.
      // But for a professional feel, let's search by the custom ID format.
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*');

      if (fetchError) throw fetchError;

      const foundProfile = data.find(p => p.id.slice(0, 8).toLowerCase() === searchPart || p.id === inputId);

      if (foundProfile) {
        setResult(foundProfile);
      } else {
        setError('No active intern found with this ID. Please check the ID and try again.');
      }
    } catch (err: any) {
      setError('An error occurred while verifying the identity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-20">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2 mb-12">
        <Code2 className="h-10 w-10 text-blue-600" />
        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white italic uppercase">
          ZAYA<span className="text-blue-600">CODE</span>HUB
        </span>
      </Link>

      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 md:p-12 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-2">
              <ShieldCheck className="h-4 w-4" /> Secure Verification
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Intern Verification</h1>
            <p className="text-slate-500 font-medium">Verify the identity and internship status of Zaya Code Hub members.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={inputId}
                onChange={(e) => setInputId(e.target.value.toUpperCase())}
                placeholder="ENTER INTERN ID (e.g. ZAYA-ID-XXXX)"
                className="w-full px-8 py-5 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-600 transition-all text-center font-black text-lg tracking-widest placeholder:text-slate-400 placeholder:font-bold"
              />
              {loading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                </div>
              )}
            </div>
            <button 
              type="submit"
              disabled={loading || !inputId}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:bg-slate-200 dark:disabled:bg-slate-800"
            >
              Verify Identity
            </button>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400"
              >
                <XCircle className="h-8 w-8 shrink-0" />
                <p className="font-bold text-sm leading-relaxed">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-[2.5rem] space-y-8"
              >
                <div className="flex items-center gap-6">
                   <div className="h-24 w-24 rounded-3xl bg-white dark:bg-slate-800 p-1 shadow-xl shrink-0 overflow-hidden">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} alt={result.full_name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                          {result.full_name.charAt(0)}
                        </div>
                      )}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{result.full_name}</h2>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">{result.role || 'Software Intern'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-green-200/50 dark:border-green-800/50">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                      <p className="text-sm font-black text-green-600 flex items-center gap-2 uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Active Intern
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined On</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                   </div>
                </div>

                <div className="flex items-center justify-center pt-4">
                   <div className="px-6 py-2 bg-white dark:bg-slate-900 rounded-full border border-green-200 dark:border-green-800 shadow-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentic Record</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
           <Link href="/" className="text-slate-400 hover:text-blue-600 font-bold text-sm transition-all inline-flex items-center gap-2">
              Return to Homepage <ArrowRight className="h-4 w-4" />
           </Link>
        </div>
      </div>
    </div>
  );
}
