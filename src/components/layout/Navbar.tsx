'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/common/Logo';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'AI ZAYA', href: '/ai-zaya', badge: 'NEW' },
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
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('intern');
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserAndRole = async (sessionUser: any) => {
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
    <nav
      className={cn(
        'w-full transition-all duration-300 border-b border-slate-200/50 dark:border-slate-800/50',
        isScrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm py-3'
          : 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm py-4'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Logo size="md" />

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'text-sm font-bold transition-colors hover:text-blue-600 flex items-center gap-1.5',
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-foreground'
              )}
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-md bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          {user ? (
            <Link
              href={`/${role}`}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <UserIcon className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Portal Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

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
                    'text-xl font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-between',
                    pathname === link.href
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white shadow-sm">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="pt-4">
                {user ? (
                  <Link
                    href={`/${role}`}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    <UserIcon className="h-5 w-5" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full block text-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
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
  );
}
