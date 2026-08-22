'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import CompanyCard from '@/components/placement/CompanyCard';
import {
  BookOpen, Code2, Brain, Briefcase, Users, Star,
  Lock, Zap, ArrowRight, Search,
  Loader2, ChevronDown, Building2
} from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  company_image: string | null;
  description: string | null;
  category: string | null;
  status: string;
}

const BENEFITS = [
  { icon: Building2, title: 'Company-Wise Preparation', desc: 'Prepare specifically for the companies you want to target.' },
  { icon: BookOpen, title: 'Previous Year Questions', desc: 'Practice real placement questions and patterns.' },
  { icon: Code2, title: 'Coding Preparation', desc: 'Coding questions and programming resources.' },
  { icon: Brain, title: 'Aptitude Preparation', desc: 'Quantitative, logical and verbal aptitude resources.' },
  { icon: Briefcase, title: 'Technical Interviews', desc: 'Technical interview preparation materials.' },
  { icon: Users, title: 'HR Interviews', desc: 'HR questions and interview guidance.' },
  { icon: Star, title: 'Interview Experiences', desc: "Learn from previous candidates' experiences." },
  { icon: Zap, title: 'Regularly Updated', desc: 'Admin continuously adds new companies and resources.' },
];

const CATEGORIES = ['All', 'IT', 'Product', 'Service-Based', 'Testing', 'Other'];

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  alreadyPaid?: boolean;
  error?: string;
};

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => Promise<void>;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  on: (event: 'payment.failed', handler: () => void) => void;
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

export default function PlacementPrepPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Check payment status
        const { data: purchase } = await supabase
          .from('placement_purchases')
          .select('status')
          .eq('user_id', currentUser.id)
          .single();
        if (purchase?.status === 'paid') {
          router.replace('/placement-prep/dashboard');
          return;
        }
      }

      // Load companies (public safe fields only — no drive_link)
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

  async function handlePayment() {
    if (!user) { router.push('/login'); return; }
    setPaying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      // Create order
      const orderRes = await fetch('/api/placement/order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const orderData = (await orderRes.json()) as RazorpayOrder;

      if (!orderRes.ok) { alert(orderData.error || 'Failed to initiate payment'); return; }
      if (orderData.alreadyPaid) { router.push('/placement-prep/dashboard'); return; }

      // Load Razorpay script
      const windowWithRazorpay = window as Window & { Razorpay?: RazorpayConstructor };
      if (!windowWithRazorpay.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(s);
        });
      }

      const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Razorpay) {
        throw new Error('Failed to initialize Razorpay');
      }

      const rzp = new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ZAYA CODE HUB',
        description: 'Placement Preparation Portal — Lifetime Access',
        order_id: orderData.id,
        prefill: { email: user.email || '' },
        theme: { color: '#2563eb' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/placement/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              router.push('/placement-prep/payment-success');
            } else {
              router.push('/placement-prep/payment-failed');
            }
          } catch {
            router.push('/placement-prep/payment-failed');
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.on('payment.failed', () => router.push('/placement-prep/payment-failed'));
      rzp.open();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Payment initiation failed');
      setPaying(false);
    }
  }

  const filteredCompanies = companies.filter(c => {
    const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest mb-6">
            <Zap className="h-3.5 w-3.5" />
            Placement Preparation Portal
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Crack Your Dream<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Placement
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Get company-wise placement preparation materials, previous-year questions, coding resources, aptitude preparation, technical interview questions, HR interview questions and interview experiences — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-baseline gap-1">
              <span className="text-white/60 text-lg">₹</span>
              <span className="text-5xl font-black text-white">199</span>
              <span className="text-white/60 text-sm ml-1">one-time access</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" id="unlock">
            <button
              onClick={handlePayment}
              disabled={paying}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70"
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {paying ? 'Processing...' : 'Get Placement Access — ₹199'}
            </button>
            <a
              href="#companies"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-white/20 text-white/80 font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              Explore Companies <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">Everything You Need to Get Placed</h2>
            <p className="text-slate-500 dark:text-slate-400">All resources in one place — one payment, lifetime access.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <b.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2">{b.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANIES PREVIEW */}
      <section id="companies" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">Available Companies</h2>
            <p className="text-slate-500 dark:text-slate-400">
              {companies.length > 0 ? `${companies.length} companies available. Pay once, access all.` : 'Companies being added by our team. Check back soon.'}
            </p>
          </div>

          {/* Search + Filter */}
          {companies.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
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
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold">No companies found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCompanies.map(company => (
                <CompanyCard key={company.id} company={company} isPaid={false} />
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white">
            <h3 className="text-2xl font-black mb-3">Unlock All Companies for ₹199</h3>
            <p className="text-blue-100 mb-6 max-w-lg mx-auto text-sm">
              One-time payment. Lifetime access to all current and future company preparation materials.
            </p>
            <ul className="flex flex-wrap justify-center gap-4 text-xs font-bold mb-8">
              {['✓ Company prep kits', '✓ Previous year questions', '✓ Aptitude resources', '✓ Coding prep', '✓ Technical interviews', '✓ HR preparation', '✓ Interview experiences'].map(item => (
                <li key={item} className="bg-white/10 px-3 py-1.5 rounded-full">{item}</li>
              ))}
            </ul>
            <button
              onClick={handlePayment}
              disabled={paying}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-blue-600 font-black text-sm uppercase tracking-wider hover:shadow-2xl transition-all active:scale-95 disabled:opacity-70"
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Unlock Access — ₹199
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
