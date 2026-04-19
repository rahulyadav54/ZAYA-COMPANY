'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Code2, Lock, Mail, Loader2, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-redirect if already logged in
  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'session_switched') {
      setError('Your session was switched in another tab. Please sign in again.');
    } else if (errorType === 'unauthorized_role') {
      setError('You do not have permission to access that portal.');
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        const nextPath = searchParams.get('next');
        const targetPath = nextPath || (profile?.role === 'admin' ? '/admin' : '/intern');
        window.location.href = targetPath;
      }
    };
    checkUser();
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Attempting login for:', email);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }

      console.log('Auth successful, user ID:', data.user?.id);

      if (data.user) {
        // Fetch role from profiles
        console.log('Fetching profile...');
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile Fetch Error:', profileError);
          setError(`Database Error: ${profileError.message}`);
          return;
        }

        // Auto-create profile if missing (Self-Healing)
        if (!profile) {
          console.log('Profile missing, auto-creating...');
          const userEmail = data.user.email || email;
          const fullName = data.user.user_metadata?.full_name || 'Portal User';
          const defaultRole = (userEmail.toLowerCase().includes('admin') || userEmail === 'zayacodehub@gmail.com') ? 'admin' : 'intern';
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: userEmail,
              full_name: fullName,
              role: defaultRole
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile Creation Error:', createError);
            setError(`Failed to initialize profile: ${createError.message}`);
            return;
          }
          console.log('Profile created:', newProfile);
          profile = newProfile;
        }

        // Track Login Activity
        try {
          await supabase.rpc('track_login', { user_id: data.user.id });
        } catch (e) { console.error('Login tracking failed', e); }

        const nextPath = searchParams.get('next');
        const targetPath = nextPath || (profile?.role === 'admin' ? '/admin' : '/intern');
        console.log('Redirecting to:', targetPath);
        
        window.location.href = targetPath;
      }
    } catch (err: any) {
      console.error('Catch-all Login error:', err);
      setError(err.message || err.error_description || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/reset-password`,
      });

      if (resetError) throw resetError;
      setSuccess('Password recovery email sent! Please check your inbox.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send recovery email';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-slate-950">
      
      {/* Left Branding Pane (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-[#002855] text-white p-12 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px]" />
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIweiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+')] opacity-20" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center">
               <img src="/logo.png" alt="Zaya Code Hub" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-2xl font-black tracking-widest text-white uppercase">
              Zaya<span className="text-blue-400">Code</span>Hub
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black mb-6 leading-tight">Secure Access to Your Workspace</h1>
          <p className="text-lg text-blue-100/80 leading-relaxed mb-8">
            Manage your internships, track project progress, and access verified certificates all in one centralized hub.
          </p>
          <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-blue-300">
             <div className="w-12 h-[2px] bg-blue-500" />
             Internship Portal
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-blue-200/50">© {new Date().getFullYear()} Zaya Code Hub. All rights reserved.</p>
        </div>
      </div>

      {/* Right Login Pane */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Code2 className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-black tracking-tight text-foreground uppercase">
                Zaya<span className="text-blue-600">Code</span>Hub
              </span>
            </Link>
            <h1 className="text-3xl font-black text-foreground">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Please enter your credentials to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center space-x-3 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="font-medium">{success}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@zayacodehub.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-all text-foreground font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:text-slate-400"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-all text-foreground font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 mt-4 rounded-2xl bg-[#002855] text-white font-black text-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all flex items-center justify-center shadow-[0_10px_20px_rgba(0,40,85,0.2)] hover:shadow-[0_15px_25px_rgba(37,99,235,0.3)] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>Sign In Securely <ArrowRight className="ml-3 h-5 w-5" /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-900 py-3 px-4 rounded-xl inline-block">
              Access restricted to authorized team members and interns.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
