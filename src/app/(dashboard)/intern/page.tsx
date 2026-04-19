'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Clock, CheckCircle2, AlertCircle, FileUp, Trophy, Calendar, Loader2, ArrowRight, X, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default function InternDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError("User not authenticated. Please log in again.");
          setIsLoading(false);
          return;
        }

        // Fetch Profile
        try {
           const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
           if (p) setProfile(p);
        } catch (e) { console.error("Profile load failed"); }

        // Fetch Submissions
        let allSubmissions: any[] = [];
        try {
           const { data: s } = await supabase
             .from('submissions')
             .select('*, tasks(title, duration_months)')
             .eq('intern_id', user.id);
           if (s) allSubmissions = s;
        } catch (e) { console.error("Submissions load failed"); }

        // Fetch Tasks and dynamically update their status based on submissions
        try {
           const { data: t } = await supabase.from('tasks').select('*').eq('intern_id', user.id).order('created_at', { ascending: false });
           if (t) {
             const updatedTasks = t.map(task => {
                // Prioritize approved submissions if multiple exist
                const sub = allSubmissions
                  .filter(s => s.task_id === task.id)
                  .sort((a, b) => {
                    if (a.review_status === 'approved') return -1;
                    if (b.review_status === 'approved') return 1;
                    return 0;
                  })[0];

                if (sub) {
                   if (sub.review_status === 'approved') return { ...task, status: 'completed' };
                   if (sub.review_status === 'pending') return { ...task, status: 'in review' };
                   if (sub.review_status === 'rejected') return { ...task, status: 'rejected' };
                }
                return task;
             });
             setTasks(updatedTasks);
           }
        } catch (e) { console.error("Tasks load failed"); }

        // Filter approved submissions into certificates
        const approvedSubmissions = allSubmissions.filter(s => s.review_status === 'approved');
        setCertificates(approvedSubmissions);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center p-6">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Try Refreshing</button>
      </div>
    );
  }

  const completedCount = certificates.length;
  const pendingCount = tasks?.filter(t => t.status !== 'completed' && t.status !== 'in review').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'Intern'}! 👋</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
              {profile?.position || 'Intern'}
            </span>
            <p className="text-blue-100 text-lg opacity-90 font-medium italic">You have {pendingCount} tasks waiting for your magic touch.</p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
           <Trophy className="h-64 w-64 rotate-12" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Rewards', value: certificates.length, icon: Award, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
            <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificates Hero */}
      {certificates.length > 0 && (
        <div className="bg-slate-900 rounded-[3rem] border border-white/5 p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/40">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Your Achievements</h2>
                <p className="text-slate-400 font-medium">Official certificates issued to your account.</p>
              </div>
            </div>
            <Link href="/intern/certificates" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-white/5">
               View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.slice(0, 2).map((cert) => (
              <div key={cert.id} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.07] transition-all">
                <div className="flex items-center gap-5">
                   <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                      <Trophy className="h-7 w-7 text-blue-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-lg">{cert.tasks?.title || "Internship Project"}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {cert.certificate_id || 'Generating...'}</p>
                   </div>
                </div>
                <Link href="/intern/certificates" className="p-4 bg-blue-600 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                   <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Tasks Section (3 columns) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Active Assignments</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full w-fit mx-auto"><Clock className="h-10 w-10 text-slate-300" /></div>
                 <p className="text-slate-500 font-medium">No tasks assigned to your profile yet.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center space-x-4">
                        <div className={`h-3 w-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' : 
                          task.status === 'in review' ? 'bg-blue-500' : 
                          'bg-orange-500 animate-pulse'
                        }`} />
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{task.title}</h4>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed font-medium">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                          task.status === 'in review' ? 'bg-blue-500/10 text-blue-500' : 
                          task.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                          'bg-orange-500/10 text-orange-500'
                        }`}>
                          {task.status}
                        </div>
                      </div>
                    </div>
                    {task.status === 'completed' ? (
                       <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600">
                         <CheckCircle2 className="h-6 w-6" />
                       </div>
                    ) : task.status === 'in review' ? (
                       <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600" title="Currently being reviewed by admin">
                         <Clock className="h-6 w-6" />
                       </div>
                    ) : (
                       <button 
                         onClick={() => window.location.href='/intern/submit'}
                         className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg"
                         title="Submit Task"
                       >
                         <FileUp className="h-6 w-6" />
                       </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-600/30">
            <h3 className="text-2xl font-black uppercase italic mb-6">Need Help?</h3>
            <p className="text-blue-100 mb-8 font-medium leading-relaxed">Check the documentation or reach out to your mentor if you're stuck on a task.</p>
            <Link href="/contact" className="inline-block px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all">
               Contact Mentor
            </Link>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">Offer Letter</h3>
              <p className="text-slate-400 mb-8 font-medium leading-relaxed">Download your official internship offer letter for your records.</p>
              <Link href="/intern/offer-letter" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                 View & Download
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <FileText className="h-32 w-32 rotate-12" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-6">Recent Activity</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                 <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Portal Account Verified</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Your intern profile is now active.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

