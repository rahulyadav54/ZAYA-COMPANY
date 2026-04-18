'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Certificate from '@/components/intern/Certificate';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CertificatePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmission() {
      const { data: submission, error } = await supabase
        .from('submissions')
        .select(`
          *,
          tasks:task_id(title),
          profiles:intern_id(full_name)
        `)
        .eq('id', id)
        .single();

      if (error || !submission) {
        console.error('Error fetching submission:', error);
      } else if (submission.review_status !== 'approved') {
        // Option: Redirect if not approved yet
        // For now just show a message
        setData(submission);
      } else {
        setData(submission);
      }
      setIsLoading(false);
    }

    fetchSubmission();
  }, [id]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-slate-500 font-medium">Generating your certificate preview...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <h2 className="text-2xl font-bold">Submission Not Found</h2>
      <Link href="/intern" className="text-blue-500 hover:underline">Return to Dashboard</Link>
    </div>
  );

  if (data.review_status !== 'approved') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-lg mx-auto p-10 bg-slate-900/50 rounded-[3rem] border border-white/10">
      <div className="p-6 bg-orange-500/10 rounded-full">
        <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
      </div>
      <h2 className="text-3xl font-black text-white">Review in Progress</h2>
      <p className="text-slate-400 text-lg">Your project has been submitted and paid for, but our team is still reviewing it. Your certificate will be available here automatically once approved!</p>
      <Link href="/intern" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between no-print">
        <Link 
          href="/intern" 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white">Official Certificate</h1>
          <p className="text-slate-500 text-sm font-medium">Verified Completion of {data.tasks?.title}</p>
        </div>
      </div>

      <div className="flex justify-center bg-slate-950/50 p-10 rounded-[4rem] border border-white/5 overflow-x-auto shadow-inner no-print">
         <Certificate 
            internName={data.cert_full_name || data.profiles?.full_name} 
            taskTitle={data.tasks?.title} 
            completionDate={data.created_at} 
         />
      </div>

      {/* Mobile Warning */}
      <div className="md:hidden p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-center no-print">
         <p className="text-sm text-blue-200">For the best quality, we recommend downloading your certificate on a desktop browser.</p>
      </div>
    </div>
  );
}
