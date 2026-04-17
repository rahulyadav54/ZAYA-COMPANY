'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Palette, Monitor, Rocket, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    title: 'Android App Development',
    description: 'We build high-performance, native and cross-platform mobile apps that provide exceptional user experiences and drive engagement.',
    features: ['Native Android (Kotlin)', 'Flutter & React Native', 'Custom API Integration', 'App Store Optimization'],
    icon: Smartphone,
    color: 'bg-blue-600',
  },
  {
    title: 'Website Development',
    description: 'Our websites are fast, responsive, and SEO-optimized, using modern frameworks like React and Next.js to ensure top-tier performance.',
    features: ['Single Page Applications', 'E-commerce Solutions', 'CMS Integration', 'Cloud Hosting'],
    icon: Globe,
    color: 'bg-indigo-600',
  },
  {
    title: 'UI/UX Design',
    description: 'Design that speaks. We create intuitive user interfaces and meaningful experiences that align with your brand identity.',
    features: ['User Research', 'Wireframing & Prototyping', 'Visual Design', 'Interaction Design'],
    icon: Palette,
    color: 'bg-purple-600',
  },
  {
    title: 'School Management Software',
    description: 'Streamline your educational institution with our comprehensive management software for students, staff, and parents.',
    features: ['Attendance Tracking', 'Result Management', 'Online Fee Payment', 'Virtual Classrooms'],
    icon: Monitor,
    color: 'bg-emerald-600',
  },
  {
    title: 'Custom Business Software',
    description: 'Solving unique business challenges with tailored software solutions that improve efficiency and scale with your growth.',
    features: ['ERP & CRM Solutions', 'Workflow Automation', 'Data Analytics', 'Legacy Migration'],
    icon: Rocket,
    color: 'bg-orange-600',
  },
  {
    title: 'Internship Training',
    description: 'Our hands-on training programs bridge the gap between academic learning and industry requirements for tech aspirants.',
    features: ['Real Project Experience', 'Mentorship from Experts', 'Certification', 'Placement Support'],
    icon: GraduationCap,
    color: 'bg-rose-600',
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero Header */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Services That <span className="text-blue-600">Empower</span>
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            From mobile apps to custom enterprise solutions, we provide the technical expertise you need to succeed in a digital-first world.
          </p>
        </div>
      </section>

      {/* Services Detailed Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col h-full group"
              >
                <div className="mb-8 relative">
                  <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-600/10 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-foreground mb-8 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-3 mb-10 flex-grow">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm font-medium text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/contact"
                  className="inline-flex items-center text-blue-600 font-bold hover:underline"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Working Process</h2>
            <p className="text-slate-100 max-w-2xl mx-auto font-bold">
              We follow a streamlined development lifecycle to ensure quality and timely delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Consultation', desc: 'Understanding your vision and requirements.' },
              { step: '02', title: 'Planning', desc: 'Defining the tech stack and architecture.' },
              { step: '03', title: 'Development', desc: 'Agile execution with regular updates.' },
              { step: '04', title: 'Deployment', desc: 'Rigorous testing and successful launch.' },
            ].map((item) => (
              <div key={item.step} className="relative group text-center md:text-left">
                <div className="text-6xl font-black text-white/10 mb-4 group-hover:text-blue-600/30 transition-colors">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-slate-100 text-sm leading-relaxed font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
