'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alice Johnson',
    role: 'CTO, TechNova',
    text: "ZAYA CODE HUB transformed our mobile strategy. Their Android team delivered a flawless app ahead of schedule.",
    rating: 5,
  },
  {
    name: 'Mark Patel',
    role: 'Founder, GreenBiz',
    text: "The custom software solution streamlined our operations, saving us 30% in overhead costs.",
    rating: 5,
  },
  {
    name: 'Sofia Rivera',
    role: 'Product Lead, CreatiVerse',
    text: "Their UI/UX designs are both beautiful and intuitive – our users love the new experience.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
          What Our Partners Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-8 bg-white dark:bg-slate-950 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Quote className="h-6 w-6 text-blue-600 mb-4" />
              <p className="text-slate-800 dark:text-slate-200 mb-6 leading-relaxed">{t.text}</p>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-5 w-5 ${idx < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
