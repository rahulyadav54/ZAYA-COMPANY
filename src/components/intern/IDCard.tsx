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
                   <p className="text-5xl font-black text-[#2563eb] opacity-20">{profile.full_name?.charAt(0)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#22c55e] border-4 border-white rounded-full"></div>
        </div>
        
        <div className="mt-4 text-center space-y-1 px-6">
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-tight">{profile.full_name}</h1>
          <p className="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.3em] mt-1">{profile.position || 'Intern'}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 w-full px-6">
        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9] text-center">
          <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Intern ID</p>
          <p className="text-xs font-black text-[#0f172a] tracking-tight">{internId}</p>
        </div>
        <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9] text-center">
          <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Valid Until</p>
          <p className="text-xs font-black text-[#0f172a] tracking-tight">{validTo}</p>
        </div>
      </div>

      <div className="mt-auto px-6 py-8 flex flex-col items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] mb-4">
          <Mail className="h-3 w-3 text-[#2563eb]" />
          {profile.email}
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-[#22c55e]" />
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center">
            <Globe className="h-5 w-5 text-[#2563eb]" />
          </div>
        </div>
      </div>

      {/* Decorative Bottom Strip */}
      <div className="h-2 bg-gradient-to-r from-[#2563eb] to-[#4f46e5] w-full shrink-0" />
    </div>
  );
}
