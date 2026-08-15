'use client';

import React from 'react';
import { Calendar, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface IDCardProps {
  profile: {
    full_name: string;
    email: string;
    role?: string;
    id?: string;
    created_at?: string;
    avatar_url?: string;
    position?: string;
    intern_id?: string;
    joining_date?: string;
  };
}

export default function IDCard({ profile }: IDCardProps) {
  const name = profile?.full_name || 'Accepted Intern';
  const position = (profile?.position && profile.position !== 'Intern') 
    ? profile.position 
    : 'Web Designer Intern';
  const internId = profile?.intern_id || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const createdDate = profile?.created_at || profile?.joining_date || new Date().toISOString();
  const validFrom = new Date(createdDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const validTo = new Date(new Date(createdDate).setMonth(new Date(createdDate).getMonth() + 3)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Initials for Default Avatar
  const nameParts = name.trim().split(' ').filter(Boolean);
  const initials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
    : name.slice(0, 2).toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      id="id-card-capture"
      className="relative w-[380px] h-[660px] mx-auto shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden bg-white flex flex-col border border-slate-200 select-none"
    >
      {/* Lanyard Hole */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-slate-200 rounded-full z-30 flex items-center justify-center">
         <div className="w-8 h-1 rounded-full bg-slate-400 opacity-40" />
      </div>

      {/* Header Section */}
      <div className="relative h-[220px] flex flex-col items-center pt-8 overflow-hidden shrink-0 bg-gradient-to-br from-[#001f3f] via-[#002855] to-[#2563eb]">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 bg-blue-500/20 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)]" />
        
        {/* Header Layout */}
        <div className="z-10 w-full px-8 flex items-center justify-between mt-3">
           <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center font-black text-cyan-400 font-mono text-sm shadow-md">
                &lt;/&gt;
              </div>
           </div>
           <div className="text-right">
              <h2 className="text-white text-lg font-black tracking-tighter uppercase leading-none">ZAYA CODE HUB</h2>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.25em] mt-1 text-cyan-300">Official Intern ID</p>
           </div>
        </div>

        <div className="z-10 mt-5 h-[1.5px] w-3/4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      </div>

      {/* Profile Photo / Avatar Section */}
      <div className="relative -mt-20 z-20 flex flex-col items-center">
        <div className="w-36 h-36 rounded-[2.2rem] bg-white p-2 shadow-2xl border border-slate-100">
           <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center overflow-hidden relative border-2 border-white/20 shadow-inner group">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Default 3D Avatar Emblem */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white">
                  <span className="text-4xl font-black tracking-tighter drop-shadow-md">
                    {initials}
                  </span>
                  <span className="text-[8px] font-extrabold tracking-widest uppercase opacity-80 mt-0.5">
                    VERIFIED
                  </span>
                </div>
              )}
           </div>
        </div>
        
        {/* Full Name & Applied Position */}
        <div className="mt-3 text-center px-6 space-y-1">
          <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1">
            {name}
          </h3>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-xl">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
             <p className="text-blue-700 font-extrabold text-[10px] uppercase tracking-widest leading-none">
               {position}
             </p>
          </div>
        </div>
      </div>

      {/* Details Box Section */}
      <div className="mt-5 px-8 space-y-4 flex-grow">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Official Intern ID</p>
          <p className="text-sm font-black text-slate-900 font-mono tracking-wider">{internId}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valid From</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{validFrom}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
            <p className="text-xs font-black text-blue-600 mt-0.5">{validTo}</p>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-auto py-4 bg-slate-900 text-white text-center px-6 flex items-center justify-between border-t border-slate-800">
         <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
           <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
           <span>Zaya Authorized</span>
         </div>
         <span className="text-[9px] font-mono text-cyan-400 tracking-widest uppercase">zayacodehub.in</span>
      </div>
    </motion.div>
  );
}
