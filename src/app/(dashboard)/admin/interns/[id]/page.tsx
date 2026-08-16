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
      if (!id) return;
      setIsLoading(true);
      
      const targetId = Array.isArray(id) ? id[0] : id;
      let foundIntern: any = null;

      // 1. Fetch profile by exact UUID id
      try {
        const { data: profById } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();
        if (profById) foundIntern = profById;
      } catch (e) {
        console.warn('Profile fetch by id error:', e);
      }

      // 2. Fetch profile by intern_id or email
      if (!foundIntern) {
        try {
          const { data: profByOther } = await supabase
            .from('profiles')
            .select('*')
            .or(`intern_id.ilike.${targetId},email.ilike.${targetId}`)
            .maybeSingle();
          if (profByOther) foundIntern = profByOther;
        } catch (e) {
          console.warn('Profile fetch by intern_id/email error:', e);
        }
      }

      // 3. Fetch from applications table if not in profiles
      if (!foundIntern) {
        try {
          const { data: appData } = await supabase
            .from('applications')
            .select('*')
            .or(`intern_id.ilike.${targetId},email.ilike.${targetId}`)
            .maybeSingle();
          if (appData) {
            foundIntern = {
              id: appData.id || appData.intern_id,
              full_name: appData.full_name,
              email: appData.email,
              position: appData.position || 'Web Designer Intern',
              created_at: appData.created_at || appData.applied_at || new Date().toISOString(),
              intern_id: appData.intern_id
            };
          }
        } catch (e) {
          console.warn('Applications fetch error:', e);
        }
      }

      setIntern(foundIntern);

      if (foundIntern) {
        const queryId = foundIntern.id || foundIntern.intern_id || targetId;

        // Fetch tasks
        try {
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .or(`intern_id.eq.${queryId},intern_id.eq.${foundIntern.email || ''}`)
            .order('created_at', { ascending: false });
          if (taskData) setTasks(taskData);
        } catch (e) {
          console.warn('Task fetch error:', e);
        }

        // Fetch submissions
        try {
          const { data: subData } = await supabase
            .from('submissions')
            .select('*')
            .or(`intern_id.eq.${queryId},intern_id.eq.${foundIntern.email || ''}`)
            .order('submitted_at', { ascending: false });
          if (subData) setSubmissions(subData);
        } catch (e) {
          console.warn('Submissions fetch error:', e);
        }
      }

      setIsLoading(false);
    }
    
    fetchInternData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Intern Profile...</p>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto opacity-50">
          <User className="h-12 w-12 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Intern Not Found</h2>
          <p className="text-sm text-slate-500 font-medium">No record matching this ID was found in profiles or applications.</p>
        </div>
        <Link href="/admin/interns" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg">
          <ArrowLeft className="h-4 w-4" /> Return to Interns List
        </Link>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate average score
  const gradedSubs = submissions.filter(s => s.score !== null && s.score !== undefined);
  const avgScore = gradedSubs.length > 0 
    ? Math.round(gradedSubs.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedSubs.length) 
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <Link href="/admin/interns" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Interns
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-4xl shrink-0 shadow-lg shadow-blue-600/20">
          {intern.full_name?.charAt(0) || 'I'}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic flex items-center justify-center md:justify-start gap-3">
              {intern.full_name}
            </h1>
            <span className="px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-500/20 w-fit mx-auto md:mx-0">
              Active Intern
            </span>
          </div>
          <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{intern.position || 'Web Designer Intern'}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400 pt-2">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-blue-500" /> {intern.email}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-indigo-500" /> Joined: {new Date(intern.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <FileText className="h-5 w-5" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">Total Tasks</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalTasks}</p>
        </div>
        <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">Completion Rate</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{completionRate}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
        <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 text-orange-600 mb-2">
            <Clock className="h-5 w-5" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">Pending Tasks</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{pendingTasks}</p>
        </div>
        <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-black text-xs uppercase tracking-widest text-slate-400">Avg Score</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{avgScore > 0 ? `${avgScore}/100` : 'N/A'}</p>
        </div>
      </div>

      {/* Assigned Tasks List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="p-7 px-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Task History</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No tasks assigned yet.</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="p-6 px-8 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{task.title}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1">Assigned: {new Date(task.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  task.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                  task.status === 'submitted' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                  'bg-orange-500/10 text-orange-600 border border-orange-500/20'
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
