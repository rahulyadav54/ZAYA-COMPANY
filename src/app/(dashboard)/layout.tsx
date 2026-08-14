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
  IdCard
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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        // Detect Session Switch (Multiple Tabs)
        if (userId && user.id !== userId) {
          console.warn("Session switch detected. Logging out to prevent unauthorized portal access.");
          await supabase.auth.signOut();
          window.location.href = '/login?error=session_switched';
          return;
        }

        setUserId(user.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          console.error("Error fetching profile:", error);
          router.push('/login');
          return;
        }

        // Enforce strict role-based portal access
        if (profile.role === 'admin' && isInternPath) {
          console.log("Admin attempted to access intern portal. Redirecting to admin dashboard.");
          router.push('/admin');
          return;
        } 
        
        if (profile.role === 'intern' && isAdminPath) {
          console.log("Intern attempted to access admin portal. Access denied.");
          router.push('/intern');
          return;
        }

        if (profile.role !== 'admin' && profile.role !== 'intern') {
          await supabase.auth.signOut();
          router.push('/login?error=unauthorized_role');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push('/login');
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
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); 
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
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Applications', href: '/admin/applications', icon: FileText },
        { name: 'Manage Interns', href: '/admin/interns', icon: Users },
        { name: 'Submissions', href: '/admin/submissions', icon: CheckSquare },
        { name: 'User Management', href: '/admin/users', icon: ShieldCheck },
        { name: 'Messages', href: '/admin/messages', icon: Mail },
        { name: 'Manage Careers', href: '/admin/careers', icon: Briefcase },
        { name: 'Manage Magazine', href: '/admin/magazine', icon: Newspaper },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    : [
        { name: 'My Tasks', href: '/intern', icon: CheckSquare },
        { name: 'Submission', href: '/intern/submit', icon: FileText },
        { name: 'Messages', href: '/intern/messages', icon: Mail },
        { name: 'My Certificates', href: '/intern/certificates', icon: Award },
        { name: 'ID Card', href: '/intern/id-card', icon: IdCard },
        { name: 'My Profile', href: '/intern/profile', icon: User },
        { name: 'Settings', href: '/intern/settings', icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 lg:translate-x-0 lg:static lg:inset-0 shadow-sm",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Logo subtitle={isAdmin ? 'Admin Console' : 'Intern Portal'} size="sm" />
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-bold relative group",
                      isActive 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600")} />
                      <span>{link.name}</span>
                    </div>

                    {link.name === 'Messages' && hasNewMessage && !pathname.includes(link.href) && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md shadow-red-500/50" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <button 
              onClick={handleLogout}
              className="flex items-center justify-between px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 transition-all text-sm font-bold group"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Menu className="h-5 w-5" />
            </button>
            
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isAdmin ? 'Management Console' : 'Intern Portal'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  System 100% Operational • Supabase Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="h-5 w-5" />
              {hasNewMessage && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>
            
            <div className="h-10 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>{isAdmin ? 'ADMINISTRATOR' : 'INTERN'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
