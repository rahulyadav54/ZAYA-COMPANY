'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Download, Loader2, ArrowLeft, Building2, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function OfferLetterPage() {
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch Profile
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          setProfile(profileData);

          // Try to fetch application details using email
          if (profileData?.email) {
            const { data: appData } = await supabase
              .from('applications')
              .select('*')
              .eq('email', profileData.email)
              .eq('status', 'accepted')
              .maybeSingle();
            setApplication(appData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const downloadPDF = async () => {
    if (!letterRef.current) return;

    const element = letterRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Offer_Letter_${profile?.full_name?.replace(/\s+/g, '_') || 'Intern'}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating your offer letter...</p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/intern" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 md:p-12 shadow-2xl overflow-x-auto">
        {/* Document Preview */}
        <div 
          ref={letterRef}
          className="bg-white text-slate-900 p-8 md:p-16 min-h-[1123px] w-[800px] mx-auto shadow-inner relative"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src="/logo.png" alt="Zaya Code Hub Logo" className="h-16 object-contain" />
                <div className="h-12 w-[2px] bg-slate-200 mx-2"></div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">ZAYA CODE HUB</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mt-1">Innovate . Develop . Empower</p>
                </div>
              </div>
              <div className="space-y-1 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Salem, Tamil Nadu, India</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> hr@zayacodehub.in</div>
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> +91 70333 99183</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Date Issued</p>
              <p className="font-bold text-slate-900">{currentDate}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black uppercase tracking-widest border-b-4 border-blue-600 inline-block pb-2">Internship Offer Letter</h2>
          </div>

          {/* Content */}
          <div className="space-y-6 text-slate-700 leading-relaxed text-base">
            <div className="mb-8">
              <p className="font-bold text-slate-900">To,</p>
              <p className="font-black text-xl text-blue-600 mt-1">{profile?.full_name}</p>
              <div className="flex flex-col mt-1">
                <p className="font-medium text-slate-500 uppercase text-xs tracking-widest">
                  {profile?.position || 'Intern'}
                </p>
                {profile?.intern_id && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {profile.intern_id}</p>
                )}
              </div>
            </div>

            <p>Dear <span className="font-bold text-slate-900">{profile?.full_name?.split(' ')[0]}</span>,</p>
            
            <p>
              We are delighted to offer you an opportunity to join our team as an <span className="font-bold text-slate-900">
                {profile?.position || 'Intern'}
              </span> at <span className="font-bold text-blue-600">ZAYA CODE HUB</span>. 
              The term of your placement will be for a duration of <span className="font-bold text-slate-900">{application?.duration || '1 month'}</span>, starting from <span className="font-bold text-slate-900">{profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : currentDate}</span>.
            </p>

            <p>
              During this internship, you will be part of our <span className="font-bold text-slate-900">Development Team</span> and report to your assigned supervisor. 
              Your main responsibilities will include working on various web development projects, participating in code reviews, and collaborating with our team to build innovative solutions.
            </p>

            <p>
              In addition to your work, we have many exciting opportunities for you to participate in, such as weekly tech workshops, mentorship sessions, and real-world project experience that will help you develop your technical skills and industry knowledge.
            </p>

            <p>
              Please accept this offer by confirming your acceptance through your intern portal. We look forward to having you on board and embarking on this unforgettable professional journey with you!
            </p>

            <p>If you have any questions at all, please don't hesitate to contact our HR department.</p>

            <div className="mt-16 pt-12">
              <p className="font-bold text-slate-900">Sincerely,</p>
              <div className="mt-8">
                <div className="h-16 w-48 border-b border-slate-300 mb-2 relative">
                   {/* Placeholder for Signature */}
                   <p className="absolute bottom-2 left-0 font-serif text-2xl italic text-slate-400 opacity-50">Zaya Code Hub</p>
                </div>
                <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Human Resources Manager</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Zaya Code Hub</p>
              </div>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">www.zayacodehub.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
