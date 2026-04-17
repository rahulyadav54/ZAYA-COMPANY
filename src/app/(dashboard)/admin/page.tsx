'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  MoreVertical,
  Search,
  ArrowUpRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalApps: 0, activeInterns: 0, pendingReviews: 0, successRate: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Fetch Applications
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .order('applied_at', { ascending: false });

      // Fetch Interns
      const { count: internCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'intern');

      if (apps) {
        const total = apps.length;
        const pending = apps.filter(a => a.status === 'pending').length;
        const accepted = apps.filter(a => a.status === 'accepted').length;
        const rate = total > 0 ? Math.round((accepted / total) * 100) : 0;

        setStats({
          totalApps: total,
          activeInterns: internCount || 0,
          pendingReviews: pending,
          successRate: rate
        });

        setRecentApps(apps.slice(0, 5));
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: stats.totalApps.toString(), change: '+0%', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Registered Interns', value: stats.activeInterns.toString(), change: '+0%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Pending Reviews', value: stats.pendingReviews.toString(), change: '0%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Acceptance Rate', value: `${stats.successRate}%`, change: '+0%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-2" /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-foreground">Recent Applications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : recentApps.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No recent applications.
                    </td>
                  </tr>
                ) : recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{app.full_name}</div>
                      <div className="text-xs text-slate-500">{new Date(app.applied_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-foreground text-sm font-medium">
                      {app.position}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                        app.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link href="/admin/applications" className="text-sm font-bold text-blue-600 hover:underline">
              View All Applications
            </Link>
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-foreground">Growth</h3>
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="relative h-48 w-full bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-end p-4 gap-2">
              {[40, 60, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-600/20 rounded-t-lg relative group">
                  <div 
                    style={{ height: `${h}%` }} 
                    className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all group-hover:bg-blue-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-foreground">Quick Actions</h4>
              <Link href="/admin/interns" className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 transition-all group text-left">
                <span className="font-medium text-foreground">Manage Interns</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
              <Link href="/admin/settings" className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 transition-all group text-left">
                <span className="font-medium text-foreground">System Settings</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
