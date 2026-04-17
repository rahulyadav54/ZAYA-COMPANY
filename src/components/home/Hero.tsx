'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Layout } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-8 border border-blue-100 dark:border-blue-800">
              🚀 Building the Future of Technology
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground mb-8 leading-tight tracking-tight">
              We Build
              <br />
              <span className="text-blue-600">Digital Excellence</span>
            </h1>
            <p className="text-xl text-foreground mb-10 leading-relaxed max-w-xl font-bold">
              ZAYA CODE HUB crafts premium software solutions, mobile apps, and stunning digital experiences that drive real business results.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                href="/careers"
                className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center"
              >
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main Circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-2xl shadow-blue-600/30 flex items-center justify-center overflow-hidden border-4 border-white/10 p-12">
                <Image 
                  src="/logo.png" 
                  alt="Zaya Code Hub Logo" 
                  fill
                  className="object-contain" 
                />
              </div>
              {/* Floating Cards - Desktop Only */}
              <div className="hidden sm:block absolute top-0 right-8 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 animate-float">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <p className="text-xs font-bold mt-2 text-slate-800 dark:text-white">Mobile Apps</p>
              </div>
              <div className="hidden sm:block absolute bottom-8 left-0 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 animate-float" style={{ animationDelay: '1.5s' }}>
                <Layout className="h-8 w-8 text-indigo-600" />
                <p className="text-xs font-bold mt-2 text-slate-800 dark:text-white">Web Design</p>
              </div>
              {/* Stats Badge - Desktop Only */}
              <div className="hidden sm:block absolute bottom-0 right-0 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="text-2xl font-black text-blue-600">150+</div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Projects Done</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
