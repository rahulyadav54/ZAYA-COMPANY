'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { Mail, Phone, MapPin } from 'lucide-react';

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

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');

  if (isDashboard) return null;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-8 pt-16 text-white">
      <div className="container mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Logo size="md" forceWhite />
            <p className="text-sm leading-7 text-slate-400">
              Empowering businesses through cutting-edge software solutions and nurturing the next generation of IT professionals.
            </p>
            <Link href="/contact" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-white">
              Talk to our team <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-6 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold text-white">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="mb-6 text-sm font-semibold text-white">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                <span><strong>Headquarters:</strong> Bengaluru, Karnataka, India<br /><strong>Nepal office:</strong> Lalitpur, Nepal</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <Phone className="h-5 w-5 shrink-0 text-blue-300" />
                <span>+91 7033399183</span>
              </div>
              <div className="flex items-start space-x-3 text-sm text-slate-400">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                <div className="space-y-2">
                  <p><span className="text-slate-500">General:</span> <a href="mailto:zayacodehub@gmail.com" className="transition hover:text-white">zayacodehub@gmail.com</a></p>
                  <p><span className="text-slate-500">HR & careers:</span> <a href="mailto:hr@zayacodehub.in" className="transition hover:text-white">hr@zayacodehub.in</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between space-y-4 border-t border-slate-800 pt-7 md:flex-row md:space-y-0">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ZAYA CODE HUB. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.legal.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm text-slate-500 transition-colors hover:text-white">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
