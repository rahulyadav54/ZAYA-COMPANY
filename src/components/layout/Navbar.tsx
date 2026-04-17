'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Careers', href: '/careers' },
  { name: 'Magazine', href: '/magazine' },
  { name: 'Contact', href: '/contact' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Code2 className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-foreground">
            ZAYA<span className="text-blue-600">CODE</span>HUB
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'text-sm font-bold transition-colors hover:text-blue-600',
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-foreground'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Portal Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-xl font-bold py-4 px-6 rounded-2xl transition-all active:scale-95',
                    pathname === link.href
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full block text-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Portal Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
