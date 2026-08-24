'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { Globe, ExternalLink, GitFork, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'AI ZAYA App', href: '/ai-zaya' },
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Contact', href: '/contact' },
  ],
  services: [
    { name: 'Web Development', href: '/services' },
    { name: 'App Development', href: '/services' },
    { name: 'UI/UX Design', href: '/services' },
    { name: 'Custom Software', href: '/services' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

const socialLinks = [
  { icon: Globe, label: 'Twitter / X', href: '#' },
  { icon: ExternalLink, label: 'LinkedIn', href: '#' },
  { icon: GitFork, label: 'GitHub', href: '#' },
];

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');

  if (isDashboard) return null;

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Logo size="md" forceWhite={false} />
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Empowering businesses through cutting-edge software solutions and nurturing the next generation of IT professionals.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-base mb-6 text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-6 text-slate-900 dark:text-white">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="font-semibold text-base mb-6 text-slate-900 dark:text-white">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300 text-sm">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span>Subramania Nagar, Salem, Tamil Nadu – 636005</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-sm">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>+91 7033399183</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 text-sm">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>zayacodehub@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ZAYA CODE HUB. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
