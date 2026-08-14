'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Sparkles, 
  Cpu, 
  GraduationCap, 
  Stethoscope, 
  ShieldAlert, 
  ShoppingBag, 
  Code2, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  FileText, 
  Palette, 
  Terminal, 
  CheckSquare, 
  Rocket, 
  RefreshCw, 
  Zap, 
  Layers, 
  Users2, 
  ShieldCheck, 
  Award,
  Globe
} from 'lucide-react';
import TeamSection from '@/components/home/TeamSection';

export default function AboutPage() {
  const scrollToTeam = () => {
    document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const domains = [
    { title: "Artificial Intelligence", icon: Cpu, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Education", icon: GraduationCap, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { title: "Healthcare", icon: Stethoscope, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Emergency & Public Safety", icon: ShieldAlert, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { title: "E-commerce & Local Markets", icon: ShoppingBag, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Business Software & Automation", icon: Code2, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  ];

  const devApproach = [
    { num: "01", step: "Discover", desc: "Understand the client's or user's problem and core goals.", icon: Compass },
    { num: "02", step: "Plan", desc: "Define product requirements, architecture, and user experience.", icon: FileText },
    { num: "03", step: "Design", desc: "Create modern, accessible, and intuitive user interfaces.", icon: Palette },
    { num: "04", step: "Develop", desc: "Build scalable software and implement required functionality.", icon: Terminal },
    { num: "05", step: "Test", desc: "Test usability, responsiveness, performance, and reliability.", icon: CheckSquare },
    { num: "06", step: "Launch", desc: "Deploy the product and make it available to users.", icon: Rocket },
    { num: "07", step: "Improve", desc: "Continuously improve the product based on feedback.", icon: RefreshCw },
  ];

  const whyChooseUs = [
    { title: "Innovation", desc: "We focus on building modern and innovative digital solutions.", icon: Sparkles },
    { title: "Real-World Problem Solving", desc: "Our products are designed around practical problems and user needs.", icon: Target },
    { title: "AI & Intelligent Products", desc: "We explore artificial intelligence to create smarter digital experiences.", icon: Cpu },
    { title: "User-Centered Design", desc: "We focus on simple, intuitive, and accessible user experiences.", icon: Eye },
    { title: "Multi-Domain Development", desc: "Our projects cover education, healthcare, public safety, e-commerce, AI, and business software.", icon: Layers },
    { title: "Continuous Innovation", desc: "We continuously explore new ideas, technologies, and digital solutions.", icon: RefreshCw },
  ];

  const customServices = [
    "Website Development",
    "Mobile Application Development",
    "Custom Software Solutions",
    "UI/UX Design",
    "Business Applications",
    "Educational Platforms",
    "AI-Powered Applications",
    "Automation Solutions",
    "Dashboard Development",
    "Digital Transformation Solutions"
  ];

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* SECTION 1 — COMPANY INTRODUCTION */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>ABOUT ZAYA CODE HUB</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
              Transforming Ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Modern Digital Products</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
              <strong>ZAYA CODE HUB</strong> is a technology and software development company focused on building innovative digital products, AI-powered applications, mobile apps, web applications, educational platforms, healthcare solutions, public safety systems, and custom software.
            </p>

            {/* Core Domain Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              {domains.map((dom, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${dom.bg} shrink-0`}>
                    <dom.icon className={`h-5 w-5 ${dom.color}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {dom.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION — VISION & MISSION */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 rounded-2xl bg-blue-600 text-white w-fit mb-6 shadow-md">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Company Vision</h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed italic">
                &ldquo;Our vision is to build meaningful digital products that use technology and artificial intelligence to solve real-world problems, improve accessibility, and create better experiences for people.&rdquo;
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 rounded-2xl bg-indigo-600 text-white w-fit mb-6 shadow-md">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Company Mission</h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed italic">
                &ldquo;Our mission is to transform ideas into reliable, useful, and innovative digital products while making advanced technology more accessible to businesses, institutions, and everyday users.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION — PORTFOLIO OVERVIEW CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Explore Our Real Products & Solutions</h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Discover our flagship AI products, healthcare applications, school management platforms, educational eBooks, emergency response systems, and local e-commerce marketplaces.
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <span>View Full Product Portfolio</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* SECTION — CUSTOM DIGITAL SOLUTIONS */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              TAILORED ENGINEERING
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
              Custom Digital Solutions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
              ZAYA CODE HUB also develops customized digital products for organizations, businesses, educational institutions, and startups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customServices.map((service, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — OUR DEVELOPMENT APPROACH */}
      <section className="py-20 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            ENGINEERING METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
            Our Development Approach
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            We follow a structured 7-step process to ensure every digital product is reliable, functional, and user-friendly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {devApproach.map((step, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    {step.num}
                  </span>
                  <step.icon className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.step}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION — WHY ZAYA CODE HUB */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Why Choose ZAYA CODE HUB?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              The core principles that drive our engineering team and digital products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-fit mb-6">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-4">
              <Users2 className="h-4 w-4" />
              <span>LEADERSHIP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
              Engineering Leadership
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Our team consists of passionate software engineers, product architects, and designers committed to building meaningful technology.
            </p>

            <div className="flex items-center space-x-4 mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-blue-600 shadow-md relative shrink-0">
                <Image src="/ceo.png" alt="Rahul Kumar Yadav" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white uppercase tracking-tight">RAHUL KUMAR YADAV</h4>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">CEO / FOUNDER</p>
              </div>
            </div>

            <button 
              onClick={scrollToTeam}
              className="px-7 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Users2 className="h-4 w-4" />
              <span>View Product Team</span>
            </button>
          </div>

          <div className="flex-1 relative w-full max-w-sm sm:max-w-md">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 relative">
              <Image src="/ceo.png" alt="Rahul Kumar Yadav - CEO of ZAYA CODE HUB" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">6+</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Flagship Products</div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Team Grid */}
      <TeamSection />
    </div>
  );
}
