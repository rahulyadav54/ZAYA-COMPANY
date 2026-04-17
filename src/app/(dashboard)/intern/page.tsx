'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Clock, CheckCircle2, AlertCircle, FileUp, Trophy, Calendar, Loader2 } from 'lucide-react';

export default function InternDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
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
                <div key={task.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`mt-1 h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div>
                      <h4 className="font-bold text-foreground">{task.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                      <div className="flex items-center text-xs text-foreground mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        Assigned: {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {task.status}
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
