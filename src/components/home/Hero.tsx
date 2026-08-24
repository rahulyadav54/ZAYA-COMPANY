'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Stethoscope, GraduationCap, ShieldAlert, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Radial Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[32rem] bg-gradient-to-b from-blue-600/5 via-indigo-600/5 to-transparent blur-3xl -z-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left space-y-6 max-w-2xl"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>TECHNOLOGY & PRODUCT DEVELOPMENT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Engineered for <br />
              <span className="text-blue-600 dark:text-blue-400">
                Real-World Impact
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>ZAYA CODE HUB</strong> develops AI-powered software, healthcare systems, school platforms, emergency response networks, and custom digital solutions for organizations nationwide.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/portfolio"
                className="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                href="/careers"
                className="px-8 py-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-base border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Career Opportunities</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>

            {/* Micro Specs Bar */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>6+ Active Flagship Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Verifiable Internships</span>
              </div>
            </div>
          </motion.div>

          {/* Right Brand & Product Badges Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto"
          >
            <div className="relative aspect-square w-full">
              {/* Central Glowing Shield */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-600/5 via-indigo-600/5 to-purple-600/5 border border-blue-500/10 flex items-center justify-center shadow-xl overflow-hidden">
                <div className="relative w-[65%] h-[65%]">
                  <Image 
                    src="/logo.png" 
                    alt="ZAYA CODE HUB Official Logo" 
                    fill
                    unoptimized
                    className="object-contain drop-shadow-lg" 
                  />
                </div>
              </div>

              {/* Floating Product Pills */}
              <div className="absolute top-2 left-0 sm:top-4 sm:left-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white">AI ZAYA</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">AI Assistant</p>
                </div>
              </div>

              <div className="absolute top-4 right-0 sm:top-8 sm:right-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white">NepCare</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">Telemedicine</p>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 sm:bottom-12 sm:left-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white">ZAYA School</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">Management Platform</p>
                </div>
              </div>

              <div className="absolute bottom-2 right-0 sm:bottom-6 sm:right-6 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white">SurakshaNep</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">Public Safety</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
