'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import IDCard from '@/components/intern/IDCard';
import { Download, Share2, Printer, ShieldCheck, CreditCard, Loader2, Link as LinkIcon, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function InternIDCardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadID = async () => {
    if (!idCardRef.current) return;
    setIsDownloading(true);
    try {
      const element = idCardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [canvas.width / 3.78, canvas.height / 3.78] // Matches aspect ratio
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ZAYA_ID_${profile?.full_name?.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Download Error:', error);
      alert('Failed to generate ID Card PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!profile) return;
    const verifyUrl = `${window.location.origin}/verify-id?id=${profile.id}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    if (!profile) return;
    const verifyUrl = `${window.location.origin}/verify-id?id=${profile.id}`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    window.open(shareUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Identity Vault...</p>
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
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <button 
            onClick={handleDownloadID}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isDownloading ? 'Generating...' : 'Download ID Card'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: ID Card Preview */}
        <div className="py-10 flex justify-center print:p-0">
           <div ref={idCardRef} className="bg-transparent rounded-[3rem] overflow-hidden">
              {profile && <IDCard profile={profile} />}
           </div>
        </div>

        {/* Right: Info & Guidelines */}
        <div className="space-y-8 print:hidden">
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

              <div className="mt-10 p-6 bg-blue-600/5 dark:bg-blue-600/10 rounded-3xl border border-blue-600/10 flex items-center justify-between">
                 <button 
                   onClick={handleShareLinkedIn}
                   className="flex items-center gap-3 group transition-all"
                 >
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                       <Share2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-black text-blue-900 dark:text-blue-100 text-xs uppercase tracking-widest">Share on LinkedIn</span>
                 </button>
                 <button 
                   onClick={handleCopyLink}
                   className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600/10 px-4 py-2 rounded-xl transition-all"
                 >
                    {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
