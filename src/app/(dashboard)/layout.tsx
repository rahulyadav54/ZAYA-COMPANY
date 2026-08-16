'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  User, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Code2,
  Users,
  Settings,
  FileText,
  Briefcase,
  Newspaper,
  ShieldCheck,
  Mail,
  Award,
  IdCard,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/common/Logo';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPath = pathname.startsWith('/admin');
  const isInternPath = pathname.startsWith('/intern');

  React.useEffect(() => {
    async function checkRole() {
      try {
        const { getActiveUser } = await import('@/lib/getActiveUser');
        const activeUser = await getActiveUser();

        if (!activeUser) {
          router.push('/login');
          return;
        }

        setUserId(activeUser.id);

        const activeEmail = (activeUser.email || '').toLowerCase().trim();
        let userRole = (activeEmail.includes('admin') || activeEmail === 'zayacodehub@gmail.com') ? 'admin' : 'intern';

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', activeUser.id)
            .maybeSingle();

          if (profile?.role) {
            userRole = profile.role;
          }
        } catch (e) {
          console.warn('Profile role fetch notice:', e);
        }

        // Enforce strict role-based portal access
        if (userRole === 'admin' && isInternPath) {
          console.log("Admin attempted to access intern portal. Redirecting to admin dashboard.");
          router.push('/admin');
          return;
        } 
        
        if (userRole === 'intern' && isAdminPath) {
          console.log("Intern attempted to access admin portal. Access denied.");
          router.push('/intern');
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkRole();
  }, [pathname, router, isAdminPath, isInternPath]);

  React.useEffect(() => {
    if (!userId || isAdminPath) return;

    // Reset notification if user is on the messages page
    if (pathname === '/intern/messages') {
      setHasNewMessage(false);
    }

    const channel = supabase
      .channel('message_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'intern_messages' 
      }, (payload) => {
        if (payload.new.intern_id === userId && payload.new.sender_type === 'admin') {
          if (pathname !== '/intern/messages') {
            setHasNewMessage(true);
            // Optional: Play a subtle sound or show browser notification if allowed
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, pathname, isAdminPath]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    
    try {
      localStorage.removeItem('zaya_intern_session');
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear notice:', e);
    }

    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  const isAdmin = isAdminPath;

  const links = isAdmin 
    ? [
        { section: 'MAIN MENU', items: [
          { name: 'Overview', href: '/admin', icon: LayoutDashboard },
          { name: 'Applications', href: '/admin/applications', icon: FileText },
          { name: 'Manage Interns', href: '/admin/interns', icon: Users },
        ]},
        { section: 'MANAGEMENT', items: [
          { name: 'Exam Portal', href: '/admin/exams', icon: GraduationCap },
          { name: 'Submissions', href: '/admin/submissions', icon: CheckSquare },
          { name: 'User Management', href: '/admin/users', icon: ShieldCheck },
          { name: 'Messages', href: '/admin/messages', icon: Mail },
          { name: 'Manage Careers', href: '/admin/careers', icon: Briefcase },
          { name: 'Manage Magazine', href: '/admin/magazine', icon: Newspaper },
        ]},
        { section: 'SYSTEM', items: [
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ]}
      ]
    : [
        { section: 'MAIN MENU', items: [
          { name: 'My Tasks', href: '/intern', icon: CheckSquare },
          { name: 'Proctored Exams', href: '/intern/exams', icon: GraduationCap },
          { name: 'Submission', href: '/intern/submit', icon: FileText },
          { name: 'Messages', href: '/intern/messages', icon: Mail },
        ]},
        { section: 'MY CREDENTIALS', items: [
          { name: 'My Certificates', href: '/intern/certificates', icon: Award },
          { name: 'ID Card', href: '/intern/id-card', icon: IdCard },
          { name: 'My Profile', href: '/intern/profile', icon: User },
        ]},
        { section: 'SYSTEM', items: [
          { name: 'Settings', href: '/intern/settings', icon: Settings },
        ]}
      ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 relative">
      {/* Mobile Drawer Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl lg:shadow-none flex flex-col justify-between rounded-r-[2rem] lg:rounded-none overflow-hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col justify-between overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <Logo subtitle={isAdmin ? 'Admin Console' : 'Intern Portal'} size="sm" />
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
              {links.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] px-4 mb-2">
                    {group.section}
                  </p>
                  {group.items.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-xs tracking-tight relative group",
                          isActive 
                            ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white font-black shadow-lg shadow-blue-600/25 scale-[1.01]" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-bold"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <link.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110 shrink-0", isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600")} />
                          <span>{link.name}</span>
                        </div>

                        {link.name === 'Messages' && hasNewMessage && !pathname.includes(link.href) && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md shadow-red-500/50" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer User & Sign Out */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 shrink-0">
            <button 
              onClick={handleLogout}
              className="flex items-center justify-between px-4 py-3 w-full rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 transition-all text-xs font-black group"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="uppercase tracking-wider">Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                {isAdmin ? 'Management Console' : 'Intern Portal'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              className="p-2.5 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {hasNewMessage && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
            
            <div className="h-9 px-3.5 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black border border-blue-200/60 dark:border-blue-800 text-[10px] uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>{isAdmin ? 'ADMINISTRATOR' : 'INTERN'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
