'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Calendar, CheckCircle2, XCircle, Code2, ArrowRight, Loader2 } from 'lucide-react';
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
      const cleanId = inputId.trim().toUpperCase();
      
      // 1. First, try searching for an exact match in the custom 'intern_id' column
      const { data: byCustomId } = await supabase
        .from('profiles')
        .select('*')
        .eq('intern_id', cleanId)
        .maybeSingle();

      if (byCustomId) {
        setResult(byCustomId);
        return;
      }

      // 2. If not found, try the legacy ZAYA-ID logic or direct UUID match
      const uuidPart = cleanId.replace('ZAYA-ID-', '').toLowerCase();
      
      const { data: allProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*');

      if (fetchError) throw fetchError;

      const foundProfile = allProfiles.find(p => 
        p.id.slice(0, 8).toLowerCase() === uuidPart || 
        p.id.toLowerCase() === cleanId.toLowerCase() ||
        (p.intern_id && p.intern_id.toUpperCase() === cleanId)
      );

      if (foundProfile) {
        setResult(foundProfile);
      } else {
        setError('No active intern found with this ID. Please check the ID and try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
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

      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-600/10">
            <ShieldCheck className="h-4 w-4" /> Official Verification Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight leading-tight italic">
            Verify <span className="text-blue-600 underline decoration-blue-600/30 underline-offset-8">Intern Credentials</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto text-sm uppercase tracking-widest">
            Authenticate Zaya Code Hub ID Cards and Offer Letters instantly using the Intern ID.
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
            
            <form onSubmit={handleVerify} className="relative z-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 text-center">
                  Enter Intern ID (e.g. ZCH-2026-9528)
                </label>
                <input
                  type="text"
                  placeholder="ZCH-2026-XXXX"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-xl font-black text-foreground placeholder:text-slate-300 focus:outline-none focus:border-blue-600 transition-all uppercase text-center tracking-widest"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value.toUpperCase())}
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !inputId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Credentials'}
              </button>
            </form>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400 shadow-lg"
              >
                <XCircle className="h-8 w-8 shrink-0" />
                <p className="font-bold text-sm leading-relaxed">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-[2.5rem] space-y-8 shadow-xl"
              >
                <div className="flex items-center gap-6">
                   <div className="h-24 w-24 rounded-3xl bg-white dark:bg-slate-800 p-1 shadow-xl shrink-0 overflow-hidden">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} alt={result.full_name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black uppercase">
                          {result.full_name.charAt(0)}
                        </div>
                      )}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{result.full_name}</h2>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">{result.position || 'Software Intern'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-green-200/50 dark:border-green-800/50">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                      <p className="text-sm font-black text-green-600 flex items-center gap-2 uppercase italic">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Verified Intern
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
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentic Zaya Record</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
           <Link href="/" className="text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all inline-flex items-center gap-2">
              Return to Homepage <ArrowRight className="h-3 w-3" />
           </Link>
        </div>
      </div>
    </div>
  );
}
