'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  GraduationCap, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Play, 
  Award, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InternExamsOverviewPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { getActiveUser } = await import('@/lib/getActiveUser');
        const activeUser = await getActiveUser();
        if (activeUser) {
          setUser(activeUser);

          // Fetch active exams
          const { data: examData } = await supabase
            .from('exams')
            .select('*, exam_questions(id)')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (examData) setExams(examData);

          // Fetch intern's past submissions
          const { data: subData } = await supabase
            .from('exam_submissions')
            .select('*')
            .or(`intern_id.eq.${activeUser.id},intern_id.eq.${activeUser.email || ''}`)
            .order('submitted_at', { ascending: false });

          if (subData) setSubmissions(subData);
        }
      } catch (err) {
        console.error('Load exams notice:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 md:p-10 rounded-[2.5rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Anti-Cheating Environment Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">Proctored Examinations</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
            Take your official domain qualification tests under secured proctored conditions. Fullscreen lock, tab switch detection, and anti-copy enforcement are active during all tests.
          </p>
        </div>
        <div className="z-10 shrink-0">
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex items-center gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-white">{submissions.filter(s => s.passed).length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Passed Tests</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-black text-blue-400">{exams.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Exams */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span>Assigned Proctored Examinations</span>
        </h2>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-800 dark:text-white uppercase">No Exams Available</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">Check back soon for new assigned tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const userSubmissions = submissions.filter(s => s.exam_id === exam.id);
              const lastAttempt = userSubmissions[0];
              const isPassed = userSubmissions.some(s => s.passed);

              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-blue-500/50 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                        {exam.domain}
                      </span>
                      {isPassed ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                        </span>
                      ) : lastAttempt ? (
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border flex items-center gap-1 ${
                          lastAttempt.status === 'disqualified'
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}>
                          <X className="h-3.5 w-3.5" /> {lastAttempt.status === 'disqualified' ? 'DISQUALIFIED' : 'FAILED'}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                        {exam.description || 'Proctored online test.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" /> {exam.duration_minutes} Mins
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Passing Score</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {exam.passing_score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Max Strikes</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {exam.max_violations} Allowed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {exam.exam_questions?.length || 0} Questions
                    </span>

                    <Link
                      href={`/intern/exams/${exam.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>{isPassed ? 'Retake Exam' : lastAttempt ? 'Retry Test' : 'Start Exam'}</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
