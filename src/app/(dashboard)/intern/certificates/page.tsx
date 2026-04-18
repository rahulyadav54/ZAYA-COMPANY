'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Award, Download, ExternalLink, Loader2, ShieldCheck, Search, FileCheck, X } from 'lucide-react';
import Certificate from '@/components/intern/Certificate';
import Link from 'next/link';

export default function InternCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  useEffect(() => {
    async function fetchCertificates() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('submissions')
          .select('*, tasks(title, duration_months)')
          .eq('intern_id', user.id)
          .eq('review_status', 'approved');

        if (error) {
          console.error('Error fetching certificates:', error);
        } else {
          setCertificates(data || []);
        }
      }
      setIsLoading(false);
    }
    fetchCertificates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading your achievements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">My Certificates</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">View and download your official Zaya Code Hub internship certifications.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">All Certificates Verified</span>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full w-fit mx-auto">
             <Award className="h-20 w-20 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">No Certificates Yet</h2>
            <p className="text-slate-500 max-w-md mx-auto font-medium">Once your project submissions are approved by our team, your official certificates will appear here.</p>
          </div>
          <Link 
            href="/intern/submit" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20"
          >
            Submit a Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {certificates.map((cert) => (
            <div 
              key={cert.id} 
              className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all group"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Credential Issued</p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight italic uppercase">{cert.tasks?.title}</h3>
                   </div>
                   <div className="bg-blue-600/10 p-3 rounded-2xl">
                      <Award className="h-8 w-8 text-blue-600" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {(cert.created_at || cert.submitted_at) ? new Date(cert.created_at || cert.submitted_at).toLocaleDateString() : 'Pending'}
                      </p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Credential ID</p>
                      <p className="text-sm font-black text-blue-600">{cert.certificate_id || 'Generating...'}</p>
                   </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     onClick={() => setSelectedCert(cert)}
                     className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
                   >
                     <ExternalLink className="h-4 w-4" />
                     View Certificate
                   </button>
                   <Link 
                     href={`/verify?id=${cert.certificate_id}`}
                     className="px-6 py-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                   >
                     <FileCheck className="h-4 w-4" />
                     Verify
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full View Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="relative w-full max-w-7xl h-full flex flex-col items-center justify-center">
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-0 right-0 p-4 text-white hover:text-red-500 transition-colors"
              >
                <X className="h-10 w-10" />
              </button>

              <div className="scale-[0.4] md:scale-[0.6] lg:scale-[0.8] xl:scale-[1.0] transition-all transform origin-center">
                <Certificate 
                  internName={selectedCert.cert_full_name || "Intern Name"} 
                  taskTitle={selectedCert.tasks?.title || "Project Title"} 
                  completionDate={selectedCert.created_at || selectedCert.submitted_at}
                  durationMonths={selectedCert.tasks?.duration_months || 1}
                  certificateId={selectedCert.certificate_id}
                />
              </div>

              <div className="mt-10 flex flex-col items-center space-y-4">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Official Zaya Code Hub Digital Credential</p>
                 <p className="text-slate-600 text-xs">Verify this document at zayacodehub.com/verify</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
