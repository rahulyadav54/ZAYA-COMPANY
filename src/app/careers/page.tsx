'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Code, Palette, Smartphone, ChevronRight, X, Loader2 } from 'lucide-react';
import ApplicationForm from '@/components/careers/ApplicationForm';
import { supabase } from '@/lib/supabaseClient';

const getIconForCategory = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'design': return Palette;
    case 'tech': return Code;
    case 'marketing': return Smartphone;
    default: return Briefcase;
  }
};

export default function CareersPage() {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setPositions(data);
      }
      setIsLoading(false);
    };
    fetchPositions();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Header */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Join the <span className="text-blue-600">Future</span> of Tech
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            We&apos;re looking for passionate individuals who want to learn, grow, and make an impact. Explore our opportunities below.
          </p>
        </div>
      </section>

      {/* Positions List */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-bold">Loading opportunities...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-400">No open positions right now</h3>
                <p className="text-slate-500 mt-2">Check back later or follow our social media for updates!</p>
              </div>
            ) : (
              positions.map((pos) => {
                const Icon = getIconForCategory(pos.category);
                return (
                  <motion.div
                    key={pos.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-start space-x-6">
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                            {pos.title}
                          </h3>
                          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {pos.type}
                          </span>
                        </div>
                        <p className="text-foreground max-w-md">
                          {pos.description}
                        </p>
                        <div className="mt-4 flex items-center text-sm text-foreground">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {pos.location}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPosition(pos.title)}
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      Apply Now <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPosition(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Application</h2>
                    <p className="text-blue-600 font-semibold">{selectedPosition}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <ApplicationForm 
                  position={selectedPosition} 
                  onSuccess={() => setSelectedPosition(null)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
