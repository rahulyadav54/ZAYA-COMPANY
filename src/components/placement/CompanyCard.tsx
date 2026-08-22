'use client';

import { useState } from 'react';
import { Building2, Lock, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Company {
  id: string;
  company_name: string;
  company_image: string | null;
  description: string | null;
  category: string | null;
  status: string;
}

interface CompanyCardProps {
  company: Company;
  isPaid: boolean;
}

export default function CompanyCard({ company, isPaid }: CompanyCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleOpenKit() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`/api/placement/get-drive-link?company_id=${company.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();

      if (res.ok && data.drive_link) {
        window.open(data.drive_link, '_blank', 'noopener,noreferrer');
      } else {
        alert(data.error || 'Failed to open preparation kit.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const categoryColors: Record<string, string> = {
    IT: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    Product: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    'Service-Based': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    Testing: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
    Other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  const catColor = categoryColors[company.category || 'IT'] || categoryColors.Other;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Company Image */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 flex items-center justify-center overflow-hidden">
        {company.company_image ? (
          <img
            src={company.company_image}
            alt={company.company_name}
            className="max-h-28 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
            <Building2 className="h-16 w-16" />
            <span className="text-xs font-bold tracking-widest uppercase">{company.company_name}</span>
          </div>
        )}
        {!isPaid && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-full p-3 shadow-lg">
              <Lock className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">{company.company_name}</h3>
          {company.category && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0 ${catColor}`}>
              {company.category}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
          {company.description || 'Placement preparation materials available.'}
        </p>

        <div className="flex items-center gap-1.5 text-xs">
          {isPaid ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Preparation Kit Available</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-bold">Locked</span>
            </>
          )}
        </div>

        {isPaid ? (
          <button
            onClick={handleOpenKit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening...</>
            ) : (
              <><ExternalLink className="h-3.5 w-3.5" /> Open Preparation Kit</>
            )}
          </button>
        ) : (
          <a
            href="/placement-prep#unlock"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 text-xs font-black uppercase tracking-wider hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
          >
            <Lock className="h-3.5 w-3.5" /> Unlock With ₹199
          </a>
        )}
      </div>
    </div>
  );
}
