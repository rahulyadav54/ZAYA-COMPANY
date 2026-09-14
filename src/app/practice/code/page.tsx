'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Zap, 
  Cpu, 
  Flame,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BUILTIN_CODING_PROBLEMS } from '@/lib/builtinCodingProblems';

export default function PublicCodingArenaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(BUILTIN_CODING_PROBLEMS.map(p => p.category)))];

  const filteredProblems = BUILTIN_CODING_PROBLEMS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <main className="flex-1">
         {/* Header Hero Banner */}
         <section className="relative py-16 px-6 bg-slate-900 text-white overflow-hidden border-b border-slate-800">
           <div className="container mx-auto max-w-6xl space-y-6 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium uppercase tracking-wider rounded-full">
               <Terminal className="h-4 w-4 text-blue-400" />
               <span>In-House Interactive Coding Arena</span>
             </div>

             <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
               Solve Real LeetCode & HackerRank <span className="text-blue-400">Algorithmic Challenges</span>
             </h1>
             <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
               Practice Data Structures, Algorithms, Dynamic Programming, and SQL directly inside the ZAYA CODE HUB browser IDE. Instant execution worker and automated test case runner.
             </p>
           </div>
         </section>

        {/* Filter Controls */}
        <section className="py-10 px-6 container mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 mr-2">Difficulty:</span>
              {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search coding problem..."
                 className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:border-blue-600 outline-none transition-all"
               />
            </div>
          </div>

          {/* Problem Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="p-5 pl-8">Status</th>
                    <th className="p-5">Title</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Difficulty</th>
                    <th className="p-5 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProblems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-5 pl-8">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      </td>
                      <td className="p-5 font-semibold text-slate-900 dark:text-white text-sm">
                        {p.title}
                      </td>
                      <td className="p-5 text-slate-500 dark:text-slate-400">
                        {p.category}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${
                          p.difficulty === 'Easy'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : p.difficulty === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <Link
                          href={`/practice/code/${p.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Solve Challenge</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
