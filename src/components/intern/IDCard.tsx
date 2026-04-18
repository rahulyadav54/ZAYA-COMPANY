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
  };
}

export default function IDCard({ profile }: IDCardProps) {
  const internId = `ZAYA-ID-${profile.id.slice(0, 8).toUpperCase()}`;
  const validFrom = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const validTo = new Date(new Date(profile.created_at).setMonth(new Date(profile.created_at).getMonth() + 6)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-[420px] h-[680px] mx-auto group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden bg-white"
    >
      {/* Lanyard Hole */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-full z-30 flex items-center justify-center">
         <div className="w-10 h-1.5 bg-slate-400/30 rounded-full" />
      </div>

      {/* Decorative Corner Accents (Top Left) */}
      <div className="absolute top-0 left-0 w-32 h-32 z-20 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 to-transparent rotate-45 -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute top-2 left-2 w-full h-full border-t-4 border-l-4 border-yellow-500/30 rounded-tl-[3rem]" />
      </div>

      {/* Header Section */}
      <div className="relative h-[280px] bg-[#0A192F] flex flex-col items-center pt-12 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Logo */}
        <div className="z-10 flex flex-col items-center">
           <img src="/logo.png" alt="ZAYA Logo" className="h-28 w-auto object-contain mb-2" />
           <h2 className="text-white text-2xl font-black tracking-tight uppercase">ZAYA CODE HUB</h2>
           <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Innovate • Build • Excel</p>
        </div>

        {/* Curved Bottom Clip */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </div>

      {/* Profile Image Section */}
      <div className="relative -mt-20 z-20 flex flex-col items-center">
        <div className="w-44 h-44 rounded-[2.5rem] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
           <div className="w-full h-full rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden relative border-2 border-slate-100">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl font-black text-[#0A192F] opacity-20">{profile.full_name?.charAt(0) || 'U'}</span>
              )}
           </div>
        </div>
        
        <div className="mt-8 text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight px-4">{profile.full_name || 'Loading...'}</h3>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 px-5 py-2 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                {profile.position || 'Software Development Intern'}
              </p>
            </div>
          </div>
      </div>

      {/* Separator with Dot */}
      <div className="mt-6 flex items-center justify-center gap-4 px-20">
         <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
         <div className="w-2 h-2 rounded-full bg-blue-600" />
         <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
      </div>

      {/* Details Section */}
      <div className="mt-8 px-12 space-y-6">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Intern ID Number</p>
          <p className="text-sm font-black text-slate-800 font-mono tracking-tighter">{internId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid From</p>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800">
              <Calendar className="h-3 w-3 text-blue-500" />
              {validFrom}
            </div>
          </div>
          <div className="space-y-1 text-center border-l border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires On</p>
            <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-800">
              <Calendar className="h-3 w-3 text-orange-500" />
              {validTo}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-center space-y-3">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Mail className="h-4 w-4 text-slate-300" />
              {profile.email}
           </div>
        </div>
      </div>

      {/* Decorative Bottom Accents */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
         {/* Gold/Blue corner patterns */}
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#0A192F] to-transparent rotate-12 -translate-x-8 translate-y-8" />
         <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#0A192F] to-transparent -rotate-12 translate-x-8 translate-y-8" />
         
         <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Building the Future Together</p>
         </div>
      </div>

      {/* Verification Link Overlay (Invisible but functional) */}
      <a 
        href="/verify-id" 
        target="_blank" 
        className="absolute bottom-10 right-10 w-12 h-12 bg-white/10 opacity-0 hover:opacity-100 flex items-center justify-center rounded-xl transition-all"
        title="Verify ID"
      >
         <ShieldCheck className="h-6 w-6 text-green-500" />
      </a>
    </motion.div>
  );
}
