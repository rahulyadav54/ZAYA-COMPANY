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
      className="relative w-[420px] h-[720px] mx-auto group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden bg-white flex flex-col"
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
      <div className="relative h-[240px] bg-[#0A192F] flex flex-col items-center pt-8 overflow-hidden shrink-0">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
        
        {/* Header Layout */}
        <div className="z-10 w-full px-10 flex items-center justify-between">
           <div className="flex flex-col items-start">
              <img src="/logo.png" alt="ZAYA Logo" className="h-16 w-auto object-contain drop-shadow-2xl" />
           </div>
           <div className="flex flex-col items-end text-right">
              <h2 className="text-white text-xl font-black tracking-tighter uppercase leading-none">ZAYA CODE HUB</h2>
              <p className="text-blue-400 text-[8px] font-bold uppercase tracking-[0.3em] mt-1">Innovate • Build • Excel</p>
           </div>
        </div>

        <div className="z-10 mt-6 h-px w-4/5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* Curved Bottom Clip */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </div>

      {/* Profile Image Section */}
      <div className="relative -mt-16 z-20 flex flex-col items-center shrink-0">
        <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
           <div className="w-full h-full rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden relative border-2 border-slate-100">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl font-black text-[#0A192F] opacity-20">{profile.full_name?.charAt(0) || 'U'}</span>
              )}
           </div>
        </div>
        
        <div className="mt-4 text-center space-y-1">
          <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{profile.full_name || 'Loading...'}</h3>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-xl">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">
               {profile.position || 'Software Development Intern'}
             </p>
          </div>
        </div>
      </div>

      {/* Separator with Dot */}
      <div className="mt-6 flex items-center justify-center gap-4 px-20 shrink-0">
         <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" />
         <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
         <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" />
      </div>

      {/* Details Section */}
      <div className="mt-6 px-12 space-y-6 flex-grow">
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

        <div className="pt-2 flex flex-col items-center">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Mail className="h-3 w-3 text-slate-300" />
              {profile.email}
           </div>
        </div>
      </div>

      {/* Decorative Bottom Accents */}
      <div className="relative mt-auto h-20 pointer-events-none overflow-hidden shrink-0">
         {/* Gold/Blue corner patterns */}
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#0A192F] to-transparent rotate-12 -translate-x-12 translate-y-12" />
         <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#0A192F] to-transparent -rotate-12 translate-x-12 translate-y-12" />
         
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Building the Future Together</p>
         </div>
      </div>

      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 z-40" />

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
