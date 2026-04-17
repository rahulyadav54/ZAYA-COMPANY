'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Code2, Lock, Mail, Loader2, ArrowRight, AlertCircle, CheckCircle2, User, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. SECURITY CHECK: Verify if the email is in the 'applications' table and is 'accepted'
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('status')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (appError || !application) {
        throw new Error('No application found for this email. Please apply for a position first.');
      }

      if (application.status !== 'accepted') {
        throw new Error(`Your application status is "${application.status}". You can only register once your application is ACCEPTED.`);
      }

      // 2. Proceed with registration since they are accepted
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // 3. Create profile entry (Trigger might handle this, but we'll be safe)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email.toLowerCase().trim(),
            full_name: fullName,
            role: 'intern'
          });

        if (profileError) console.error('Profile creation warning:', profileError);

        setSuccess('Registration successful! Please check your email for a confirmation link, then you can log in.');
        setTimeout(() => router.push('/login'), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
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
          <h1 className="text-2xl font-bold text-foreground">Intern Registration</h1>
          <p className="text-foreground mt-2">Create your portal account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
              Registration is restricted. You can only create an account if your application has been officially <strong>ACCEPTED</strong> by our team.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center space-x-3 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all text-foreground"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 mt-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-blue-400 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>Complete Registration <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-foreground">
              Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
