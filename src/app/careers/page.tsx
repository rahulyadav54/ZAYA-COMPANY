'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Code, 
  Palette, 
  Smartphone, 
  ChevronRight, 
  X, 
  Loader2, 
  Eye, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
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

// Helper to truncate text for card preview
const getShortPreview = (text: string, maxLength: number = 130) => {
  if (!text) return '';
  // Remove section titles if combined
  const cleanText = text.replace(/Description:|Responsibilities:|Requirements:|What You Will Gain:/gi, '').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};

// Helper to format full description into clean structured sections
const parseDescriptionSections = (text: string) => {
  if (!text) return { overview: '', sections: [] };

  const sections: { title: string; content: string[] }[] = [];
  
  // Try splitting by keywords
  const keywords = ['Responsibilities:', 'Requirements:', 'What You Will Gain:', 'Duration:'];
  let remainingText = text;
  
  // Extract overview (part before first major keyword)
  let overview = remainingText;
  const firstKeywordIdx = Math.min(
    ...keywords.map(k => remainingText.indexOf(k)).filter(idx => idx !== -1)
  );

  if (firstKeywordIdx !== Infinity && firstKeywordIdx !== -1) {
    overview = remainingText.substring(0, firstKeywordIdx).replace(/Description:/i, '').trim();
    remainingText = remainingText.substring(firstKeywordIdx);
  }

  // Split sections
  const regex = /(Responsibilities:|Requirements:|What You Will Gain:|Duration:)/gi;
  const parts = remainingText.split(regex).filter(Boolean);

  for (let i = 0; i < parts.length; i += 2) {
    const title = parts[i]?.replace(':', '').trim();
    const contentText = parts[i + 1]?.trim() || '';
    if (title && contentText) {
      // Split sentences or bullet points
      const items = contentText
        .split(/(?<=\.)\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 3);

      sections.push({ title, content: items.length > 0 ? items : [contentText] });
    }
  }

  return { overview: overview || text, sections };
};

export default function CareersPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modals
  const [detailPosition, setDetailPosition] = useState<any | null>(null);
  const [applyPositionTitle, setApplyPositionTitle] = useState<string | null>(null);

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

  // Generate Google Jobs JobPosting Schema for top Google Search ranking
  const jobPostingSchemas = positions.map((pos) => ({
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": pos.title,
    "description": pos.description || `${pos.title} Internship Opportunity at ZAYA CODE HUB. Work on real-world projects, earn verifiable certificates.`,
    "identifier": {
      "@type": "PropertyValue",
      "name": "ZAYA CODE HUB",
      "value": pos.id
    },
    "datePosted": pos.created_at || "2026-01-01T00:00:00Z",
    "validThrough": "2027-12-31T23:59:59Z",
    "employmentType": "INTERN",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "ZAYA CODE HUB",
      "sameAs": "https://zayacodehub.in",
      "logo": "https://zayacodehub.in/favicon.png"
    },
    "jobLocationType": "TELECOMMUTE",
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "IN"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Salem",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    }
  }));

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* Google Jobs Schema Injection */}
      {jobPostingSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {/* Header */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>INTERNSHIPS & CAREER OPPORTUNITIES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Future</span> of Tech
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are looking for passionate individuals who want to learn, grow, and build real-world products. Click on any internship below to view complete responsibilities and requirements.
          </p>
        </div>
      </section>

      {/* Positions List */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-bold">Loading opportunities...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">No open positions right now</h3>
                <p className="text-slate-500 mt-2">Check back later or follow our social media for upcoming internship drives!</p>
              </div>
            ) : (
              positions.map((pos) => {
                const Icon = getIconForCategory(pos.category);
                const preview = getShortPreview(pos.description);

                return (
                  <motion.div
                    key={pos.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-blue-500/40 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-start space-x-5 flex-1">
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {pos.title}
                          </h3>
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
                            {pos.type || 'Internship'}
                          </span>
                        </div>

                        {/* Clean Short Description Preview */}
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2">
                          {preview}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{pos.location || 'Remote (Work From Home)'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>1-2 Months Duration</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setDetailPosition(pos)}
                        className="px-5 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                      >
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => setApplyPositionTitle(pos.title)}
                        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Apply Now</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 1. INTERNSHIP DETAILS MODAL */}
      <AnimatePresence>
        {detailPosition && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailPosition(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start sticky top-0 z-10">
                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                    {detailPosition.type || 'Internship'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {detailPosition.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{detailPosition.location || 'Remote (Work From Home)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>1-2 Months Duration</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDetailPosition(null)}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                {(() => {
                  const { overview, sections } = parseDescriptionSections(detailPosition.description);
                  return (
                    <>
                      {/* Overview */}
                      <div>
                        <h4 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                          Role Overview
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                          {overview}
                        </p>
                      </div>

                      {/* Structured Sections */}
                      {sections.map((sec, idx) => (
                        <div key={idx} className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 dark:text-blue-400" />
                            <span>{sec.title}</span>
                          </h4>
                          <div className="space-y-2 pl-4">
                            {sec.content.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>

              {/* Modal Footer Action */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 sticky bottom-0 z-10">
                <span className="text-xs text-slate-500 hidden sm:inline font-semibold">
                  ZAYA CODE HUB • Verifiable Certificate Included
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setDetailPosition(null)}
                    className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const title = detailPosition.title;
                      setDetailPosition(null);
                      setApplyPositionTitle(title);
                    }}
                    className="px-7 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <span>Apply For This Position</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. APPLICATION FORM MODAL */}
      <AnimatePresence>
        {applyPositionTitle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApplyPositionTitle(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Internship Application</h2>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-1">{applyPositionTitle}</p>
                  </div>
                  <button
                    onClick={() => setApplyPositionTitle(null)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <ApplicationForm 
                  position={applyPositionTitle} 
                  onSuccess={() => setApplyPositionTitle(null)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
