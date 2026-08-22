'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/common/Logo';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'AI ZAYA', href: '/ai-zaya', badge: 'NEW' },
  { name: 'Practice Tests', href: '/practice', badge: 'FREE' },
  { name: 'Placement Prep', href: '/placement-prep', badge: 'PAID' },
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
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);
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
  type SessionUser = {
    id: string;
    email?: string | null;
  };
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRole] = useState<string>('intern');
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserAndRole = async (sessionUser: SessionUser | null) => {
      setUser(sessionUser);
      if (sessionUser) {
        const { data } = await supabase.from('profiles').select('role').eq('id', sessionUser.id).maybeSingle();
        if (data) setRole(data.role);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndRole(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');
  if (isDashboard) return null;

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <nav
        className={cn(
          'w-full sticky top-0 z-50 transition-all duration-300 border-b border-slate-200/80 dark:border-slate-800/80',
          isScrolled
            ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-md py-2.5'
            : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-3.5'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Logo size="sm" />

          {/* Desktop Navigation Links (Visible only on lg: 1024px+) */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-xs font-black uppercase tracking-wider transition-all hover:text-blue-600 flex items-center gap-1.5 py-1',
                  pathname === link.href
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-black rounded-md bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <Link
                href={`/${role}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-95"
              >
                <UserIcon className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-95"
              >
                Portal Login
              </Link>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xl relative z-50"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'text-xs font-black tracking-tight py-2.5 px-4 rounded-xl transition-all flex items-center justify-between',
                      pathname === link.href
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    )}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-900 mt-2">
                  {user ? (
                    <Link
                      href={`/${role}`}
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20"
                    >
                      <UserIcon className="h-4 w-4" />
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full block text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20"
                    >
                      Portal Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
