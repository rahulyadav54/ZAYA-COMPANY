'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { 
  User, Mail, Calendar, CheckCircle2, Clock, AlertCircle, 
  TrendingUp, FileText, Loader2, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function InternProfilePage() {
  const { id } = useParams();
  const [intern, setIntern] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInternData() {
      setIsLoading(true);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (profileData) setIntern(profileData);

      // Fetch tasks
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('intern_id', id)
        .order('created_at', { ascending: false });
        
      if (taskData) setTasks(taskData);

      // Fetch submissions
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('intern_id', id)
        .order('submitted_at', { ascending: false });
        
      if (subData) setSubmissions(subData);

      setIsLoading(false);
    }
    
    if (id) {
      fetchInternData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!intern) {
    return <div className="text-center py-12">Intern not found.</div>;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate average score
  const gradedSubs = submissions.filter(s => s.score !== null);
  const avgScore = gradedSubs.length > 0 
    ? Math.round(gradedSubs.reduce((acc, curr) => acc + curr.score, 0) / gradedSubs.length) 
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link href="/admin/interns" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Interns
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-4xl shrink-0">
          {intern.full_name?.charAt(0) || 'I'}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center md:justify-start gap-3">
            {intern.full_name}
            <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 text-xs rounded-full uppercase tracking-wider font-bold">Active</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {intern.email}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined: {new Date(intern.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold text-sm text-foreground">Total Tasks</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalTasks}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold text-sm text-foreground">Completion Rate</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-orange-600 mb-2">
            <Clock className="h-5 w-5" />
            <span className="font-semibold text-sm text-foreground">Pending Tasks</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{pendingTasks}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold text-sm text-foreground">Avg Score</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{avgScore > 0 ? `${avgScore}/100` : 'N/A'}</p>
        </div>
      </div>

      {/* Assigned Tasks List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-foreground">Task History</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No tasks assigned yet.</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">{task.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">Assigned: {new Date(task.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  task.status === 'completed' ? 'bg-green-100 text-green-600' :
                  task.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {task.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
