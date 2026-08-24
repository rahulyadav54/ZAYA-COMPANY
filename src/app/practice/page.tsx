'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { practiceSlug } from '@/lib/practiceSlug';
import Link from 'next/link';
import { 
  GraduationCap, 
  Code2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
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
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<{
    xp_points: number;
    streak_days: number;
    tests_completed: number;
    coding_problems_solved: number;
    badges: string[];
  }>({
    xp_points: 0,
    streak_days: 0,
    tests_completed: 0,
    coding_problems_solved: 0,
    badges: []
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: stats } = await supabase
            .from('user_practice_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (stats) {
            setUserStats({
              xp_points: stats.xp_points || 0,
              streak_days: stats.streak_days || 0,
              tests_completed: stats.tests_completed || 0,
              coding_problems_solved: stats.coding_problems_solved || 0,
              badges: Array.isArray(stats.badges) ? stats.badges : []
            });
          }
        } else {
          setCurrentUser(null);
        }

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
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zaya_intern_session');
    }
    setCurrentUser(null);
    setUserStats({ xp_points: 0, streak_days: 0, tests_completed: 0, coding_problems_solved: 0, badges: [] });
  };

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
        <section className="relative py-20 px-6 bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
          
          <div className="container mx-auto max-w-6xl relative z-10 space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium uppercase tracking-wider rounded-full">
              <GraduationCap className="h-4 w-4" />
              <span>Free Student Coding & Tech Skill Assessment</span>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Practice & Benchmark <span className="text-blue-600 dark:text-blue-400">Your Coding Skills</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                Test your knowledge across Full Stack Web Engineering, Frontend Frameworks, Backend Systems, Python & AI Data Science. Open to all students & developers nationwide.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
              <div className="p-4 bg-white/5 border border-slate-700 rounded-lg flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white">Proctored Sandbox</h4>
                  <p className="text-[10px] text-slate-300">Anti-cheating environment</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-slate-700 rounded-lg flex items-center gap-3">
                <Zap className="h-8 w-8 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white">Instant Scorecard</h4>
                  <p className="text-[10px] text-slate-300">Immediate skill feedback</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-slate-700 rounded-lg flex items-center gap-3">
                <Award className="h-8 w-8 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white">Verified Badge</h4>
                  <p className="text-[10px] text-slate-300">Sharable student report</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GAMIFIED STUDENT PERFORMANCE TRACKER */}
        <section className="py-8 px-6 bg-slate-900 border-b border-slate-800 text-white">
          <div className="container mx-auto max-w-6xl">
            {currentUser ? (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-medium rounded-full uppercase tracking-widest border border-amber-500/30">
                        LEVEL {Math.floor(userStats.xp_points / 250) + 1} ARCHITECT
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-medium rounded-full uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1">
                        🔥 {userStats.streak_days} DAY STREAK
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-xl font-semibold uppercase tracking-tight text-white">
                        Welcome Back, {currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}!
                      </h3>
                      <button
                        onClick={handleLogout}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[9px] font-medium rounded-lg uppercase tracking-wider border border-red-500/30 transition-all ml-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                  <div className="p-3 bg-white/5 rounded-lg border border-slate-700 text-center">
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Total XP</p>
                    <p className="text-lg font-semibold text-amber-400 font-mono">{userStats.xp_points} ⚡</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-slate-700 text-center">
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Tests Passed</p>
                    <p className="text-lg font-semibold text-emerald-400 font-mono">{userStats.tests_completed}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-slate-700 text-center">
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Coding Solved</p>
                    <p className="text-lg font-semibold text-cyan-400 font-mono">{userStats.coding_problems_solved}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-slate-700 text-center">
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Badges</p>
                    <p className="text-lg font-semibold text-indigo-300 font-mono">🏆 {userStats.badges.length}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">Login First to Track Your Performance & Earn Badges!</h3>
                    <p className="text-xs text-slate-300 font-medium">Log in to save solved coding problems, track daily streaks, earn XP points, and generate verified skill certificates.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Login / Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* HACKERRANK & LEETCODE INTEGRATION BANNER */}
        <section className="py-8 px-6 bg-slate-900 text-white border-y border-slate-800">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">LeetCode & HackerRank Coding Benchmark</h3>
                <p className="text-xs text-slate-300 font-medium">Link your LeetCode and HackerRank profiles to automatically sync your solved problems & badges to your ZAYA Code Hub Intern Profile.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/practice/code"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
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
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    selectedDomain === domain
                      ? 'bg-blue-600 text-white'
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
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Exam Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-xs font-medium text-slate-400">Loading Practice Tests...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No Practice Tests Found</h3>
              <p className="text-xs text-slate-500 font-medium">Try searching for another topic or domain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-medium rounded-full border border-blue-200 dark:border-blue-800">
                        {exam.domain}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-medium rounded-full border border-emerald-200 dark:border-emerald-800">
                        FREE TEST
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                        {exam.description || 'Proctored coding skill assessment.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider block">Duration</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" /> {exam.duration_minutes} Mins
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider block">Pass Score</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {exam.passing_score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-400">
                      {exam.exam_questions?.length || 0} Questions
                    </span>

                    <Link
                      href={`/practice/${practiceSlug(exam.title)}`}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
