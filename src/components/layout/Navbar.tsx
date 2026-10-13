'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, User as UserIcon, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/common/Logo';

const navLinks = [
  {
    name: 'Products',
    href: '/portfolio',
    dropdown: [
      { name: 'Product portfolio', href: '/portfolio', description: 'Software products built by ZAYA', external: false },
      { name: 'AI ZAYA', href: '/ai-zaya', description: 'Explore our AI assistant', external: false },
    ]
  },
  { name: 'Services', href: '/services' },
  {
    name: 'Learning',
    href: '/placement-prep',
    dropdown: [
      { name: 'Placement preparation', href: '/placement-prep', description: 'Explore preparation resources', external: false },
      { name: 'Practice tests', href: '/practice', description: 'Browse practice exams', external: false },
      { name: 'Aptitude test', href: '/aptitude-test', description: 'Reasoning and logic assessment', external: false },
      { name: 'Coding practice', href: '/practice/code', description: 'Programming challenges', external: false },
      { name: 'Programming tutorials', href: 'https://zayacodehub.online', description: 'Explore programming languages, tutorials, and eBooks', external: true },
    ]
  },
  {
    name: 'Company',
    href: '/about',
    dropdown: [
      { name: 'About ZAYA', href: '/about', description: 'Our company and locations', external: false },
      { name: 'Careers', href: '/careers', description: 'Open roles and internships', external: false },
      { name: 'Magazine', href: '/magazine', description: 'Articles and updates', external: false },
    ]
  },
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
      className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(name);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/intern');
  if (isDashboard) return null;

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <nav
        className={cn(
          'w-full relative z-50 transition-all duration-300 border-b border-slate-200/80 dark:border-slate-800/80',
          isScrolled
            ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-sm py-2'
            : 'bg-white dark:bg-slate-950 py-2.5'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Logo size="sm" />

          {/* Desktop Navigation Links (Visible only on lg: 1024px+) */}
          <div className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && handleDropdownEnter(link.name)}
                onFocus={() => link.dropdown && handleDropdownEnter(link.name)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenDropdown(null);
                }}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href={link.href}
                  aria-expanded={link.dropdown ? openDropdown === link.name : undefined}
                  className={cn(
                    'text-sm font-medium transition-all hover:text-blue-600 py-1 flex items-center gap-1',
                    pathname === link.href || (link.dropdown && link.dropdown.some(item => pathname === item.href))
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </Link>

                {/* Dropdown Menu */}
                {link.dropdown && openDropdown === link.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          onClick={() => setOpenDropdown(null)}
                          className={cn(
                            'block px-4 py-3 rounded-lg transition-colors',
                            pathname === item.href
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          )}
                        >
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <Link
                href={`/${role}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <UserIcon className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
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
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
              className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-lg relative z-50"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'text-sm font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-between',
                        pathname === link.href
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      <span>{link.name}</span>
                      {link.dropdown && (
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {link.dropdown.length}
                        </span>
                      )}
                    </Link>
                    {link.dropdown && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'block text-sm py-2 px-3 rounded-lg transition-colors',
                              pathname === item.href
                                ? 'text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  {user ? (
                    <Link
                      href={`/${role}`}
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full block text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
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
