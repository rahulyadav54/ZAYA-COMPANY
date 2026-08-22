'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Building2, ExternalLink, ArrowLeft, CheckCircle, Lock, Loader2 } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  company_image: string | null;
  description: string | null;
  category: string | null;
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: purchase } = await supabase
          .from('placement_purchases')
          .select('status')
          .eq('user_id', session.user.id)
          .single();
        setIsPaid(purchase?.status === 'paid');
      }

      const { data } = await supabase
        .from('placement_companies')
        .select('id, company_name, company_image, description, category')
        .eq('id', id)
        .eq('status', 'active')
        .single();
      setCompany(data);
      setLoading(false);
    }
    init();
  }, [id]);

  async function handleOpenKit() {
    setOpening(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const res = await fetch(`/api/placement/get-drive-link?company_id=${id}`, {
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
      setOpening(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>;

  if (!company) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 font-bold">Company not found.</p>
      <button onClick={() => router.back()} className="text-blue-600 font-bold text-sm">← Go Back</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="container mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Company Hero */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center h-52">
            {company.company_image ? (
              <img src={company.company_image} alt={company.company_name} className="max-h-36 max-w-[60%] object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
                <Building2 className="h-20 w-20" />
                <span className="text-sm font-black uppercase tracking-widest">{company.company_name}</span>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{company.company_name}</h1>
                {company.category && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest">
                    {company.category}
                  </span>
                )}
              </div>
              {isPaid ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <CheckCircle className="h-4 w-4" /> Access Active
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <Lock className="h-4 w-4" /> Locked
                </div>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              {company.description || 'Placement preparation materials including aptitude, coding, technical and HR interview resources.'}
            </p>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
              {isPaid ? (
                <button
                  onClick={handleOpenKit}
                  disabled={opening}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-wider text-sm hover:shadow-xl hover:shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  {opening ? 'Opening...' : 'Open Complete Preparation Kit'}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Purchase placement access to unlock this preparation kit.</p>
                  <a
                    href="/placement-prep#unlock"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider hover:shadow-xl hover:shadow-blue-600/25 transition-all"
                  >
                    <Lock className="h-4 w-4" /> Unlock With ₹199
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
