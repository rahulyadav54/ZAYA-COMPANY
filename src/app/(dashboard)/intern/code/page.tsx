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
import { BUILTIN_CODING_PROBLEMS } from '@/app/practice/code/page';

export default function InternCodingArenaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(BUILTIN_CODING_PROBLEMS.map(p => p.category)))];

  const filteredProblems = BUILTIN_CODING_PROBLEMS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'ALL' || p.difficulty.toUpperCase() === selectedDifficulty.toUpperCase();
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

    return matchesSearch && matchesDiff && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 md:p-10 rounded-[2.5rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/30">
            <Zap className="h-3.5 w-3.5" />
            <span>Interactive Algorithmic Execution Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">Coding Skill Arena</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
            Sharpen your algorithmic problem-solving skills inside the Intern Portal. Solve LeetCode & HackerRank style challenges in JavaScript, Python, C++, and Java to earn +100 XP per problem!
          </p>
        </div>

        <div className="z-10 shrink-0">
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex items-center gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-amber-400 font-mono">20+</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Challenges</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-black text-cyan-400 font-mono">4</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Languages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search problem title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Topics' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((prob) => {
          const isEasy = prob.difficulty === 'Easy';
          const isMedium = prob.difficulty === 'Medium';

          return (
            <motion.div
              key={prob.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 flex flex-col justify-between space-y-6 hover:border-cyan-500/50 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    isEasy 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : isMedium
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}>
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    +100 XP
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-cyan-600 transition-colors">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                    {prob.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 uppercase tracking-wider block text-[9px]">Topic:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">{prob.category}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
                  <span>JS</span> • <span>Py</span> • <span>C++</span> • <span>Java</span>
                </div>

                <Link
                  href={`/intern/code/${prob.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Solve Challenge</span>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
