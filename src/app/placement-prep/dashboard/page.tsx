'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import CompanyCard from '@/components/placement/CompanyCard';
import { Search, ShieldCheck, Loader2, Building2 } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  company_image: string | null;
  description: string | null;
  category: string | null;
  status: string;
}

interface Purchase {
  amount_inr: number;
  razorpay_payment_id: string | null;
  purchased_at: string;
  status: string;
}

const CATEGORIES = ['All', 'IT', 'Product', 'Service-Based', 'Testing', 'Other'];
const ACCESS_TOKEN_KEY = 'zaya_placement_access_token';

export default function PlacementDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const guestToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) || '';

      if (session?.user) {
        setUser(session.user);
        const { data: purchaseData } = await supabase
          .from('placement_purchases')
          .select('amount_inr, razorpay_payment_id, purchased_at, status, guest_access_token')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!purchaseData || purchaseData.status !== 'paid') {
          router.replace('/placement-prep');
          return;
        }

        setPurchase(purchaseData);
        setAccessToken(purchaseData.guest_access_token || guestToken);
      } else if (guestToken) {
        const res = await fetch(`/api/placement/check-access?token=${encodeURIComponent(guestToken)}`);
        const data = await res.json();
        if (!data.hasAccess) {
          router.replace('/placement-prep');
          return;
        }

        setAccessToken(guestToken);
        setPurchase({
          amount_inr: 199,
          razorpay_payment_id: data.payment_id || null,
          purchased_at: new Date().toISOString(),
          status: 'paid',
        });
      } else {
        router.replace('/placement-prep');
        return;
      }

      // Load companies (safe fields — no drive_link)
      const { data } = await supabase
        .from('placement_companies')
        .select('id, company_name, company_image, description, category, status')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      setCompanies(data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const filteredCompanies = companies.filter(c => {
    const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header */}
      <section className="bg-slate-900 px-4 py-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-blue-300/70 text-xs font-medium uppercase tracking-widest mb-2">Placement Preparation Portal</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1">
                Welcome, {userName} 👋
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium uppercase tracking-widest">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Placement Access Active
                </span>
              </div>
            </div>
            {purchase && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg px-5 py-3 text-center">
                  <p className="text-white/50 text-[9px] font-medium uppercase tracking-widest mb-1">Amount Paid</p>
                  <p className="text-white font-semibold text-lg">₹{purchase.amount_inr}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-5 py-3 text-center">
                  <p className="text-white/50 text-[9px] font-medium uppercase tracking-widest mb-1">Access</p>
                  <p className="text-white font-semibold text-lg">Lifetime</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-5 py-3 text-center">
                  <p className="text-white/50 text-[9px] font-medium uppercase tracking-widest mb-1">Date</p>
                  <p className="text-white font-semibold text-sm">
                    {new Date(purchase.purchased_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="container mx-auto max-w-6xl px-4 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Preparation Materials
            <span className="ml-2 text-xs font-medium text-slate-400 normal-case">({filteredCompanies.length} companies)</span>
          </h2>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              {search ? 'No companies match your search.' : 'No companies available yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanies.map(company => (
              <CompanyCard key={company.id} company={company} isPaid={true} accessToken={accessToken} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
