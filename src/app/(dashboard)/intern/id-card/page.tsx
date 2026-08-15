'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import IDCard from '@/components/intern/IDCard';
import { Download, Share2, ShieldCheck, CreditCard, Loader2, Link as LinkIcon, Check, Upload, FileImage } from 'lucide-react';

export default function InternIDCardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { getActiveUser } = await import('@/lib/getActiveUser');
        const user = await getActiveUser();
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

          const { resolveInternName, resolveInternPosition } = await import('@/lib/resolveInternDetails');

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

          const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem(`avatar_${user.id}`) : null;

          const resolvedProfile = {
            id: user.id,
            full_name: resolveInternName(p, appData, user),
            email: p?.email || appData?.email || user.email,
            position: resolveInternPosition(p, appData, user),
            intern_id: p?.intern_id || appData?.intern_id || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            created_at: p?.created_at || appData?.created_at || new Date().toISOString(),
            joining_date: p?.joining_date || appData?.created_at || new Date().toISOString().split('T')[0],
            avatar_url: cachedAvatar || p?.avatar_url || null
          };

          setProfile(resolvedProfile);
        }
      } catch (err) {
        console.error('ID Card Profile Load Notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      if (imageUrl && profile) {
        const updatedProfile = { ...profile, avatar_url: imageUrl };
        setProfile(updatedProfile);

        try {
          if (profile.id) {
            localStorage.setItem(`avatar_${profile.id}`, imageUrl);
            await supabase.from('profiles').update({ avatar_url: imageUrl }).eq('id', profile.id);
          }
        } catch (err) {
          console.warn('Avatar save notice:', err);
        }

        alert('Photo uploaded successfully! Your ID Card has been updated.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPNG = async () => {
    if (!idCardRef.current || !profile) return;
    setIsDownloading(true);
    
    try {
      const { downloadAsPNG } = await import('@/lib/downloadHelper');
      const name = (profile.full_name || 'Intern').replace(/\s+/g, '_');
      const filename = `ZAYA_ID_${name}.png`;

      const target = document.getElementById('id-card-capture') || idCardRef.current;
      const success = await downloadAsPNG({
        element: target as HTMLElement,
        filename: filename,
        scale: 3
      });

      if (success) {
        alert('Success! Your Virtual ID Card image has been downloaded.');
      } else {
        alert('Could not generate ID card image. Please try again.');
      }
    } catch (error: any) {
      console.error('Download Error:', error);
      alert('Download Error: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!idCardRef.current || !profile) return;
    setIsDownloading(true);
    
    try {
      const { downloadAsPDF, downloadAsPNG } = await import('@/lib/downloadHelper');
      const name = (profile.full_name || 'Intern').replace(/\s+/g, '_');
      const filename = `ZAYA_ID_${name}`;

      const target = document.getElementById('id-card-capture') || idCardRef.current;
      let success = await downloadAsPDF({
        element: target as HTMLElement,
        filename: `${filename}.pdf`,
        pdfOrientation: 'portrait',
        scale: 3
      });

      if (!success) {
        success = await downloadAsPNG({
          element: target as HTMLElement,
          filename: `${filename}.png`,
          scale: 3
        });
      }

      if (success) {
        alert('Success! Your Virtual ID Card has been downloaded.');
      } else {
        alert('Download Error: Could not generate document. Please try again.');
      }
    } catch (error: any) {
      console.error('Download Error:', error);
      alert('Download Error: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDownloading(false);
    }
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
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Digital Identity Vault...</p>
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
           <p className="text-slate-500 mt-2 text-lg">Your official ZAYA CODE HUB intern identity card.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg text-sm"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            {profile?.avatar_url ? 'Change Photo' : 'Upload Photo'}
          </button>

          <button 
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg disabled:opacity-50 text-sm"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4 text-emerald-400" />}
            Download Image (PNG)
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50 text-sm"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: ID Card Preview */}
        <div className="py-10 flex flex-col items-center justify-center print:p-0">
           <div ref={idCardRef} className="bg-transparent rounded-[2.5rem] overflow-hidden p-2">
              {profile && <IDCard profile={profile} />}
           </div>
           <p className="text-xs font-bold text-slate-400 mt-4 tracking-wide">
             💡 Click &quot;Download Image (PNG)&quot; or &quot;Download PDF&quot; to save your physical ID card!
           </p>
        </div>

        {/* Right: Info & Guidelines */}
        <div className="space-y-8 print:hidden">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-6 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-500" />
                Security & Verification Guidelines
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">1</div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">Official Verification</p>
                      <p className="text-sm text-slate-500 font-medium">This ID card serves as your official proof of selection at Zaya Code Hub for <strong className="text-blue-600 dark:text-blue-400">{profile?.position}</strong>.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">2</div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">Photo Personalization</p>
                      <p className="text-sm text-slate-500 font-medium">Click &quot;Upload Photo&quot; above to upload your passport-style headshot. If no photo is uploaded, your card displays your default 3D emblem avatar.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">3</div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">Professional Access</p>
                      <p className="text-sm text-slate-500 font-medium">Use this ID card for internal project submissions, team meetings, and sharing your accomplishment on LinkedIn.</p>
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
