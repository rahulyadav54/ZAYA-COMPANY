'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  GraduationCap, 
  Code2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Search, 
  Award, 
  Loader2, 
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicPracticeHubPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');

  useEffect(() => {
    async function fetchPublicExams() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('exams')
          .select('*, exam_questions(id)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (data) setExams(data);
      } catch (err) {
        console.error('Fetch public exams notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicExams();
  }, []);

  const domains = ['ALL', ...Array.from(new Set(exams.map(e => e.domain)))];

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || e.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
          
          <div className="container mx-auto max-w-6xl relative z-10 space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/30">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Free Student Coding & Tech Skill Assessment</span>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight italic leading-tight">
                Practice & Benchmark <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">Your Coding Skills</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                Test your knowledge across Full Stack Web Engineering, Frontend Frameworks, Backend Systems, Python & AI Data Science. Open to all students & developers nationwide.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-white">Proctored Sandbox</h4>
                  <p className="text-[10px] text-slate-300">Anti-cheating environment</p>
                </div>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <Zap className="h-8 w-8 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-white">Instant Scorecard</h4>
                  <p className="text-[10px] text-slate-300">Immediate skill feedback</p>
                </div>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <Award className="h-8 w-8 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-white">Verified Badge</h4>
                  <p className="text-[10px] text-slate-300">Sharable student report</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HACKERRANK & LEETCODE INTEGRATION BANNER */}
        <section className="py-8 px-6 bg-slate-900 text-white border-y border-slate-800">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight italic">LeetCode & HackerRank Coding Benchmark</h3>
                <p className="text-xs text-slate-300 font-medium">Link your LeetCode and HackerRank profiles to automatically sync your solved problems & badges to your ZAYA Code Hub Intern Profile.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/practice/code"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Code2 className="h-4 w-4" />
                <span>Open In-House Coding Arena</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="py-10 px-6 container mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            {/* Domain Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                    selectedDomain === domain
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search practice test topic..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Exam Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Practice Tests...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">No Practice Tests Found</h3>
              <p className="text-xs text-slate-500 font-bold">Try searching for another topic or domain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
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
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">
                        FREE TEST
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                        {exam.description || 'Proctored coding skill assessment.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" /> {exam.duration_minutes} Mins
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pass Score</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {exam.passing_score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {exam.exam_questions?.length || 0} Questions
                    </span>

                    <Link
                      href={`/practice/${exam.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                    >
                      <span>Start Practice</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
