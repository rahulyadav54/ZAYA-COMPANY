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

        // Enforce role-based access
        if (profile.role === 'admin' && isInternPath) {
          router.push('/admin');
        } else if (profile.role === 'intern' && isAdminPath) {
          router.push('/intern');
        } else if (profile.role !== 'admin' && profile.role !== 'intern') {
          // If role is neither, something is wrong
          router.push('/login');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:translate-x-0 lg:static lg:inset-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold tracking-tight">ZAYA CODE HUB</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium relative",
                  pathname === link.href 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.name === 'Messages' && hasNewMessage && !pathname.includes(link.href) && (
                  <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full" />
                )}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
              ZAYA CODE HUB Portal
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
              <Bell className="h-6 w-6" />
              {hasNewMessage && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold border border-blue-200 dark:border-blue-800">
              {isAdmin ? 'A' : 'I'}
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
