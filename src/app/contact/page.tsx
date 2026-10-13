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
            Contact Our <span className="text-blue-600">Bengaluru & Nepal Offices</span>
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            ZAYA CODE HUB is headquartered in Bengaluru, India, with an office in Lalitpur, Nepal. Contact us about software, apps, AI projects, and partnerships.
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
                    <h4 className="font-medium text-foreground mb-1">Email Us</h4>
                    <a href="mailto:zayacodehub@gmail.com" className="block text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">zayacodehub@gmail.com</a>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">HR & careers: <a href="mailto:hr@zayacodehub.in" className="font-medium text-blue-700 hover:underline dark:text-blue-300">hr@zayacodehub.in</a></p>
                    <p className="text-slate-500 text-sm">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Call Us</h4>
                    <p className="text-slate-600 dark:text-slate-300">+91 7033399183</p>
                    <p className="text-slate-500 text-sm">Mon-Fri, 9am - 6pm</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Headquarters</h4>
                    <p className="text-slate-600 dark:text-slate-300">Bengaluru (Bangalore), Karnataka, India</p>
                    <h4 className="mt-3 font-medium text-foreground mb-1">Nepal Office</h4>
                    <p className="text-slate-600 dark:text-slate-300">Lalitpur, Nepal</p>
                  </div>
                </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialIcons.map((social) => (
                    <button key={social.label} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-600 transition-colors">
                      <social.icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-xl bg-blue-600 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-semibold mb-4">Quick WhatsApp Chat</h3>
                  <p className="text-blue-100 mb-6">Need an instant response? Chat with our experts on WhatsApp.</p>
                  <a 
                    href="https://wa.me/917033399183" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Start Chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="flex-1">
              <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-3xl font-semibold text-foreground mb-8">Send a Message</h3>
                
                {isSuccess ? (
                   <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 border border-green-200 dark:border-green-800 text-center">
                    <h4 className="text-xl font-semibold mb-2">Message Sent!</h4>
                    <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
                    <button onClick={() => setIsSuccess(false)} className="mt-6 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">Send Another</button>
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
                        <input name="email" required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" placeholder="you@example.com" />
                      </div>
                    </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Subject</label>
                       <input name="subject" required type="text" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" placeholder="How can we help?" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Message</label>
                       <textarea name="message" required rows={6} className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none resize-none" placeholder="Your message here..."></textarea>
                     </div>
                     <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-lg bg-blue-600 text-white font-medium text-base hover:bg-blue-700 transition-colors flex items-center justify-center">
                       {isSubmitting ? 'Sending...' : <>Send Message <Send className="ml-2 h-5 w-5" /></>}
                     </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City-level office maps because street addresses were not provided. */}
      <section className="grid gap-6 bg-slate-50 p-6 dark:bg-slate-900 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <h2 className="bg-white px-5 py-4 font-semibold dark:bg-slate-950">Headquarters · Bengaluru (Bangalore), India</h2>
          <iframe
            title="Map showing ZAYA CODE HUB headquarters in Bengaluru, India"
            src="https://maps.google.com/maps?q=Bengaluru%20(Bangalore)%2C%20Karnataka%2C%20India&output=embed"
            className="h-[320px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <h2 className="bg-white px-5 py-4 font-semibold dark:bg-slate-950">Nepal Office · Lalitpur, Nepal</h2>
          <iframe
            title="Map showing ZAYA CODE HUB Nepal office in Lalitpur"
            src="https://maps.google.com/maps?q=Lalitpur%2C%20Nepal&output=embed"
            className="h-[320px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
