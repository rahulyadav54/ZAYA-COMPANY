'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Clock, CheckCircle2, AlertCircle, FileUp, Trophy, Calendar, Loader2, ArrowRight, X, Award } from 'lucide-react';
import Link from 'next/link';

export default function InternDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);

        // Fetch assigned tasks
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('intern_id', user.id)
          .order('created_at', { ascending: false });

        if (!taskError && taskData) {
          setTasks(taskData);
        }

        // Fetch approved certificates
        const { data: certData } = await supabase
          .from('submissions')
          .select('*, tasks(title)')
          .eq('intern_id', user.id)
          .eq('review_status', 'approved');
        
        if (certData) setCertificates(certData);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Intern'}! 👋</h1>
        <p className="text-blue-100 opacity-90">You have {pendingCount} pending task(s). Keep up the great work!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Completed Tasks', value: completedCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Pending Tasks', value: pendingCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Learning Score', value: '850', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificates Section (Only show if available) */}
      {certificates.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-900/20 rounded-[2.5rem] border border-blue-500/20 p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">My Certificates</h2>
              <p className="text-slate-400 font-medium">You've successfully completed these programs!</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Trophy className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{cert.tasks?.title}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Completion ID: #{cert.id.slice(0,8)}</p>
                  </div>
                </div>
                <Link 
                  href={`/intern/certificate/${cert.id}`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                  View Certificate
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-foreground">Overall Progress</h3>
          <span className="text-blue-600 font-bold">{tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-foreground">Active Tasks</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No tasks assigned yet.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="group p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'}`} />
                        <h4 className="text-lg font-black text-white tracking-tight leading-tight">{task.title}</h4>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        task.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                        {task.status}
                      </div>
                    </div>

                    <div className="relative">
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 whitespace-pre-wrap font-medium italic">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-lg">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-blue-500" />
                          Assigned: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const modal = document.getElementById(`modal-${task.id}`);
                          if (modal) modal.style.display = 'flex';
                        }}
                        className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2 group/btn"
                      >
                        Read Full Scope
                        <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Modal for Task Details */}
                  <div 
                    id={`modal-${task.id}`} 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] hidden items-center justify-center p-6 animate-in fade-in duration-300"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
                    }}
                  >
                    <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden scale-in-center">
                      <div className="p-10 space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Project Task Details</span>
                            <h2 className="text-3xl font-black text-white leading-tight">{task.title}</h2>
                          </div>
                          <button 
                            onClick={() => {
                              const modal = document.getElementById(`modal-${task.id}`);
                              if (modal) modal.style.display = 'none';
                            }}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>

                        <div className="bg-black/40 rounded-3xl p-8 max-h-[50vh] overflow-y-auto custom-scrollbar border border-white/5">
                          <div className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {task.description}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-bold text-slate-400">Published on {new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => window.location.href='/intern/submit'}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                          >
                            Proceed to Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Submit Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <h3 className="text-xl font-bold text-foreground mb-6">Submit Progress</h3>
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-center hover:border-blue-600/50 transition-colors cursor-pointer" onClick={() => window.location.href='/intern/submit'}>
            <FileUp className="h-10 w-10 text-slate-400 mx-auto mb-4" />
            <p className="font-medium text-foreground">Upload Task Deliverables</p>
            <p className="text-sm text-slate-500 mt-1">Click to go to Submission page</p>
          </div>
          <div className="mt-8 space-y-4">
            <h4 className="font-bold text-sm text-foreground">Recent Feedback</h4>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                &quot;Welcome to the portal! Check your Active Tasks to see what you should be working on. You can submit your work via the Submit Progress tool.&quot;
                <span className="block mt-1 font-bold">— Admin</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
