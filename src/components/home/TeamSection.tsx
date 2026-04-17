'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Globe, ExternalLink, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const teamMembers = [
  {
    name: "Rahul Kumar Yadav",
    role: "CEO & Founder",
    bio: "The visionary leader behind ZAYA CODE HUB. Driving strategic innovation and global business growth.",
    skills: ["Executive Leadership", "Strategic Vision", "Innovation"],
    image: "/Teams/Rahul Kumar Yadav.png",
    socials: { linkedin: "#", github: "#", email: "rahul@zayacodehub.in" }
  },
  {
    name: "Shivshankar Kr Jaysawal",
    role: "Co-Founder",
    bio: "Driving the strategic vision and long-term business growth of ZAYA CODE HUB.",
    skills: ["Business Strategy", "Leadership", "Innovation"],
    image: "/Teams/Shivshankar Kr Jaysawal.jpeg",
    socials: { linkedin: "#", github: "#", email: "shiva@zayacodehub.in" }
  },
  {
    name: "Rohith P",
    role: "Chief Technology Officer (CTO)",
    bio: "Leading our technical architecture and ensuring engineering excellence across all projects.",
    skills: ["Tech Architecture", "Cloud Systems", "Backend"],
    image: "/Teams/Rohith p .jpeg",
    socials: { linkedin: "#", github: "#", email: "#" }
  },
  {
    name: "Akash Adhikari",
    role: "Human Resources (HR)",
    bio: "Managing talent acquisition and building a world-class team culture at ZAYA CODE HUB.",
    skills: ["Recruitment", "Team Culture", "Communication"],
    image: "/Teams/Akash Adhikari.jpeg",
    socials: { linkedin: "#", github: "#", email: "#" }
  },
  {
    name: "Sujan Khatri",
    role: "Operations Manager",
    bio: "Optimizing workflow efficiency and overseeing daily business operations.",
    skills: ["Operations", "Workflow", "Efficiency"],
    image: "/Teams/Sujan Khatri.jpeg",
    socials: { linkedin: "#", github: "#", email: "#" }
  },
  {
    name: "Aditya Chaurasiya",
    role: "Marketing",
    bio: "Leading our brand strategy and digital marketing campaigns to expand our global reach.",
    skills: ["Digital Marketing", "Branding", "Strategy"],
    image: "/Teams/Aditya Chaurasiya.jpg",
    socials: { linkedin: "#", github: "#", email: "#" }
  }
];

export default function TeamSection() {
  return (
    <section id="team-section" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-600/20"
          >
            Our Experts
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-foreground mt-6 mb-6"
          >
            Meet the Team Behind <span className="text-blue-600">ZAYA CODE HUB</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            A passionate group of innovators, designers, and developers dedicated to building the future of digital solutions.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
            >
              {/* Profile Image */}
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl z-10">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">
                  {member.role}
                </p>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {member.bio}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                {member.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Socials */}
              <div className="flex items-center space-x-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                <a href={member.socials.linkedin} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  <Globe className="h-4 w-4" />
                </a>
                <a href={member.socials.github} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href={member.socials.email === "#" ? `mailto:${member.name.toLowerCase().replace(/ /g, '.')}@zayacodehub.in` : `mailto:${member.socials.email}`} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/careers"
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center group"
          >
            Join Our Team <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/contact"
            className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-foreground font-black uppercase tracking-widest text-sm hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
