'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Stethoscope, 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  ShoppingBag, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  ArrowRight,
  Info,
  Clock,
  Zap
} from 'lucide-react';

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const categories = [
    'All',
    'AI & Productivity',
    'Healthcare',
    'Education',
    'Public Safety',
    'E-commerce'
  ];

  const products = [
    {
      id: 'ai-zaya',
      name: 'AI ZAYA',
      tagline: 'AI-Powered Intelligent Assistant',
      category: 'AI & Productivity',
      status: 'Live on Google Play',
      image: '/images/ai-zaya-app.png',
      icon: Bot,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      shortDesc: 'Flagship AI assistant developed by ZAYA CODE HUB combining conversational intelligence, study support, and 50+ language voice interaction with an interactive Brain Game Assistant.',
      description: 'AI ZAYA is an AI-powered intelligent assistant developed by ZAYA CODE HUB. It is designed to help users learn, communicate, create, solve problems, and improve productivity through an interactive AI experience. AI ZAYA combines conversational AI assistance with educational and entertainment features, making it more than a basic chatbot.',
      features: [
        'AI Conversational Assistant & Q&A',
        'Educational & Study Support',
        'Content Generation & Writing Assistance',
        'Interactive Brain Game Assistant (Memory, Logic, Math, Puzzles)',
        'Voice & Multilingual Interaction (50+ Languages)',
        'General Productivity & Creative Brainstorming',
        'Programming & Debugging Assistance'
      ],
      targetUsers: ['Students', 'Developers', 'Professionals', 'Content Creators', 'Entrepreneurs', 'General Users'],
      learnMoreUrl: '/ai-zaya',
      externalUrl: 'https://play.google.com/store/apps/details?id=com.zayaai.app&pcampaignid=web_share'
    },
    {
      id: 'nepcare',
      name: 'NepCare',
      tagline: 'Digital Healthcare & Telemedicine Platform',
      category: 'Healthcare',
      status: 'Active',
      image: '/images/nepcare-app.png',
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      shortDesc: 'Telemedicine and healthcare discovery platform designed to make medical services, doctor appointments, and health info accessible through digital technology.',
      description: 'NepCare is a healthcare and telemedicine platform designed to make healthcare services more accessible and convenient through digital technology. Positioned as a healthcare-focused digital product developed by ZAYA CODE HUB.',
      features: [
        'Doctor & Healthcare Provider Discovery',
        'Telemedicine Video Consultations',
        'Digital Health Information & Records',
        'Hospital & Clinic Location Discovery',
        'Medicine Reminders & Schedule Tracking',
        'Location-based Healthcare Assistance',
        'Multilingual Accessibility & AI Healthcare Support'
      ],
      targetUsers: ['Patients', 'Doctors', 'Hospitals', 'Clinics', 'Healthcare Providers']
    },
    {
      id: 'zaya-school',
      name: 'ZAYA School',
      tagline: 'Complete School Management Solution',
      category: 'Education',
      status: 'Active',
      image: '/images/zaya-school.png',
      icon: GraduationCap,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      shortDesc: 'Digital school management platform designed to simplify and modernize school administration, teaching, student performance tracking, and parent communication.',
      description: 'ZAYA School is a digital school management platform designed to simplify and modernize school administration, teaching, student management, and parent communication. Features 4 specialized panels for Admins, Teachers, Students, and Parents.',
      panels: ['Admin Panel', 'Teacher Panel', 'Student Panel', 'Parent Panel'],
      features: [
        'Student & Teacher Profile Management',
        'Attendance & Examination Management',
        'Fees Management & Accounting Systems',
        'Library & Transportation Tracking',
        'Parent/Student Real-time Communication',
        'AI-Assisted Student Performance Analysis'
      ],
      targetUsers: ['School Admins', 'Teachers', 'Students', 'Parents']
    },
    {
      id: 'zaya-learn',
      name: 'ZAYA Learn',
      tagline: 'Digital Learning & eBook Platform',
      category: 'Education',
      status: 'Active',
      image: '/images/zaya-learn.png',
      icon: BookOpen,
      iconBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      shortDesc: 'Digital learning and eBook platform providing students with instant access to programming courses, technical eBooks, and educational resources.',
      description: 'ZAYA Learn is a digital learning and eBook platform designed to provide students and learners with easy access to educational resources, technical documentation, and digital books across major software engineering subjects.',
      ebookCategories: ['C', 'C++', 'Java', 'Python', 'JavaScript', 'PHP', 'SQL', 'AI & Machine Learning', 'Android', 'Flutter', 'Web Development'],
      features: [
        'Digital eBooks & Integrated PDF Reader',
        'Book Categories & Smart Search',
        'Bookmarks & Continue Reading Progress',
        'Downloadable Learning Resources',
        'Personalized Learning Experience'
      ],
      targetUsers: ['Students', 'Beginner Programmers', 'Self-learners', 'Developers']
    },
    {
      id: 'surakshanep',
      name: 'SurakshaNep',
      tagline: 'Emergency Response & Public Safety',
      category: 'Public Safety',
      status: 'Active',
      image: '/images/surakshanep-app.png',
      icon: ShieldAlert,
      iconBg: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
      shortDesc: 'Innovative emergency-response and public-safety platform designed to help users request immediate assistance and share critical info during emergency situations.',
      description: 'SurakshaNep is an emergency-response and public-safety platform designed to help users request emergency assistance and communicate critical information during emergency situations. Presented as an innovative public-safety solution by ZAYA CODE HUB.',
      features: [
        'SOS Emergency One-Tap Alerts',
        'Live Location Sharing with Rescuers',
        'Police, Ambulance & Fire Emergency Dispatch',
        'Emergency Response Dashboards',
        'AI-Assisted Emergency Analysis',
        'Photo/Video Evidence Capture',
        'Voice-Triggered Activation & Offline Mode',
        'Women Safety Quick-Alert Functionality'
      ],
      targetUsers: ['Citizens', 'Women Safety', 'Police Authorities', 'Medical Dispatch', 'Emergency Responders']
    },
    {
      id: 'zayamart',
      name: 'ZAYAMART',
      tagline: 'Direct Farmer-to-Customer Rapid Food & Grocery Delivery Marketplace',
      category: 'E-commerce',
      status: 'Active',
      image: '/images/zayamart-app.png',
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      shortDesc: 'Digital marketplace connecting local farmers directly with consumers, enabling rapid delivery of fresh groceries, organic produce, and food within minutes or hours.',
      description: 'ZAYAMART is an ultra-fast digital marketplace platform designed by ZAYA CODE HUB to connect local farmers and food vendors directly with consumers. It enables instant local ordering and rapid delivery of fresh farm produce, groceries, and essential food items within minutes or hours while ensuring fair pricing for farmers.',
      features: [
        'Direct Farmer-to-Customer Connectivity',
        'Ultra-Fast Delivery (Within Minutes or Hours)',
        'Farmer Product & Inventory Registration',
        'Real-Time Order Tracking & Express Dispatch',
        'Local Organic Fresh Food Discovery',
        'Fair Pricing & Direct Farmer Earnings'
      ],
      targetUsers: ['Local Farmers', 'Consumers', 'Agricultural Vendors', 'Local Business Owners']
    }
  ];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium tracking-wide mb-6">
            <span className="text-blue-500">&#9679;</span>
            <span>PRODUCT PORTFOLIO</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Our <span className="text-blue-700 dark:text-blue-300">Products & Projects</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore our flagship software products and digital solutions across Artificial Intelligence, Healthcare, Education, Public Safety, and E-commerce developed by <strong>ZAYA CODE HUB</strong>.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards Grid */}
      <section className="py-16 sm:py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredProducts.map((prod) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Visual Preview */}
                <div className="relative h-60 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <Image
                    src={prod.image}
                    alt={`${prod.name} Developed by ZAYA CODE HUB`}
                    fill
                    unoptimized
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-100 border border-white/10">
                      {prod.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl ${prod.iconBg} shrink-0`}>
                      <prod.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {prod.name}
                      </h3>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {prod.shortDesc}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {prod.features.slice(0, 3).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>View Details</span>
                </button>

                {prod.learnMoreUrl ? (
                  <Link
                    href={prod.learnMoreUrl}
                    className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl ${selectedProduct.iconBg}`}>
                    <selectedProduct.icon className="h-8 w-8" />
                  </div>
                  <div>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${selectedProduct.statusColor}`}>
                        {selectedProduct.status}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{selectedProduct.tagline}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                {/* Visual Image */}
                <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-3 flex items-center justify-center">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wide mb-2">
                    Product Description
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Specialized User Panels if ZAYA School */}
                {selectedProduct.panels ? (
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide mb-3">
                      User Panels
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.panels.map((p: string, i: number) => (
                        <span key={i} className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20">
                          👤 {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Specialized eBook Categories if ZAYA Learn */}
                {selectedProduct.ebookCategories ? (
                  <div>
                    <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 tracking-wide mb-3">
                      eBook & Course Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.ebookCategories.map((c: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20">
                          📚 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Key Features */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wide mb-3">
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProduct.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Users */}
                {selectedProduct.targetUsers ? (
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide mb-3">
                      Target Users
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.targetUsers.map((u: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          🎯 {u}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 sticky bottom-0 z-10">
                <span className="text-xs text-slate-500 font-semibold">
                  DEVELOPED BY ZAYA CODE HUB
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                  {selectedProduct.learnMoreUrl ? (
                    <Link
                      href={selectedProduct.learnMoreUrl}
                      onClick={() => setSelectedProduct(null)}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors flex items-center gap-1"
                    >
                      <span>Explore Page</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : selectedProduct.externalUrl ? (
                    <a
                      href={selectedProduct.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors flex items-center gap-1"
                    >
                      <span>Get on Play Store</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
