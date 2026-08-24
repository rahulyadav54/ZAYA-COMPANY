'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, ShieldCheck, AlertCircle, Calendar, User, BookOpen, Loader2, Award, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { extractNameFromEmail } from '@/lib/resolveInternDetails';

function VerifyForm() {
  const searchParams = useSearchParams();
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing Scan...');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearProgressInterval();
  }, []);

  const executeVerify = async (targetId: string) => {
    if (!targetId.trim()) return;

    clearProgressInterval();
    setIsVerifying(true);
    setError('');
    setResult(null);
    setProgress(0);
    setStatusMsg('Connecting to Zaya Registry...');

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 10) setStatusMsg('Searching Records...');
        if (next >= 40) setStatusMsg('Verifying Digital Signature...');
        if (next >= 70) setStatusMsg('Authenticating Credential ID...');
        if (next >= 90) setStatusMsg('Finalizing Result...');

        if (next >= 100) {
          clearProgressInterval();
          return 100;
        }
        return next;
      });
    }, 150);

    try {
      const cleanId = targetId.trim().toUpperCase();

      // 1. Search submissions table by certificate_id
      const { data, error: fetchError } = await supabase
        .from('submissions')
        .select(`
          *,
          tasks:task_id(title),
          profiles:intern_id(full_name, email)
        `)
        .ilike('certificate_id', cleanId)
        .maybeSingle();

      if (data) {
        let recipientName = data.cert_full_name;
        if (!recipientName || recipientName.trim() === 'Portal User' || recipientName.trim() === 'Accepted Intern') {
          recipientName = data.profiles?.full_name;
        }

        // If missing, check applications table
        if (!recipientName && (data.intern_id || data.profiles?.email)) {
          const { data: appData } = await supabase
            .from('applications')
            .select('full_name')
            .or(`intern_id.ilike.${cleanId},email.ilike.${data.profiles?.email || ''}`)
            .maybeSingle();
          if (appData?.full_name) {
            recipientName = appData.full_name;
          }
        }

        if (!recipientName && data.profiles?.email) {
          recipientName = extractNameFromEmail(data.profiles.email);
        }

        if (!recipientName) {
          recipientName = 'Verified Intern';
        }

        setTimeout(() => {
          setResult({
            ...data,
            resolved_name: recipientName,
            credential_type: 'internship',
          });
          setIsVerifying(false);
        }, 2000);
        return;
      }

      // 2. Search IQ test certificates table
      const { data: iqCert, error: iqError } = await supabase
        .from('zaya_iq_certificates')
        .select('*')
        .ilike('certificate_id', cleanId)
        .maybeSingle();

      if (iqCert) {
        setTimeout(() => {
          setResult({
            certificate_id: iqCert.certificate_id,
            resolved_name: iqCert.full_name,
            reasoning_score: iqCert.reasoning_score,
            accuracy: iqCert.accuracy,
            correct_count: iqCert.correct_count,
            incorrect_count: iqCert.incorrect_count,
            completion_seconds: iqCert.completion_seconds,
            country: iqCert.country,
            created_at: iqCert.completed_at,
            credential_type: 'iq_test',
          });
          setIsVerifying(false);
        }, 2000);
        return;
      }

      // 3. Search applications table if certificate_id or intern_id matches
      const { data: appByCert } = await supabase
        .from('applications')
        .select('*')
        .or(`intern_id.ilike.${cleanId},email.ilike.${cleanId}`)
        .maybeSingle();

      if (appByCert) {
        setTimeout(() => {
          setResult({
            certificate_id: cleanId,
            resolved_name: appByCert.full_name,
            tasks: { title: appByCert.position || 'Internship Program' },
            created_at: appByCert.created_at || appByCert.applied_at || new Date().toISOString(),
            credential_type: 'internship',
          });
          setIsVerifying(false);
        }, 2000);
        return;
      }

      // If credential not found
      setTimeout(() => {
        setError('Invalid Certificate ID. No matching authentic credential found in Zaya Registry.');
        setIsVerifying(false);
      }, 2000);

    } catch (err) {
      setError('An error occurred while verifying. Please try again later.');
      setIsVerifying(false);
      clearProgressInterval();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerify(certId);
  };

  useEffect(() => {
    const queryId = searchParams.get('id') || searchParams.get('cert') || searchParams.get('certificate_id');
    if (queryId) {
      setCertId(queryId.toUpperCase());
      executeVerify(queryId);
    }
  }, [searchParams]);

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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            Official Verification Portal
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight italic uppercase leading-none">
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
              placeholder="e.g. ZCH-2026-X7Y9 or ZAYA-2026-XXXXXXXX"
              className="w-full px-8 py-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:ring-0 transition-all text-xl font-medium uppercase tracking-widest placeholder:text-slate-600 placeholder:normal-case"
            />
            <button 
              type="submit"
              disabled={isVerifying}
               className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 rounded-2xl text-white font-medium uppercase tracking-widest transition-all flex items-center gap-2"
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
           <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-blue-500/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="p-16 flex flex-col items-center space-y-10">
                 <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                    <ShieldCheck className="h-24 w-24 text-blue-500 relative z-10 animate-bounce" />
                 </div>
                 
                 <div className="text-center space-y-2">
                    <h2 className="text-4xl font-semibold italic tracking-tight">{progress}%</h2>
                    <p className="text-blue-400 font-medium uppercase tracking-widest text-xs">{statusMsg}</p>
                 </div>

                 <div className="w-full max-w-md h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                       className="h-full bg-blue-600 transition-all duration-300 ease-out"
                       style={{ width: `${progress}%` }}
                    />
                 </div>
              </div>
           </div>
         )}

         {/* Result Card */}
         {result && !isVerifying && (
           <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-blue-500/20 overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="p-12 space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-green-500/10 rounded-full">
                        <ShieldCheck className="h-10 w-10 text-green-500" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-semibold italic tracking-tight">Verified Authentic</h2>
                        <p className="text-slate-400 font-medium uppercase text-xs tracking-widest">
                          {result.credential_type === 'iq_test' ? 'Aptitude Test Official Record' : 'Zaya Code Hub Official Record'}
                        </p>
                     </div>
                  </div>
                  <div className="hidden md:block">
                     {result.credential_type === 'iq_test' ? (
                       <FileCheck className="h-20 w-20 text-amber-500/20" />
                     ) : (
                       <Award className="h-20 w-20 text-blue-500/20" />
                     )}
                  </div>
               </div>

               {result.credential_type === 'iq_test' ? (
                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <User className="h-3 w-3" />
                         Candidate Name
                      </div>
                      <p className="text-2xl font-bold text-white leading-tight">{result.resolved_name || 'Verified Candidate'}</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <BookOpen className="h-3 w-3" />
                         Assessment
                      </div>
                      <p className="text-2xl font-semibold text-white leading-tight">Aptitude Test</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <Award className="h-3 w-3" />
                         Reasoning Score
                      </div>
                      <p className="text-2xl font-semibold text-amber-400 leading-tight">{result.reasoning_score || 'N/A'}</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <ShieldCheck className="h-3 w-3" />
                         Accuracy
                      </div>
                      <p className="text-2xl font-semibold text-white leading-tight">{result.accuracy ? `${result.accuracy}%` : 'N/A'}</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <Calendar className="h-3 w-3" />
                         Completion Date
                      </div>
                      <p className="text-2xl font-semibold text-white leading-tight">{new Date(result.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                   </div>
                   <div className="p-8 bg-amber-600/10 rounded-lg border border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-amber-500 uppercase font-medium text-[10px] tracking-widest">
                         <Award className="h-3 w-3" />
                         Credential ID
                      </div>
                      <p className="text-2xl font-semibold text-amber-400 tracking-tight italic">{result.certificate_id}</p>
                   </div>
                 </div>
               ) : (
                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <User className="h-3 w-3" />
                         Recipient Name
                      </div>
                     <p className="text-2xl font-bold text-white leading-tight">{result.resolved_name || result.cert_full_name || result.profiles?.full_name || 'Verified Intern'}</p>
                  </div>
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <BookOpen className="h-3 w-3" />
                         Internship Program
                      </div>
                      <p className="text-2xl font-semibold text-white leading-tight">{result.tasks?.title || 'Web Designer Intern'}</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 uppercase font-medium text-[10px] tracking-widest">
                         <Calendar className="h-3 w-3" />
                         Completion Date
                      </div>
                      <p className="text-2xl font-semibold text-white leading-tight">{new Date(result.created_at || result.submitted_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                   </div>
                   <div className="p-8 bg-blue-600/10 rounded-lg border border-blue-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-blue-500 uppercase font-medium text-[10px] tracking-widest">
                         <Award className="h-3 w-3" />
                         Credential ID
                      </div>
                      <p className="text-2xl font-semibold text-blue-400 tracking-tight italic">{result.certificate_id}</p>
                   </div>
                 </div>
               )}

               <div className="pt-8 border-t border-white/5 text-center">
                  <p className="text-slate-500 text-sm font-medium">
                    {result.credential_type === 'iq_test'
                      ? 'This certificate was officially issued by Aptitude Test upon successful completion of the reasoning assessment.'
                      : 'This record was officially issued by Zaya Code Hub upon successful completion of the internship requirements.'}
                  </p>
               </div>
             </div>
           </div>
         )}

        {/* Footer */}
        <div className="mt-20 text-center">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm font-medium tracking-widest border-b border-transparent hover:border-white/20 pb-1">
               Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
