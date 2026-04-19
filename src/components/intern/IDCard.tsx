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
  const validTo = new Date(new Date(profile.created_at).setMonth(new Date(profile.created_at).getMonth() + 6)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div id="id-card-capture" className="w-[350px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col relative" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Top Header Design */}
      <div className="h-40 bg-[#2563eb] relative overflow-hidden flex flex-col items-center justify-center pt-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <img src="/logo.png" alt="Logo" className="h-12 object-contain brightness-0 invert mb-2 relative z-10" />
        <h2 className="text-white font-black tracking-tighter text-lg relative z-10">ZAYA CODE HUB</h2>
      </div>

      {/* Decorative Corner Accents (Top Left) */}
      <div className="absolute top-0 left-0 w-32 h-32 z-20 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1e3a8a] to-transparent rotate-45 -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute top-2 left-2 w-full h-full border-t-4 border-l-4 border-[#eab308]/30 rounded-tl-[3rem]" />
      </div>

      {/* Profile Image Section */}
      <div className="relative -mt-16 z-20 flex flex-col items-center shrink-0">
        <div className="relative group">
          <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#4f46e5] p-1 shadow-xl">
            <div className="h-full w-full rounded-[1.3rem] bg-white overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#f8fafc]">
                  <Users className="h-10 w-10 text-[#cbd5e1]" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#22c55e] border-4 border-white rounded-full"></div>
        </div>
        
        <div className="mt-4 text-center space-y-1">
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">{profile.full_name}</h1>
          <p className="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.3em] mt-1">{profile.position || 'Intern'}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full px-4">
        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9]">
          <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Intern ID</p>
          <p className="text-xs font-black text-[#0f172a] tracking-tight">{internId}</p>
        </div>
        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9]">
          <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Issue Date</p>
          <p className="text-xs font-black text-[#0f172a] tracking-tight">{validFrom}</p>
        </div>
      </div>

      {/* Details Section */}
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
