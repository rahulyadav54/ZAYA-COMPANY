'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Palette, Monitor, Rocket, GraduationCap, Cpu, ShieldCheck } from 'lucide-react';

const services = [
  {
    title: 'Mobile App Engineering',
    description: 'High-performance Android and cross-platform mobile apps engineered with native efficiency and sleek user experiences.',
    icon: Smartphone,
    iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Web Application Platforms',
    description: 'Fast, responsive, SEO-optimized web products and dashboards built with React, Next.js, and cloud backends.',
    icon: Globe,
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Artificial Intelligence & Automation',
    description: 'AI assistants, natural language processing, intelligent voice interaction, and automated workflow systems.',
    icon: Cpu,
    iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'UI/UX Product Design',
    description: 'User research, wireframing, interactive prototyping, and accessible digital design systems tailored for conversions.',
    icon: Palette,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Educational & Healthcare Software',
    description: 'Multi-panel school administration platforms, telemedicine consultation portals, and interactive e-learning solutions.',
    icon: Monitor,
    iconBg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Hands-on Technical Internships',
    description: 'Industry-level mentorship, real-world project engineering, and verifiable career certification drives for aspiring developers.',
    icon: GraduationCap,
    iconBg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            OUR CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            End-to-End Digital Engineering
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            From initial product architecture to cloud deployment, we deliver reliable and scalable software solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 sm:p-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center mb-6 transition-transform`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
