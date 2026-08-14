'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  RefreshCw,
  Plus,
  Briefcase,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalApps: 0, activeInterns: 0, pendingReviews: 0, totalRevenue: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentActiveInterns, setRecentActiveInterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    
    // Fetch Applications
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (appsError) {
      console.warn("Notice fetching applications:", appsError);
    }

    // Fetch Interns Count
    const { count: internCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'intern');

    // Fetch Revenue (from paid submissions)
    const { data: paidSubmissions } = await supabase
      .from('submissions')
      .select('id')
      .eq('payment_status', 'paid');

    const applicationList = apps || [];
    const total = applicationList.length;
    const pending = applicationList.filter(a => a.status === 'pending').length;
    const revenue = (paidSubmissions?.length || 0) * 125;

    setStats({
      totalApps: total,
      activeInterns: internCount || 0,
      pendingReviews: pending,
      totalRevenue: revenue
    });

    setRecentApps(applicationList.slice(0, 6));

    // Fetch Recently Active Interns
    const { data: activeInterns } = await supabase
      .from('profiles')
      .select('id, full_name, email, last_login, login_count, position')
      .eq('role', 'intern')
      .not('last_login', 'is', null)
      .order('last_login', { ascending: false })
      .limit(5);
    
    if (activeInterns) {
      setRecentActiveInterns(activeInterns);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
              Enterprise Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            ZAYA CODE HUB Command Center
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time candidate pipeline monitoring, active intern tracking, and system performance overview.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-xs font-bold transition-all border border-white/10 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/admin/applications"
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Manage All Applications</span>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: stats.totalApps.toString(), sub: 'Candidate submissions', icon: FileText, color: 'from-blue-600 to-indigo-600', href: '/admin/applications' },
          { label: 'Registered Interns', value: stats.activeInterns.toString(), sub: 'Active program members', icon: Users, color: 'from-indigo-600 to-purple-600', href: '/admin/interns' },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, sub: 'Verified payments', icon: TrendingUp, color: 'from-emerald-600 to-teal-600', href: '/admin/submissions' },
          { label: 'Pending Reviews', value: stats.pendingReviews.toString(), sub: 'Action required', icon: Clock, color: 'from-amber-500 to-orange-600', href: '/admin/applications' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group block relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-tr ${stat.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-2" /> : stat.value}
              </p>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Recent Job Applications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Latest candidates applying for engineering & design roles
                </p>
              </div>
              <Link
                href="/admin/applications"
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
              >
                View All ({stats.totalApps})
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Applied</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="h-7 w-7 animate-spin mx-auto text-blue-600" />
                        <span className="text-xs font-bold mt-2 block">Loading applications...</span>
                      </td>
                    </tr>
                  ) : recentApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-50" />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No applications recorded yet</p>
                        <p className="text-xs text-slate-400 mt-1">Applications submitted on the website will appear here in real time.</p>
                      </td>
                    </tr>
                  ) : (
                    recentApps.map((app) => {
                      const initials = app.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'AP';
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white leading-tight">{app.full_name}</div>
                                <div className="text-xs text-slate-500 font-medium">{app.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-800 dark:text-slate-200 text-xs font-bold">
                            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700">
                              {app.position}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(app.applied_at || app.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase inline-flex items-center gap-1.5 ${
                              app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
                              app.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                app.status === 'accepted' ? 'bg-emerald-500' :
                                app.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
            <Link href="/admin/applications" className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>Access Full Applications Database</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* System Activity & Quick Launch */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Active Members</h3>
                <p className="text-xs text-slate-500 font-medium">Intern portal login activity</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            
            <div className="space-y-4">
              {recentActiveInterns.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Users className="h-6 w-6 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500 font-bold">No active login sessions recorded</p>
                </div>
              ) : (
                recentActiveInterns.map((intern) => (
                  <div key={intern.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                        {intern.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">{intern.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{intern.position || 'Intern'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        {new Date(intern.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400">
                        {intern.login_count} logins
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Launcher Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Command Actions</h4>
            <div className="space-y-3">
              <Link href="/admin/interns" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Register / Manage Interns</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link href="/admin/careers" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Post New Internship Role</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link href="/admin/messages" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Broadcast Announcement</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
