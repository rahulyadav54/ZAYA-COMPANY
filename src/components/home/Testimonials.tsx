'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, MapPin, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: 'Aarav Sharma',
    role: 'Senior Product Manager, TechVeda',
    location: 'Bengaluru, Karnataka',
    text: 'ZAYA CODE HUB engineered our mobile application and web portal with exceptional quality. Their engineering team delivered clean, high-performance code ahead of schedule.',
    rating: 5,
    initials: 'AS',
    gradient: 'from-blue-600 to-indigo-600'
  },
  {
    name: 'Priya Verma',
    role: 'Former Web Developer Intern • Placed at TCS',
    location: 'Pune, Maharashtra',
    text: 'My internship at ZAYA CODE HUB provided real hands-on experience on live products. The direct mentorship and verifiable certificate played a huge role in landing my software engineering offer.',
    rating: 5,
    initials: 'PV',
    gradient: 'from-purple-600 to-indigo-600'
  },
  {
    name: 'Rohan Gupta',
    role: 'Founder & CEO, AgriSmart India',
    location: 'New Delhi',
    text: 'The custom marketplace software developed by ZAYA CODE HUB streamlined our farmer-to-consumer operations. Highly professional engineers who truly understand digital transformation.',
    rating: 5,
    initials: 'RG',
    gradient: 'from-emerald-600 to-teal-600'
  },
  {
    name: 'Sneha Reddy',
    role: 'Former UI/UX Design Intern • Placed at Infosys',
    location: 'Hyderabad, Telangana',
    text: 'Building interfaces for real products like AI ZAYA during my internship boosted my portfolio immensely. ZAYA CODE HUB is the best learning ground for young software developers.',
    rating: 5,
    initials: 'SR',
    gradient: 'from-rose-600 to-pink-600'
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            TESTIMONIALS & REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            What Our Partners & Alumni Say
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Real feedback from client organizations and successful internship alumni across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${t.gradient} text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                        {t.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <Quote className="h-6 w-6 text-slate-300 dark:text-slate-700 shrink-0" />
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                  <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">5.0</span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
