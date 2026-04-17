'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Globe, ExternalLink, GitFork } from 'lucide-react';

const socialIcons = [
  { icon: Globe, label: 'Twitter / X' },
  { icon: ExternalLink, label: 'LinkedIn' },
  { icon: GitFork, label: 'GitHub' },
];

import { supabase } from '@/lib/supabaseClient';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    const { error } = await supabase.from('contact_messages').insert([
      { name, email, subject, message }
    ]);

    if (error) {
      console.error('Error submitting form:', error);
      alert(`There was an error sending your message: ${error.message}\n(Make sure to run the SQL script to create the 'contact_messages' table!)`);
    } else {
      setIsSuccess(true);
      e.currentTarget.reset();
      setTimeout(() => setIsSuccess(false), 5000);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Let&apos;s <span className="text-blue-600">Connect</span>
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            Have a project in mind or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Contact Info */}
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-8">Contact Information</h2>
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Email Us</h4>
                      <p className="text-foreground">zayacodehub@gmail.com</p>
                      <p className="text-foreground text-sm font-bold">Response within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Call Us</h4>
                      <p className="text-foreground">+91 7033399183</p>
                      <p className="text-foreground text-sm font-bold">Mon-Fri, 9am - 6pm</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Visit Us</h4>
                      <p className="text-foreground">Subramania Nagar</p>
                      <p className="text-foreground">Salem, Tamil Nadu – 636005</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialIcons.map((social) => (
                    <button key={social.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-600 transition-all">
                      <social.icon className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-blue-600 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Quick WhatsApp Chat</h3>
                  <p className="text-blue-100 mb-6">Need an instant response? Chat with our experts on WhatsApp.</p>
                  <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>Start Chat</span>
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="flex-1">
              <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-3xl font-bold text-foreground mb-8">Send a Message</h3>
                
                {isSuccess ? (
                  <div className="p-8 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-100 dark:border-green-800 text-center">
                    <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                    <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
                    <button onClick={() => setIsSuccess(false)} className="mt-6 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Name</label>
                        <input name="name" required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Email</label>
                        <input name="email" required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" placeholder="zayacodehub@gmail.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Subject</label>
                      <input name="subject" required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" placeholder="How can we help?" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Message</label>
                      <textarea name="message" required rows={6} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none resize-none" placeholder="Your message here..."></textarea>
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center">
                      {isSubmitting ? 'Sending...' : <>Send Message <Send className="ml-2 h-5 w-5" /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] w-full bg-slate-200 dark:bg-slate-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-foreground font-bold">Interactive Google Map Placeholder</p>
            <p className="text-sm text-foreground font-bold">Salem, Tamil Nadu</p>
          </div>
        </div>
      </section>
    </div>
  );
}
