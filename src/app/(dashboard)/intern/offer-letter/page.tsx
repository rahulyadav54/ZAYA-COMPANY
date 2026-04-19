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
  const [isDownloading, setIsDownloading] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch Profile
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          setProfile(profileData);

          // Try to fetch application details using email (case-insensitive)
          if (profileData?.email) {
            const { data: appData } = await supabase
              .from('applications')
              .select('*')
              .ilike('email', profileData.email)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (appData) {
              setApplication(appData);
            } else if (profileData.full_name) {
              // Fallback to name search if email search yields no results
              const { data: nameData } = await supabase
                .from('applications')
                .select('*')
                .ilike('full_name', `%${profileData.full_name}%`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (nameData) setApplication(nameData);
            }
          } else if (profileData?.full_name) {
             // Search by name if email is missing
             const { data: nameData } = await supabase
                .from('applications')
                .select('*')
                .ilike('full_name', `%${profileData.full_name}%`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (nameData) setApplication(nameData);
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
    if (!letterRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      // Force scroll to top to prevent capture offsets
      window.scrollTo(0, 0);
      
      // Delay to ensure browser has finished rendering
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const element = letterRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for sharp text
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY, // Critical fix for scrolled offsets
        scrollX: 0
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF in A4 format
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the page exactly
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is taller than the page, scale it down to fit perfectly
      let finalHeight = imgHeight;
      let finalWidth = imgWidth;
      let xOffset = 0;
      let yOffset = 0;

      if (imgHeight > pageHeight) {
        const ratio = pageHeight / imgHeight;
        finalHeight = pageHeight;
        finalWidth = imgWidth * ratio;
        xOffset = (pageWidth - finalWidth) / 2;
      }

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
      pdf.save(`ZAYA_Offer_Letter_${profile?.full_name?.replace(/\s+/g, '_') || 'Intern'}.pdf`);
      
      alert('Success! Your Offer Letter has been downloaded.');
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      alert(`Download Failed: ${error.message || 'Unknown Error'}. Please try refreshing the page.`);
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
              <p className="font-black text-xl mt-1" style={{ color: '#2563eb' }}>{profile?.full_name}</p>
              <div className="flex flex-col mt-1">
                <p className="font-medium uppercase text-xs tracking-widest" style={{ color: '#64748b' }}>
                  {profile?.position && profile.position !== 'Intern' ? profile.position : (application?.position || 'Processing Role...')}
                </p>
                {(profile?.intern_id || application?.intern_id) && (
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: '#94a3b8' }}>
                    ID: {profile?.intern_id || application?.intern_id}
                  </p>
                )}
              </div>
            </div>

            <p>Dear <span className="font-bold" style={{ color: '#0f172a' }}>{profile?.full_name?.split(' ')[0]}</span>,</p>
            
            <p>
              We are delighted to offer you an opportunity to join our team as an <span className="font-bold" style={{ color: '#0f172a' }}>
                {profile?.position && profile.position !== 'Intern' ? profile.position : (application?.position || 'Professional Intern')}
              </span> at <span className="font-bold" style={{ color: '#2563eb' }}>ZAYA CODE HUB</span>. 
              The term of your placement will be for a duration of <span className="font-bold" style={{ color: '#0f172a' }}>{application?.duration || '1 month'}</span>, starting from <span className="font-bold" style={{ color: '#0f172a' }}>{profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : currentDate}</span>.
            </p>

            {/* Dynamic Content based on Position */}
            {(() => {
              const pos = (profile?.position && profile.position !== 'Intern' ? profile.position : (application?.position || 'Intern')).toLowerCase();
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
                responsibilities = "creating stunning visual assets, designing brand identity materials, and collaborating on creative marketing collateral for our digital platforms.";
                team = "Creative Graphics Team";
              } else if (pos.includes('marketing')) {
                responsibilities = "managing digital campaigns, optimizing social media presence, conducting market analysis, and developing content strategies to grow our community.";
                team = "Growth & Marketing Team";
              } else if (pos.includes('full stack') || pos.includes('web')) {
                responsibilities = "building responsive web applications, integrating frontend interfaces with backend APIs, and participating in the full software development lifecycle.";
                team = "Web Engineering Team";
              }

              return (
                <>
                  <p>
                    During this internship, you will be part of our <span className="font-bold" style={{ color: '#0f172a' }}>{team}</span> and report to your assigned supervisor. 
                    Your main responsibilities will include {responsibilities}
                  </p>
                  <p>
                    In addition to your work, we have many exciting opportunities for you to participate in, such as weekly workshops, mentorship sessions, and real-world project experience that will help you develop your specialized {pos.replace('intern', '').trim() || 'technical'} skills.
                  </p>
                </>
              );
            })()}

            <p>
              Please accept this offer by confirming your acceptance through your intern portal. We look forward to having you on board and embarking on this unforgettable professional journey with you!
            </p>

            <p>If you have any questions at all, please don't hesitate to contact our HR department.</p>

            <div className="mt-16 pt-12">
              <p className="font-bold" style={{ color: '#0f172a' }}>Sincerely,</p>
              <div className="mt-8">
                <div className="h-16 w-48 mb-2 relative" style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <p className="absolute bottom-2 left-0 font-serif text-2xl italic opacity-50" style={{ color: '#94a3b8' }}>Zaya Code Hub</p>
                </div>
                <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#0f172a' }}>Human Resources Manager</p>
                <p className="text-xs font-bold uppercase tracking-tighter" style={{ color: '#64748b' }}>Zaya Code Hub</p>
              </div>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}></div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: '#cbd5e1' }}>www.zayacodehub.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
