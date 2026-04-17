'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Users2, ShieldCheck, Zap } from 'lucide-react';
import TeamSection from '@/components/home/TeamSection';

export default function AboutPage() {
  const scrollToTeam = () => {
    document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-7xl font-bold text-foreground mb-8">
              Empowering the <span className="text-blue-600">Next Generation</span> of Innovators
            </h1>
            <p className="text-xl text-foreground leading-relaxed">
              Founded with a vision to bridge the gap between complex technology and business needs, ZAYA CODE HUB has grown into a premier destination for software excellence and professional training.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="p-4 rounded-2xl bg-blue-600 text-white w-fit mb-8 shadow-lg shadow-blue-600/20">
                <Target className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-foreground text-lg leading-relaxed">
                To deliver high-impact digital solutions that solve real-world problems, while providing an ecosystem for aspiring tech professionals to gain industry-ready skills through hands-on experience and mentorship.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="p-4 rounded-2xl bg-indigo-600 text-white w-fit mb-8 shadow-lg shadow-indigo-600/20">
                <Eye className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Vision</h2>
              <p className="text-foreground text-lg leading-relaxed">
                To be a global leader in IT innovation, recognized for our commitment to quality, creativity, and the development of exceptional tech talent that shapes the future of the digital economy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-foreground">The principles that guide everything we do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Quality First', desc: 'We never compromise on the quality of our code and designs.', icon: ShieldCheck },
              { title: 'Innovation', desc: 'Constantly exploring new technologies to provide better solutions.', icon: Zap },
              { title: 'Integrity', desc: 'Building trust through transparency and honest communication.', icon: Award },
            ].map((value, i) => (
              <div key={i} className="text-center p-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 w-fit mx-auto mb-6">
                  <value.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-4">{value.title}</h4>
                <p className="text-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Snippet */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-foreground mb-8">Meet Our Leadership</h2>
              <p className="text-lg text-foreground mb-8 leading-relaxed">
                Our team is comprised of industry veterans and passionate innovators who share a common goal: excellence. We believe in collaborative growth and constant learning.
              </p>
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-blue-600 shadow-lg relative">
                  <Image src="/ceo.png" alt="Rahul Kumar Yadav" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-foreground uppercase tracking-tight">RAHUL KUMAR YADAV</h4>
                  <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">CEO / FOUNDER</p>
                </div>
              </div>
              <button 
                onClick={scrollToTeam}
                className="px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-all flex items-center"
              >
                <Users2 className="mr-2 h-5 w-5" /> View Full Team
              </button>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 relative">
                <Image src="/ceo.png" alt="Rahul Kumar Yadav" fill className="object-cover" />
              </div>
              {/* Floating Stat */}
              <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-3xl font-bold text-blue-600">20+</div>
                <div className="text-xs font-bold text-foreground uppercase tracking-widest">Industry Experts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Team Grid */}
      <TeamSection />
    </div>
  );
}
