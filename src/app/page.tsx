'use client';

export const metadata = {
  title: 'ZAYA CODE HUB | Software Development & IT Services',
  description: 'ZAYA CODE HUB builds custom web & mobile applications, AI solutions, cloud integrations, and enterprise software for businesses and startups.',
}

import Hero from "@/components/home/Hero";
import ServicesGrid from "@/components/home/ServicesGrid";
import TeamSection from "@/components/home/TeamSection";
import Testimonials from "@/components/home/Testimonials";
import { 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Stethoscope, 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  ShoppingBag, 
  Sparkles,
  ChevronRight,
  Code2,
  Cpu,
  Globe,
  Award
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const products = [
    {
      id: 'ai-zaya',
      name: 'AI ZAYA',
      category: 'AI & Productivity',
      image: '/images/ai-zaya-app.png',
      icon: Bot,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      shortDesc: 'AI-powered intelligent assistant featuring 50+ language voice interaction, study support, writing assistance, and Brain Game Assistant.',
      badge: 'Live on Play Store'
    },
    {
      id: 'nepcare',
      name: 'NepCare',
      category: 'Healthcare & Telemedicine',
      image: '/images/nepcare-app.png',
      icon: Stethoscope,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      shortDesc: 'Digital healthcare and telemedicine platform facilitating doctor discovery, video consultations, hospital listings, and medicine reminders.',
      badge: 'Active Product'
    },
    {
      id: 'zaya-school',
      name: 'ZAYA School',
      category: 'School Management',
      image: '/images/zaya-school.png',
      icon: GraduationCap,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      shortDesc: 'Comprehensive school management platform featuring 4 dedicated panels for Admins, Teachers, Students, and Parents.',
      badge: 'Active Product'
    },
    {
      id: 'zaya-learn',
      name: 'ZAYA Learn',
      category: 'Digital Education eBooks',
      image: '/images/zaya-learn.png',
      icon: BookOpen,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      shortDesc: 'Digital eBook and course reading platform for programming languages including Python, C++, Java, JavaScript, and Web Development.',
      badge: 'Active Product'
    },
    {
      id: 'surakshanep',
      name: 'SurakshaNep',
      category: 'Emergency & Public Safety',
      image: '/images/surakshanep-app.png',
      icon: ShieldAlert,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      shortDesc: 'Emergency response platform with 1-tap SOS alerts, live location sharing, police/ambulance dispatch, and quick women safety alerts.',
      badge: 'Innovative Product'
    },
    {
      id: 'zayamart',
      name: 'ZAYAMART',
      category: 'Local Market & Grocery Delivery',
      image: '/images/zayamart-app.png',
      icon: ShoppingBag,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      shortDesc: 'Direct farmer-to-consumer digital marketplace enabling rapid delivery of fresh produce, organic food, and groceries within minutes/hours.',
      badge: 'Fast Delivery Marketplace'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Hero Section */}
      <Hero />

      {/* Flagship Products Showcase */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              SOFTWARE PRODUCTS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Our Flagship Products
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              Explore the digital applications engineered by <strong>ZAYA CODE HUB</strong> across Artificial Intelligence, Healthcare, Education, Public Safety, and E-commerce.
            </p>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {products.map((prod) => (
              <div 
                key={prod.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      unoptimized
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/20">
                        {prod.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${prod.iconBg} shrink-0`}>
                        <prod.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {prod.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {prod.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {prod.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href="/portfolio"
                    className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <span>View Product Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products CTA */}
          <div className="text-center mt-12">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
            >
              <span>Explore Complete Product Portfolio</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Engineering Capabilities & Custom Solutions */}
      <ServicesGrid />

      {/* Leadership & Engineering Team */}
      <TeamSection />

      {/* Client & Product Reviews */}
      <Testimonials />

      {/* Career & Internship Opportunities CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/20">
              CAREERS & INTERNSHIPS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Launch Your Tech Career at ZAYA CODE HUB
            </h2>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Gain hands-on experience building real-world digital products in Web Development, Mobile Apps, UI/UX Design, and AI. Receive verifiable certificates and 1-on-1 mentorship.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/careers"
                className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
              >
                View Open Internships
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 rounded-2xl border border-white/30 text-white font-bold text-base hover:bg-white/10 transition-all"
              >
                About Our Company
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
