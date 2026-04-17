'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Palette, Monitor, Rocket, GraduationCap } from 'lucide-react';

const services = [
  {
    title: 'Android App Development',
    description: 'High-performance native and cross-platform mobile apps built with the latest technologies.',
    icon: Smartphone,
    color: 'bg-blue-600',
  },
  {
    title: 'Website Development',
    description: 'Fast, responsive, SEO-optimized websites using React, Next.js, and modern frameworks.',
    icon: Globe,
    color: 'bg-indigo-600',
  },
  {
    title: 'UI/UX Design',
    description: 'Intuitive, beautiful user interfaces and experiences that delight and convert users.',
    icon: Palette,
    color: 'bg-purple-600',
  },
  {
    title: 'School Software',
    description: 'Comprehensive management solutions for educational institutions and e-learning platforms.',
    icon: Monitor,
    color: 'bg-emerald-600',
  },
  {
    title: 'Custom Software',
    description: 'Tailored business solutions that streamline your operations and accelerate growth.',
    icon: Rocket,
    color: 'bg-orange-600',
  },
  {
    title: 'Internship Programs',
    description: 'Hands-on training with real projects, mentorship, and career-ready certifications.',
    icon: GraduationCap,
    color: 'bg-rose-600',
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            What We <span className="text-blue-600">Offer</span>
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">
            From concept to deployment, we provide end-to-end solutions tailored to your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <service.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
