'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import CompanyCard from '@/components/placement/CompanyCard';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Code2,
  Crown,
  FileText,
  Headphones,
  Layers3,
  Lock,
  LucideIcon,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  Zap,
  Loader2,
} from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  company_image: string | null;
  description: string | null;
  category: string | null;
  status: string;
}

type AccessState = 'loading' | 'unknown' | 'paid' | 'guest';

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  access_token: string;
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
  prefill: { email: string; contact: string; name: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => Promise<void>;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  on: (event: 'payment.failed', handler: () => void) => void;
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

const ACCESS_TOKEN_KEY = 'zaya_placement_access_token';
const GUEST_EMAIL_KEY = 'zaya_placement_guest_email';
const GUEST_NAME_KEY = 'zaya_placement_guest_name';
const GUEST_PHONE_KEY = 'zaya_placement_guest_phone';

const CATEGORIES = ['All', 'IT', 'Product', 'Service-Based', 'Testing', 'Other'];

const BENEFITS: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  { icon: Building2, title: 'Company-Wise Preparation', desc: 'Target the exact companies you want with organized, company-specific material.' },
  { icon: BookOpen, title: 'Previous Year Questions', desc: 'Practice the patterns that keep showing up in real placement tests.' },
  { icon: Code2, title: 'Coding Practice', desc: 'Coding questions, programming basics, and exam-focused practice sets.' },
  { icon: Brain, title: 'Aptitude Focus', desc: 'Quant, reasoning, and verbal preparation in one structured bundle.' },
  { icon: Briefcase, title: 'Interview Prep', desc: 'Technical, HR, and group discussion prep without scattered searches.' },
  { icon: Star, title: 'Easy to Follow', desc: 'Clean PDF notes and simple structure so you can study faster.' },
  { icon: Zap, title: 'Instant Access', desc: 'Unlock the bundle immediately after payment and start preparing.' },
  { icon: ShieldCheck, title: 'Lifetime Access', desc: 'Pay once and keep access to the materials without expiry.' },
];

const FEATURES = [
  'Company-wise placement material',
  'Latest questions and previous year papers',
  'Pseudocode and aptitude practice sets',
  'Interview preparation material',
  'Real exam pattern based content',
  'Covers 30+ top companies',
];

const PREMIUM_FEATURES = [
  'High-quality PDF notes',
  'Google Drive instant delivery',
  'Structured and easy to understand content',
  'Designed for faster selection',
  'No expiry lifetime access',
];

const PERFECT_FOR = [
  'Final year students',
  'Job seekers',
  'Placement beginners',
  'IT and core company aspirants',
];

const TESTIMONIALS = [
  {
    quote: 'I was struggling with placement prep, but this bundle saved my time. Everything is perfectly organized.',
    name: 'Rahul Sharma',
    role: 'Final Year Student',
  },
  {
    quote: 'Best investment for placement preparation. No need to search anywhere else. Everything is in one place.',
    name: 'Priya Singh',
    role: 'Job Seeker',
  },
  {
    quote: 'Got almost similar questions in my test. This material is actually exam-focused and worth every rupee.',
    name: 'Ankit Verma',
    role: 'Placed in TCS',
  },
  {
    quote: 'The pseudocode and aptitude practice sets are amazing. Helped me improve my speed and accuracy.',
    name: 'Neha Gupta',
    role: 'CGL Aspirant',
  },
];

const FAQS = [
  { q: 'How will I receive the material after payment?', a: 'You will get instant access to the Google Drive link right after payment is verified.' },
  { q: 'What does this bundle include?', a: 'Company-wise placement material, previous year questions, aptitude practice, interview prep, and more.' },
  { q: 'Is this a one-time payment or subscription?', a: 'It is a one-time payment with lifetime access.' },
  { q: 'Will I get lifetime access?', a: 'Yes, the bundle is built for lifetime access with no expiry.' },
  { q: 'Can I access this on mobile or laptop?', a: 'Yes, the material can be opened on mobile, tablet, or laptop.' },
  { q: 'Is this suitable for beginners?', a: 'Yes, the bundle is structured for students at all levels, including beginners.' },
  { q: 'Which companies are covered?', a: 'It covers 30+ companies, including TCS, Wipro, Infosys, Accenture, Amazon, Capgemini, Cognizant, and more.' },
  { q: 'Is the material updated?', a: 'Yes, the bundle is updated as new company patterns and questions are added.' },
  { q: 'Is there any refund policy?', a: 'Because the bundle is delivered digitally and instantly, refunds are handled only in exceptional cases.' },
  { q: 'How will this help me in placement?', a: 'It saves time, reduces confusion, and gives you focused exam-ready material so you can prepare smarter.' },
];

const COMPANY_FILTERS = ['All', 'IT', 'Product', 'Service-Based', 'Testing', 'Other'];

export default function PlacementPrepPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [accessState, setAccessState] = useState<AccessState>('loading');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    async function init() {
      const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
      const storedEmail = window.localStorage.getItem(GUEST_EMAIL_KEY);
      const storedName = window.localStorage.getItem(GUEST_NAME_KEY);
      const storedPhone = window.localStorage.getItem(GUEST_PHONE_KEY);

      if (storedEmail) setGuestEmail(storedEmail);
      if (storedName) setGuestName(storedName);
      if (storedPhone) setGuestPhone(storedPhone);

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: purchase } = await supabase
          .from('placement_purchases')
          .select('status, guest_access_token')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (purchase?.status === 'paid') {
          if (purchase.guest_access_token) {
            window.localStorage.setItem(ACCESS_TOKEN_KEY, purchase.guest_access_token);
          }
          setAccessState('paid');
          router.replace('/placement-prep/dashboard');
          return;
        }
      } else if (storedToken) {
        const res = await fetch(`/api/placement/check-access?token=${encodeURIComponent(storedToken)}`);
        const data = await res.json();
        if (data.hasAccess) {
          setAccessState('guest');
          router.replace('/placement-prep/dashboard');
          return;
        }
      }

      const { data } = await supabase
        .from('placement_companies')
        .select('id, company_name, company_image, description, category, status')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      setCompanies(data || []);
      setAccessState(currentUser ? 'unknown' : storedToken ? 'guest' : 'unknown');
      setLoading(false);
    }

    init();
  }, [router]);

  function getAccessToken() {
    let token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      token = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    return token;
  }

  async function handlePayment() {
    const email = (user?.email || guestEmail).trim();
    const name = guestName.trim() || user?.user_metadata?.full_name?.trim() || '';
    const phone = guestPhone.trim();

    if (!name || !phone || !email) {
      setCheckoutError('Please enter your name, phone number, and Gmail to continue.');
      return;
    }

    setPaying(true);
    setCheckoutError('');
    try {
      const accessToken = getAccessToken();
      const { data: { session } } = await supabase.auth.getSession();

      window.localStorage.setItem(GUEST_NAME_KEY, name);
      window.localStorage.setItem(GUEST_EMAIL_KEY, email);
      window.localStorage.setItem(GUEST_PHONE_KEY, phone);

      const orderRes = await fetch('/api/placement/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          guest_email: email,
          guest_name: name,
          guest_phone: phone,
          access_token: accessToken,
        }),
      });

      const orderData = (await orderRes.json()) as RazorpayOrder;
      if (!orderRes.ok) {
        setCheckoutError(orderData.error || 'Failed to initiate payment');
        return;
      }

      if (orderData.alreadyPaid) {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, orderData.access_token || accessToken);
        router.push('/placement-prep/dashboard');
        return;
      }

      const windowWithRazorpay = window as Window & { Razorpay?: RazorpayConstructor };
      if (!windowWithRazorpay.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });
      }

      const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Razorpay) throw new Error('Failed to initialize Razorpay');

      const rzp = new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ZAYA CODE HUB',
        description: '₹199 Placement Bundle - Lifetime Access',
        order_id: orderData.id,
        prefill: { email, contact: phone, name },
        theme: { color: '#2563eb' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/placement/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                access_token: orderData.access_token || accessToken,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              window.localStorage.setItem(ACCESS_TOKEN_KEY, verifyData.access_token || orderData.access_token || accessToken);
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
      setCheckoutError(e instanceof Error ? e.message : 'Payment initiation failed');
      setPaying(false);
    }
  }

  const filteredCompanies = companies.filter((company) => {
    const matchSearch = company.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (company.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || company.category === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden bg-slate-900 text-white px-4 pb-20 pt-24">
        <div className="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-blue-200">
              <Crown className="h-3.5 w-3.5" />
              199 Placement Bundle That Can Change Your Career
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              All Companies Placement Material
              <span className="block text-blue-300 mt-2">
                Complete Bundle for 2026 Ready Prep
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Stop wasting time searching scattered resources. This all-in-one placement bundle gives you company-wise preparation, previous year questions, aptitude practice, interview material, and exam-focused notes in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['TCS', 'Wipro', 'Infosys', 'Accenture', 'Amazon', 'Capgemini', 'Cognizant'].map((company) => (
                <span key={company} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                  {company}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#buy"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-7 py-4 text-sm font-medium text-white transition-colors"
              >
                Buy Now for &#8377;199 <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-7 py-4 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                View Details <ChevronDown className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard title="Companies" value="30+" detail="Top company coverage" />
              <StatCard title="Access" value="Instant" detail="Google Drive delivery" />
              <StatCard title="Validity" value="Lifetime" detail="No expiry" />
            </div>
          </div>

          <div className="relative z-10" id="buy">
            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/15 p-3 text-blue-300">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-200/70">Instant Purchase</p>
                  <h2 className="text-xl font-semibold text-white">No login required</h2>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Price</p>
                <div className="mt-2 flex items-end gap-2 text-white">
                  <span className="text-sm text-slate-300">&#8377;</span>
                  <span className="text-5xl font-bold">199</span>
                  <span className="pb-1 text-sm text-slate-400">one-time</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Buy once, get lifetime access to the bundle and future updates.
                </p>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Name</span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</span>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Phone</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400"
                  />
                </label>
              </div>

              {checkoutError && (
                <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {checkoutError}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={paying}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-4 text-sm font-medium text-slate-950 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-70"
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {paying ? 'Processing...' : 'Pay and Get Access'}
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                After payment, your access token is saved in this browser so you can reopen the bundle without logging in.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-slate-50 px-4 py-20 dark:bg-slate-900/40">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">About the page</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
              Complete placement bundle built for serious candidates
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Are you serious about cracking your dream job in top companies? This bundle is designed to give you company-wise material, latest questions, previous year papers, pseudocode, aptitude practice, interview prep, and exam-pattern content in one organized place.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {BENEFITS.map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 inline-flex rounded-lg bg-blue-600 p-3 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <InfoPanel title="What You'll Get" icon={FileText} items={FEATURES} accent="bg-blue-600" />
            <InfoPanel title="Premium Features" icon={Layers3} items={PREMIUM_FEATURES} accent="bg-emerald-600" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-900/40">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Why this is worth it</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                Stop collecting random resources from everywhere
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                Most students lose time because the right material is scattered across multiple places. This bundle saves your time, boosts your preparation, and gives you a clear path to study smarter.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  'Prepared for exam-style questions',
                  'Boosts speed and accuracy',
                  'Easy for beginners and final year students',
                  'Works great for IT and core company prep',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Perfect for</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Who should buy this bundle?</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {PERFECT_FOR.map((label) => (
                  <div key={label} className="rounded-lg border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-blue-600 p-6 text-white">
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">Take action now</p>
                <p className="mt-2 text-lg font-semibold">Don&apos;t wait until it&apos;s too late.</p>
                <p className="mt-2 text-sm leading-7 text-blue-100">
                  Thousands of students are already preparing smart. Buy now and start your placement journey today.
                </p>
                <a
                  href="#buy"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-xs font-medium text-blue-700"
                >
                  Buy Now &amp; Start Preparing <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="companies" className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Companies covered</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">Available Companies</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {companies.length > 0
                ? `${companies.length} companies available. Pay once, access everything.`
                : 'Companies are being added. Check back soon.'}
            </p>
          </div>

          {companies.length > 0 && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {COMPANY_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCompanies.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Building2 className="mx-auto mb-4 h-16 w-16 opacity-30" />
              <p className="font-bold">{search ? 'No companies match your search.' : 'No companies available yet.'}</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} isPaid={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-900/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Testimonials</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">Students are already using it</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {TESTIMONIALS.map((item) => (
              <figure key={item.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <blockquote className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">"{item.quote}"</blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-400">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20" id="faq">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Frequently asked questions</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">Common questions, answered</h2>
          </div>
          <div className="mt-10 grid gap-4">
            {FAQS.map((faq, index) => (
              <details key={faq.q} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm open:shadow-md dark:border-slate-800 dark:bg-slate-950">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-slate-950 dark:text-white">
                  <span>{index + 1}. {faq.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-900 px-4 py-20 text-white">
        <div className="container mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-200/70">Contact me for any issues or queries</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Need help after payment?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              If you have any issue with payment or access, reach out and we will help you quickly.
            </p>
            <a
              href="mailto:zayacodehub@gmail.com?subject=Placement%20Bundle%20Support"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-4 text-sm font-medium text-slate-950"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-200/70">Want a direct message?</p>
            <label className="mt-5 block">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-300">Message</span>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
                placeholder="Tell us what you need help with..."
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href="mailto:zayacodehub@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-3.5 text-xs font-medium text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </a>
              <a
                href="#buy"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
              >
                <ArrowRight className="h-4 w-4" />
                Buy Access
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/70">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-300">{detail}</p>
    </div>
  );
}

function InfoPanel({
  title,
  icon: Icon,
  items,
  accent,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg ${accent} p-3 text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
