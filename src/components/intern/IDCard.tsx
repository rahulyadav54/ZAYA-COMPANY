import React from 'react';
import { ShieldCheck, Globe, Mail, Calendar, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface IDCardProps {
  profile: {
    full_name: string;
    email: string;
    role: string;
    id: string;
    created_at: string;
    avatar_url?: string;
  };
}

export default function IDCard({ profile }: IDCardProps) {
  const internId = `ZAYA-ID-${profile.id.slice(0, 8).toUpperCase()}`;
  const validFrom = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const validTo = new Date(new Date(profile.created_at).setMonth(new Date(profile.created_at).getMonth() + 6)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-[400px] h-[620px] mx-auto group"
    >
      {/* Front of ID Card */}
      <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-500">
        
        {/* Header Branding */}
        <div className="bg-blue-600 h-48 relative flex flex-col items-center pt-10 overflow-hidden shrink-0">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />
          
          <div className="z-10 flex flex-col items-center space-y-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-xl shadow-lg shadow-blue-900/20">
                  <Code2 className="h-6 w-6 text-blue-600" />
               </div>
               <h2 className="text-white text-2xl font-black tracking-tighter italic">ZAYA CODE HUB</h2>
            </div>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.4em] opacity-90">Official Internship Identity</p>
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="px-8 -mt-20 z-20 flex flex-col items-center">
          <div className="w-40 h-40 rounded-[2.5rem] bg-white dark:bg-slate-800 p-2 shadow-2xl">
             <div className="w-full h-full rounded-[2rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden relative border-2 border-slate-100 dark:border-slate-800">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black text-blue-600">{profile.full_name?.charAt(0) || 'U'}</span>
                )}
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>
          
          <div className="mt-8 text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight px-4">{profile.full_name || 'Loading...'}</h3>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 px-5 py-2 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                Software Development Intern
              </p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-10 px-10 space-y-6 flex-1">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Intern ID Number</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono tracking-tighter">{internId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 pl-2">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Valid From</p>
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                <Calendar className="h-3 w-3 text-blue-500" />
                {validFrom}
              </div>
            </div>
            <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Expires On</p>
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                <Calendar className="h-3 w-3 text-orange-500" />
                {validTo}
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
             <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                {profile.email}
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Globe className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                zayacodehub.in
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 p-1 rounded-full">
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Verified Identity</span>
          </div>
          <div className="w-14 h-14 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="w-full h-full bg-slate-900 dark:bg-slate-100 rounded-md opacity-20" />
          </div>
        </div>

        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800" />
      </div>
    </motion.div>
  );
}
