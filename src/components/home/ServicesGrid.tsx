'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Cpu, GraduationCap, Globe, Palette, Smartphone, Monitor } from 'lucide-react';

const services = [
  { title: 'Web platforms', description: 'Fast, responsive websites, web applications, and dashboards made for your customers and team.', icon: Globe, number: '01' },
  { title: 'Mobile applications', description: 'Useful Android and cross-platform apps, shaped around the way people actually work.', icon: Smartphone, number: '02' },
  { title: 'AI & automation', description: 'AI assistants and practical workflow automation that help simplify everyday tasks.', icon: Cpu, number: '03' },
  { title: 'Product design', description: 'Research, clear user flows, and accessible interfaces that make complex tools easier to use.', icon: Palette, number: '04' },
  { title: 'Business software', description: 'Purpose-built platforms for education, healthcare, commerce, and operations.', icon: Monitor, number: '05' },
  { title: 'Learning & internships', description: 'Programming resources and hands-on opportunities for people growing their skills.', icon: GraduationCap, number: '06' },
];

export default function ServicesGrid() {
  return (
    <section className="bg-white py-20 dark:bg-slate-950 sm:py-24">
      <div className="container mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">What we do</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">Good technology should feel simple.</h2>
          </div>
          <div className="max-w-md">
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">From the first sketch to a reliable launch, we bring product thinking and engineering together.</p>
            <Link href="/services" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Explore our services <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-2 lg:grid-cols-3 gap-px">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="group min-h-56 bg-white p-6 transition-colors hover:bg-blue-50/60 dark:bg-slate-950 dark:hover:bg-slate-900 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-950 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white"><service.icon className="h-5 w-5" /></div>
                <span className="font-mono text-xs text-slate-400 dark:text-slate-600">{service.number}</span>
              </div>
              <h3 className="mt-7 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{service.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
