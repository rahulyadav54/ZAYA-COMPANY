'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, ShieldCheck, AlertCircle, Calendar, User, BookOpen, Loader2, Award } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing Scan...');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setIsVerifying(true);
    setError('');
    setResult(null);
    setProgress(0);
    setStatusMsg('Connecting to Zaya Registry...');

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 10) setStatusMsg('Searching Records...');
        if (next >= 40) setStatusMsg('Verifying Digital Signature...');
        if (next >= 70) setStatusMsg('Authenticating Credential ID...');
        if (next >= 90) setStatusMsg('Finalizing Result...');
        
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 150);

    try {
      const { data, error: fetchError } = await supabase
        .from('submissions')
        .select(`
          *,
          tasks:task_id(title),
          profiles:intern_id(full_name)
        `)
        .eq('certificate_id', certId.trim().toUpperCase())
        .eq('review_status', 'approved')
        .single();

      // Wait for progress to reach 100 before showing result
      setTimeout(() => {
        if (fetchError || !data) {
          setError('Invalid Certificate ID. Please check the ID and try again.');
          setIsVerifying(false);
        } else {
          setResult(data);
          setIsVerifying(false);
        }
      }, 2500);

    } catch (err) {
      setError('An error occurred while verifying. Please try again later.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Background Ornaments */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            Official Verification Portal
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight italic uppercase leading-none">
            Verify <span className="text-blue-500">Certificate</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
            Enter the unique Verification ID found on the bottom of the certificate to confirm its authenticity.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleVerify} className="relative group">
            <input 
              type="text" 
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. ZCH-2026-X7Y9"
              className="w-full px-8 py-6 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border-2 border-white/10 focus:border-blue-500 focus:ring-0 transition-all text-xl font-bold uppercase tracking-widest placeholder:text-slate-600 placeholder:normal-case"
            />
            <button 
              type="submit"
              disabled={isVerifying}
              className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 rounded-[2rem] text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
            >
              {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          {error && (
            <div className="mt-6 flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* Processing / Scanning UI */}
        {isVerifying && (
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] border border-blue-500/20 shadow-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="p-16 flex flex-col items-center space-y-10">
                <div className="relative">
                   <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                   <ShieldCheck className="h-24 w-24 text-blue-500 relative z-10 animate-bounce" />
                </div>
                
                <div className="text-center space-y-2">
                   <h2 className="text-4xl font-black italic uppercase tracking-tight">{progress}%</h2>
                   <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs">{statusMsg}</p>
                </div>

                <div className="w-full max-w-md h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <div 
                      className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                      style={{ width: `${progress}%` }}
                   />
                </div>
             </div>
          </div>
        )}

        {/* Result Card */}
        {result && !isVerifying && (
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] border border-blue-500/20 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-12 space-y-10">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-500/10 rounded-full">
                       <ShieldCheck className="h-10 w-10 text-green-500" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black uppercase italic tracking-tight">Verified Authentic</h2>
                       <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Zaya Code Hub Official Record</p>
                    </div>
                 </div>
                 <div className="hidden md:block">
                    <Award className="h-20 w-20 text-blue-500/20" />
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-2">
                   <div className="flex items-center gap-2 text-slate-500 uppercase font-black text-[10px] tracking-widest">
                      <User className="h-3 w-3" />
                      Recipient Name
                   </div>
                   <p className="text-2xl font-bold text-white leading-tight">{result.cert_full_name || result.profiles?.full_name}</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-2">
                   <div className="flex items-center gap-2 text-slate-500 uppercase font-black text-[10px] tracking-widest">
                      <BookOpen className="h-3 w-3" />
                      Internship Program
                   </div>
                   <p className="text-2xl font-bold text-white leading-tight">{result.tasks?.title}</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-2">
                   <div className="flex items-center gap-2 text-slate-500 uppercase font-black text-[10px] tracking-widest">
                      <Calendar className="h-3 w-3" />
                      Completion Date
                   </div>
                   <p className="text-2xl font-bold text-white leading-tight">{new Date(result.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="p-8 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 space-y-2">
                   <div className="flex items-center gap-2 text-blue-500 uppercase font-black text-[10px] tracking-widest">
                      <Award className="h-3 w-3" />
                      Credential ID
                   </div>
                   <p className="text-2xl font-black text-blue-400 tracking-tighter italic">{result.certificate_id}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 text-center">
                 <p className="text-slate-500 text-sm font-medium">This record was officially issued by Zaya Code Hub upon successful completion of the internship requirements.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center">
           <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest border-b border-transparent hover:border-white/20 pb-1">
              Back to Home
           </Link>
        </div>
      </div>
    </div>
  );
}
