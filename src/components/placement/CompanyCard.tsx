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
  accessToken?: string;
}

export default function CompanyCard({ company, isPaid, accessToken }: CompanyCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleOpenKit() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || accessToken || window.localStorage.getItem('zaya_placement_access_token') || '';
      if (!token) {
        window.location.href = '/placement-prep';
        return;
      }

      const res = await fetch(`/api/placement/get-drive-link?company_id=${company.id}`, {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : { 'X-Placement-Token': token },
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
    IT: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    Product: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    'Service-Based': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    Testing: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  const catColor = categoryColors[company.category || 'IT'] || categoryColors.Other;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Company Image */}
      <div className="relative h-40 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
        {company.company_image ? (
          <img
            src={company.company_image}
            alt={company.company_name}
            className="max-h-28 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
            <Building2 className="h-16 w-16" />
            <span className="text-xs font-medium tracking-wide">{company.company_name}</span>
          </div>
        )}
        {!isPaid && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-full p-3 shadow-md">
              <Lock className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">{company.company_name}</h3>
          {company.category && (
            <span className={`text-[9px] font-medium px-2 py-1 rounded-lg shrink-0 ${catColor}`}>
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
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Preparation Kit Available</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Locked</span>
            </>
          )}
        </div>

        {isPaid ? (
          <button
            onClick={handleOpenKit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-70"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          >
            <Lock className="h-3.5 w-3.5" /> Unlock With ₹199
          </a>
        )}
      </div>
    </div>
  );
}
