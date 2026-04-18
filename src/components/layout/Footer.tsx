'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, Globe, ExternalLink, GitFork, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  company: [
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
    <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold tracking-tight text-white">
                ZAYA<span className="text-blue-500">CODE</span>HUB
              </span>
            </Link>
            <p className="text-slate-100 leading-relaxed font-bold">
              Empowering businesses through cutting-edge software solutions and nurturing the next generation of IT professionals.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-100 hover:text-white transition-colors font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Services</h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-100 hover:text-white transition-colors font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg mb-6 text-white">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-slate-100 font-bold">
                <MapPin className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                <span>Subramania Nagar, Salem, Tamil Nadu – 636005</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-100 font-bold">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>+91 7033399183</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-100 font-bold">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>zayacodehub@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-slate-200 font-bold">
            © {new Date().getFullYear()} ZAYA CODE HUB. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm text-slate-200 hover:text-white transition-colors font-bold">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
