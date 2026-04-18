'use client';

import React from 'react';
import { ShieldCheck, MapPin, Globe, Mail, Phone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface IDCardProps {
  profile: {
    full_name: string;
    email: string;
    role: string;
    id: string;
    created_at: string;
  };
}

export default function IDCard({ profile }: IDCardProps) {
  const internId = `ZAYA-ID-${profile.id.slice(0, 8).toUpperCase()}`;
  const validFrom = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const validTo = new Date(new Date(profile.created_at).setMonth(new Date(profile.created_at).getMonth() + 6)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-[380px] h-[580px] mx-auto group perspective-1000"
    >
      {/* Front of ID Card */}
      <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-500 group-hover:shadow-blue-500/10">
        
        {/* Header Branding */}
        <div className="bg-blue-600 h-32 relative flex items-center justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />
          
          <div className="z-10 text-center">
            <h2 className="text-white text-2xl font-black tracking-tighter italic">ZAYA CODE HUB</h2>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Official Intern Identity</p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-8 -mt-12 z-20 flex flex-col items-center">
          <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-xl">
             <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden relative group-hover:scale-[1.02] transition-transform">
                <span className="text-4xl font-black text-blue-600">{profile.full_name?.charAt(0) || 'U'}</span>
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          </div>
          
          <div className="mt-6 text-center space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{profile.full_name || 'Loading...'}</h3>
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full inline-block">
              Software Intern
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-8 px-10 space-y-5 flex-1">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intern ID Number</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{internId}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid From</p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="h-3 w-3 text-blue-500" />
                {validFrom}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires On</p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="h-3 w-3 text-red-500" />
                {validTo}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
             <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {profile.email}
             </div>
             <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                zayacodehub.com
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Intern</span>
          </div>
          <div className="w-12 h-12 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
             {/* Simple visual placeholder for QR */}
             <div className="w-full h-full bg-slate-900 dark:bg-slate-100 rounded-[2px]" />
          </div>
        </div>

        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400" />
      </div>
      
      {/* Decorative Shadows */}
      <div className="absolute -inset-4 bg-blue-500/5 blur-3xl -z-10 group-hover:bg-blue-500/10 transition-all duration-500" />
    </motion.div>
  );
}
