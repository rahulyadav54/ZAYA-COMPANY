'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, GitFork } from 'lucide-react';
import Image from 'next/image';

const projects = [
  {
    title: 'EduTrack Pro',
    category: 'School Software',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'A comprehensive management system for large educational institutions.',
    tech: ['Next.js', 'PostgreSQL', 'Tailwind'],
    link: '#',
  },
  {
    title: 'Zaya Fitness',
    category: 'Android App',
    image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80',
    description: 'Personalized workout tracking with AI-driven recommendations.',
    tech: ['Kotlin', 'Firebase', 'Jetpack Compose'],
    link: '#',
  },
  {
    title: 'LuxAgency UI',
    category: 'UI/UX Design',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
    description: 'Modern, high-conversion design for a creative marketing agency.',
    tech: ['Figma', 'Prototyping', 'Design System'],
    link: '#',
  },
  {
    title: 'PaySafe Wallet',
    category: 'Custom Software',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    description: 'Secure digital wallet for cryptocurrency transactions.',
    tech: ['Node.js', 'React', 'Blockchain API'],
    link: '#',
  },
];

const categories = ['All', 'Android App', 'School Software', 'UI/UX Design', 'Custom Software'];

export default function PortfolioPage() {
  const [filter, setFilter] = useState('All');

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="bg-white dark:bg-slate-950">
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Our <span className="text-blue-600">Work</span>
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto mb-12">
            Explore our latest projects across various industries. We take pride in delivering excellence.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  filter === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700 hover:border-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative"
                >
                  <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl mb-6">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="p-4 rounded-full bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                        <ExternalLink className="h-6 w-6" />
                      </button>
                      <button className="p-4 rounded-full bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                        <GitFork className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-widest">{project.category}</div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{project.title}</h3>
                      <p className="text-foreground mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((t) => (
                          <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-foreground text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
            <div>
              <div className="text-5xl font-black mb-2">150+</div>
              <div className="text-blue-100 font-medium uppercase tracking-widest text-sm">Projects Delivered</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">50+</div>
              <div className="text-blue-100 font-medium uppercase tracking-widest text-sm">Global Clients</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">12+</div>
              <div className="text-blue-100 font-medium uppercase tracking-widest text-sm">Awards Won</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">99%</div>
              <div className="text-blue-100 font-medium uppercase tracking-widest text-sm">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
