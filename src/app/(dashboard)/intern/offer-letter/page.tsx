'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Download, Loader2, ArrowLeft, Building2, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { resolveInternName, resolveInternPosition } from '@/lib/resolveInternDetails';

export default function OfferLetterPage() {
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { getActiveUser } = await import('@/lib/getActiveUser');
        const user = await getActiveUser();
        setActiveUser(user);

        if (user) {
          let p: any = null;
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          p = profileData;

          if (!p && user.email) {
            const { data: pEmail } = await supabase.from('profiles').select('*').eq('email', user.email).maybeSingle();
            p = pEmail;
          }

          let appData: any = null;
          const targetEmail = p?.email || user.email;
          if (targetEmail) {
            const { data: appRes } = await supabase
              .from('applications')
              .select('*')
              .ilike('email', targetEmail)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            appData = appRes;
          }

          const currentName = resolveInternName(p, appData, user);
          if (!appData && currentName) {
            const firstName = currentName.split(' ')[0];
            const { data: nameRes } = await supabase
              .from('applications')
              .select('*')
              .ilike('full_name', `%${firstName}%`)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (nameRes) appData = nameRes;
          }

          setProfile(p);
          setApplication(appData);
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
    if (!letterRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const { downloadAsPDF, downloadAsPNG } = await import('@/lib/downloadHelper');
      const name = resolveInternName(profile, application, activeUser).replace(/\s+/g, '_');
      const filename = `ZAYA_Offer_Letter_${name}`;
      
      let success = await downloadAsPDF({
        element: letterRef.current,
        filename: `${filename}.pdf`,
        pdfOrientation: 'portrait'
      });

      if (!success) {
        success = await downloadAsPNG({
          element: letterRef.current,
          filename: `${filename}.png`
        });
      }

      if (success) {
        alert('Success! Your Offer Letter has been downloaded.');
      } else {
        window.print();
      }
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
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

  const internName = resolveInternName(profile, application, activeUser);
  const internPosition = resolveInternPosition(profile, application, activeUser);
  const internId = profile?.intern_id || application?.intern_id || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/intern" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <button 
          onClick={downloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 md:p-12 shadow-2xl overflow-x-auto">
        {/* Document Preview */}
        <div 
          ref={letterRef}
          className="bg-white p-8 md:p-16 min-h-[1123px] w-[800px] mx-auto relative"
          style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', color: '#0f172a' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src="/logo.png" alt="Zaya Code Hub Logo" className="h-16 object-contain" />
                <div className="h-12 w-[2px] mx-2" style={{ backgroundColor: '#e2e8f0' }}></div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter leading-none" style={{ color: '#0f172a' }}>ZAYA CODE HUB</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: '#2563eb' }}>Innovate . Develop . Empower</p>
                </div>
              </div>
              <div className="space-y-1 text-sm font-medium" style={{ color: '#64748b' }}>
                <div className="flex items-center gap-2"><MapPin className="h-3 w-3" style={{ color: '#2563eb' }} /> Salem, Tamil Nadu, India</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" style={{ color: '#2563eb' }} /> hr@zayacodehub.in</div>
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" style={{ color: '#2563eb' }} /> +91 70333 99183</div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold uppercase tracking-widest text-[10px] mb-1" style={{ color: '#94a3b8' }}>Date Issued</p>
              <p className="font-bold" style={{ color: '#0f172a' }}>{currentDate}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black uppercase tracking-widest inline-block pb-2" style={{ borderBottom: '4px solid #2563eb', color: '#0f172a' }}>Internship Offer Letter</h2>
          </div>

          {/* Content */}
          <div className="space-y-6 leading-relaxed text-base" style={{ color: '#334155' }}>
            <div className="mb-8">
              <p className="font-bold" style={{ color: '#0f172a' }}>To,</p>
              <p className="font-black text-2xl mt-1" style={{ color: '#2563eb' }}>{internName}</p>
              <div className="flex flex-col mt-1">
                <p className="font-bold uppercase text-xs tracking-widest" style={{ color: '#64748b' }}>
                  {internPosition}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: '#94a3b8' }}>
                  ID: {internId}
                </p>
              </div>
            </div>

            <p>Dear <span className="font-bold" style={{ color: '#0f172a' }}>{internName.split(' ')[0]}</span>,</p>
            
            <p>
              We are delighted to offer you an opportunity to join our team as an <span className="font-bold" style={{ color: '#0f172a' }}>
                {internPosition}
              </span> at <span className="font-bold" style={{ color: '#2563eb' }}>ZAYA CODE HUB</span>. 
              The term of your placement will be for a duration of <span className="font-bold" style={{ color: '#0f172a' }}>{application?.duration || '1 month'}</span>, starting from <span className="font-bold" style={{ color: '#0f172a' }}>{profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : currentDate}</span>.
            </p>

            {/* Dynamic Content based on Position */}
            {(() => {
              const pos = internPosition.toLowerCase();
              let responsibilities = "working on various development projects, participating in code reviews, and collaborating with our team to build innovative solutions.";
              let team = "Development Team";

              if (pos.includes('android')) {
                responsibilities = "developing mobile applications using modern frameworks, designing intuitive mobile interfaces, and implementing features for our Android user base.";
                team = "Mobile App Team";
              } else if (pos.includes('ui') || pos.includes('ux') || pos.includes('design')) {
                responsibilities = "creating high-fidelity wireframes, designing user-centric interfaces, conducting design research, and ensuring visual excellence across our digital products.";
                team = "Design & Creative Team";
              } else if (pos.includes('python')) {
                responsibilities = "building robust backend systems, developing automation scripts, working with data analysis tools, and participating in system architecture discussions.";
                team = "Backend Engineering Team";
              } else if (pos.includes('graphic')) {
                responsibilities = "producing engaging visual graphics, social media banners, brand collateral, and collaborating with marketing and product teams.";
                team = "Visual Design Team";
              }

              return (
                <div className="space-y-4">
                  <p>
                    During this internship, you will be assigned to our <span className="font-bold" style={{ color: '#0f172a' }}>{team}</span>. Your primary responsibilities will include {responsibilities}
                  </p>
                  <p>
                    This is a remote position that requires dedication, continuous learning, and adherence to our code of conduct. You will work under the guidance of assigned technical mentors who will assist you in acquiring practical skills.
                  </p>
                </div>
              );
            })()}

            <p>
              Upon successful completion of all assigned tasks and project reviews, you will be awarded an official <span className="font-bold" style={{ color: '#0f172a' }}>Certificate of Completion</span> and a <span className="font-bold" style={{ color: '#0f172a' }}>Letter of Recommendation</span> based on your overall performance.
            </p>

            <p>
              We look forward to a successful association and wish you the very best for your internship journey with us.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-16 pt-8 flex justify-between items-end" style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="text-left">
              <div className="h-12 flex items-center">
                <span className="font-black text-lg italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif", color: '#1e3a8a' }}>Rahul Yadav</span>
              </div>
              <p className="font-bold text-sm" style={{ color: '#0f172a' }}>Rahul Yadav</p>
              <p className="text-xs font-medium" style={{ color: '#64748b' }}>Founder & CEO, ZAYA CODE HUB</p>
            </div>

            <div className="text-right">
              <div className="inline-block p-3 rounded-xl border text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#2563eb' }}>Official Offer Document</p>
                <p className="text-[8px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>VERIFIED BY ZAYA CODE HUB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
