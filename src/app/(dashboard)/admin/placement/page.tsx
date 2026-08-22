'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Building2, DollarSign, Users, Clock, BookOpen, 
  Trash2, Edit, Check, X, Search, Filter, Plus, 
  ChevronRight, ArrowLeft, ShieldCheck, Mail, Loader2
} from 'lucide-react';
import CompanyForm from '@/components/placement/CompanyForm';

interface Company {
  id: string;
  company_name: string;
  company_image: string | null;
  drive_link: string;
  description: string | null;
  category: string | null;
  status: string;
  display_order: number;
  created_at: string;
}

interface Purchase {
  id: string;
  user_id: string;
  amount_inr: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  purchased_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

type PurchaseRow = Omit<Purchase, 'profiles'> & {
  profiles: Purchase['profiles'] | Purchase['profiles'][] | null;
};

export default function AdminPlacementPage() {
  const [activeTab, setActiveTab] = useState<'companies' | 'purchases'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalPaidUsers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  
  // Search & Filters
  const [compSearch, setCompSearch] = useState('');
  const [compCatFilter, setCompCatFilter] = useState('All');
  
  const [purchSearch, setPurchSearch] = useState('');
  const [purchStatusFilter, setPurchStatusFilter] = useState('All');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch Companies
      const resComp = await fetch('/api/admin/placement', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const compData = await resComp.json();
      if (resComp.ok) {
        setCompanies(compData || []);
      }

      // 2. Fetch Purchases (we use service client / supabase directly because of admin privileges)
      const { data: purchaseData } = await supabase
        .from('placement_purchases')
        .select(`
          id,
          user_id,
          amount_inr,
          razorpay_order_id,
          razorpay_payment_id,
          status,
          purchased_at,
          profiles:user_id(email, full_name)
        `)
        .order('purchased_at', { ascending: false });

      const mappedPurchases = ((purchaseData || []) as PurchaseRow[]).map((p) => ({
        ...p,
        profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      })) as Purchase[];

      setPurchases(mappedPurchases);

      // 3. Compute Stats
      const activeCompanies = (compData || []).length;
      const paidPurchases = mappedPurchases.filter(p => p.status === 'paid');
      const totalPaid = paidPurchases.length;
      const totalRev = paidPurchases.reduce((acc, curr) => acc + curr.amount_inr, 0);
      const pending = mappedPurchases.filter(p => p.status === 'pending').length;

      setStats({
        totalCompanies: activeCompanies,
        totalPaidUsers: totalPaid,
        totalRevenue: totalRev,
        pendingPayments: pending,
      });

    } catch (error) {
      console.error('Error fetching admin placement data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCompany(id: string) {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/placement?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete company.');
      }
    } catch {
      alert('Failed to delete company.');
    }
  }

  async function handleToggleStatus(company: Company) {
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/placement', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: company.id, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to toggle status');
      }
    } catch {
      alert('Failed to toggle status');
    }
  }

  const filteredCompanies = companies.filter(c => {
    const matchSearch = c.company_name.toLowerCase().includes(compSearch.toLowerCase()) || 
                        (c.description || '').toLowerCase().includes(compSearch.toLowerCase());
    const matchCat = compCatFilter === 'All' || c.category === compCatFilter;
    return matchSearch && matchCat;
  });

  const filteredPurchases = purchases.filter(p => {
    const userEmail = p.profiles?.email || '';
    const userName = p.profiles?.full_name || '';
    const matchSearch = userEmail.toLowerCase().includes(purchSearch.toLowerCase()) ||
                        userName.toLowerCase().includes(purchSearch.toLowerCase()) ||
                        (p.razorpay_order_id || '').toLowerCase().includes(purchSearch.toLowerCase()) ||
                        (p.razorpay_payment_id || '').toLowerCase().includes(purchSearch.toLowerCase());
    const matchStatus = purchStatusFilter === 'All' || p.status === purchStatusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<Building2 className="h-6 w-6 text-blue-500" />} label="Total Companies" value={stats.totalCompanies} color="blue" />
        <StatCard icon={<Users className="h-6 w-6 text-emerald-500" />} label="Paid Users" value={stats.totalPaidUsers} color="green" />
        <StatCard icon={<DollarSign className="h-6 w-6 text-purple-500" />} label="Total Revenue" value={`₹${stats.totalRevenue}`} color="purple" />
        <StatCard icon={<Clock className="h-6 w-6 text-orange-500" />} label="Pending Payments" value={stats.pendingPayments} color="orange" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'companies'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Company Management
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'purchases'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Placement Purchases
        </button>
      </div>

      {activeTab === 'companies' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search and filter */}
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search company..."
                  value={compSearch}
                  onChange={e => setCompSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none"
                />
              </div>
              <select
                value={compCatFilter}
                onChange={e => setCompCatFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
              >
                <option value="All">All Categories</option>
                <option value="IT">IT</option>
                <option value="Product">Product</option>
                <option value="Service-Based">Service-Based</option>
                <option value="Testing">Testing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={() => { setEditingCompany(undefined); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Company
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850">
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400 w-16">Logo</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Company</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400 w-24">Status</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredCompanies.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        {c.company_image ? (
                          <img src={c.company_image} alt={c.company_name} className="w-10 h-10 object-contain rounded" />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-300" />
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{c.company_name}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">
                          {c.category || 'IT'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 max-w-[200px] truncate">{c.description || 'No description'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                            c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {c.status}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setEditingCompany(c); setShowModal(true); }}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(c.id)}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No companies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Purchases List */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search email, order ID..."
                  value={purchSearch}
                  onChange={e => setPurchSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none"
                />
              </div>
              <select
                value={purchStatusFilter}
                onChange={e => setPurchStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
              >
                <option value="All">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850">
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">User Email</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Name</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Order ID</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Payment ID</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400 w-24">Status</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-400 w-36">Purchase Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-semibold">{p.profiles?.email || 'N/A'}</td>
                      <td className="p-4">{p.profiles?.full_name || 'N/A'}</td>
                      <td className="p-4 text-slate-500 font-mono">{p.razorpay_order_id || 'N/A'}</td>
                      <td className="p-4 text-slate-500 font-mono">{p.razorpay_payment_id || 'N/A'}</td>
                      <td className="p-4 font-bold">₹{p.amount_inr}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          p.status === 'paid' 
                            ? 'bg-emerald-105 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : p.status === 'pending'
                            ? 'bg-orange-105 text-orange-700 dark:bg-orange-950/40'
                            : 'bg-red-105 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(p.purchased_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">No purchases found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h3>
            <CompanyForm
              initial={editingCompany}
              onSuccess={() => { setShowModal(false); setEditingCompany(undefined); fetchData(); }}
              onCancel={() => { setShowModal(false); setEditingCompany(undefined); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-950/30 dark:border-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900/30 dark:text-orange-400',
  };
  return (
    <div className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border ${colors[color]} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>
    </div>
  );
}
