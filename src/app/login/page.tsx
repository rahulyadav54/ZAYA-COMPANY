'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Code2, Lock, Mail, Loader2, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

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

        const targetPath = profile?.role === 'admin' ? '/admin' : '/intern';
        console.log('Forcing hard redirect to:', targetPath);
        
        // Use a hard redirect to bypass any potential client-side routing issues
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Code2 className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold tracking-tight text-foreground">
              ZAYA<span className="text-blue-600">CODE</span>HUB
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Portal Login</h1>
          <p className="text-foreground mt-2">Sign in to ZAYA CODE HUB Portal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center space-x-3 text-green-600 dark:text-red-400 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@zayacodehub.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-blue-600 hover:underline disabled:text-slate-400"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-foreground">
              Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Note: Registration is only open for accepted applicants.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
