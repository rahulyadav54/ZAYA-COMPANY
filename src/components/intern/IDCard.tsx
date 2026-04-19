import React from 'react';
import { Mail, Calendar, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface IDCardProps {
  profile: {
    full_name: string;
    email: string;
    role: string;
    id: string;
    created_at: string;
    avatar_url?: string;
    position?: string;
    intern_id?: string;
  };
}

export default function IDCard({ profile }: IDCardProps) {
  const internId = profile.intern_id || `ZAYA-ID-${profile.id.slice(0, 8).toUpperCase()}`;
  const validFrom = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const validTo = new Date(new Date(profile.created_at).setMonth(new Date(profile.created_at).getMonth() + 3)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      id="id-card-capture"
      className="relative w-[420px] h-[720px] mx-auto group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden bg-white flex flex-col"
    >
      {/* Lanyard Hole */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#e2e8f0] rounded-full z-30 flex items-center justify-center">
         <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: '#94a3b8', opacity: 0.3 }} />
      </div>

      {/* Decorative Corner Accents (Top Left) */}
      <div className="absolute top-0 left-0 w-32 h-32 z-20 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full rotate-45 -translate-x-1/2 -translate-y-1/2" style={{ background: 'linear-gradient(to bottom right, #1e3a8a, transparent)' }} />
         <div className="absolute top-2 left-2 w-full h-full border-t-4 border-l-4 rounded-tl-[3rem]" style={{ borderColor: '#eab308' }} />
      </div>

      {/* Header Section */}
      <div className="relative h-[240px] flex flex-col items-center pt-8 overflow-hidden shrink-0" style={{ backgroundColor: '#0A192F' }}>
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl" style={{ backgroundColor: '#1e3a8a', opacity: 0.1 }} />
        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }} />
        
        {/* Header Layout */}
        <div className="z-10 w-full px-10 flex items-center justify-between mt-4">
           <div className="flex flex-col items-start">
              <img src="/logo.png" alt="ZAYA Logo" className="h-16 w-auto object-contain drop-shadow-2xl" />
           </div>
           <div className="flex flex-col items-end text-right">
              <h2 className="text-white text-xl font-black tracking-tighter uppercase leading-none">ZAYA CODE HUB</h2>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] mt-1" style={{ color: '#3b82f6' }}>Innovate • Build • Excel</p>
           </div>
        </div>

        <div className="z-10 mt-6 h-px w-4/5" style={{ background: 'linear-gradient(to right, transparent, #2563eb, transparent)' }} />

        {/* Curved Bottom Clip */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </div>

      {/* Profile Image Section */}
      <div className="relative -mt-16 z-20 flex flex-col items-center">
        <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#f1f5f9]">
           <div className="w-full h-full rounded-[2rem] bg-[#f8fafc] flex items-center justify-center text-[#cbd5e1] overflow-hidden relative border-2 border-[#f1f5f9]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl font-black text-[#0A192F] opacity-20">{profile.full_name?.charAt(0) || 'U'}</span>
              )}
           </div>
        </div>
        
        <div className="mt-4 text-center space-y-1">
          <h3 className="text-2xl font-black text-[#0f172a] leading-tight uppercase tracking-tight">{profile.full_name || 'Loading...'}</h3>
          <div className="inline-flex items-center gap-2 bg-[#eff6ff] border border-[#dbeafe] px-4 py-1.5 rounded-xl">
             <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
             <p className="text-[#2563eb] font-bold text-[10px] uppercase tracking-widest">
               {profile.position && profile.position !== 'Intern' ? profile.position : 'Software Development Intern'}
             </p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="mt-6 px-12 space-y-6 flex-grow">
        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9] text-center">
          <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Intern ID Number</p>
          <p className="text-sm font-black text-[#1e293b] font-mono tracking-tighter">{internId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Valid From</p>
            <div className="flex items-center justify-center gap-2 text-xs font-black" style={{ color: '#1e293b' }}>
              <Calendar className="h-3 w-3" style={{ color: '#2563eb' }} />
              {validFrom}
            </div>
          </div>
          <div className="space-y-1 text-center border-l" style={{ borderColor: '#f1f5f9' }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Expires On</p>
            <div className="flex items-center justify-center gap-2 text-xs font-black" style={{ color: '#1e293b' }}>
              <Calendar className="h-3 w-3" style={{ color: '#f97316' }} />
              {validTo}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-auto px-12 pb-10 flex flex-col items-center">
         <div className="flex items-center gap-4 text-[#94a3b8]">
            <Mail className="h-4 w-4" />
            <Globe className="h-4 w-4" />
            <ShieldCheck className="h-4 w-4" />
         </div>
         <p className="mt-4 text-[8px] font-black text-[#cbd5e1] uppercase tracking-[0.5em]">www.zayacodehub.in</p>
      </div>

      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#60a5fa] via-[#2563eb] to-[#1e3a8a] z-40" />
    </motion.div>
  );
}
