'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Shield, Camera, Save, Code2, Award, ExternalLink } from 'lucide-react';

export default function InternProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [hackerrankUsername, setHackerrankUsername] = useState('');
  const [leetcodeStats, setLeetcodeStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { getActiveUser } = await import('@/lib/getActiveUser');
      const user = await getActiveUser();
      if (user) {
        let p: any = null;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        p = data;

        if (!p && user.email) {
          const { data: pEmail } = await supabase.from('profiles').select('*').eq('email', user.email).maybeSingle();
          p = pEmail;
        }

        if (p) {
          setProfile({ ...p, ...user.user_metadata });
          setFullName(p.full_name || '');
          setLeetcodeUsername(p.leetcode_username || '');
          setHackerrankUsername(p.hackerrank_username || '');

          if (p.leetcode_username) {
            fetchLeetcodeStats(p.leetcode_username);
          }
        } else {
          setProfile({ email: user.email, full_name: user.user_metadata?.full_name || 'Intern', role: 'intern' });
          setFullName(user.user_metadata?.full_name || 'Intern');
        }
      }
    }
    loadProfile();
  }, []);

  const fetchLeetcodeStats = async (uname: string) => {
    if (!uname.trim()) return;
    setIsLoadingStats(true);
    try {
      const res = await fetch(`/api/coding-stats?username=${encodeURIComponent(uname.trim())}&platform=leetcode`);
      const data = await res.json();
      setLeetcodeStats(data);
    } catch (e) {
      console.warn('Fetch LeetCode stats notice:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${filePath}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }));

      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });

      alert('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Avatar upload notice:', err);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const { getActiveUser } = await import('@/lib/getActiveUser');
      const user = await getActiveUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            leetcode_username: leetcodeUsername.trim(),
            hackerrank_username: hackerrankUsername.trim(),
            updated_at: new Date().toISOString()
          });

        if (!error) {
          setUpdateSuccess(true);
          setTimeout(() => setUpdateSuccess(false), 3000);
          if (leetcodeUsername.trim()) {
            fetchLeetcodeStats(leetcodeUsername.trim());
          }
        }
      }
    } catch (e) {
      console.error('Update profile notice:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Intern Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Manage your personal credentials, LeetCode & HackerRank coding accounts.</p>
        </div>
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Profile
            </>
          )}
        </button>
      </div>

      {updateSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl text-green-600 dark:text-green-400 text-sm font-bold animate-in slide-in-from-top-2">
          Profile & Coding Accounts updated successfully!
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="p-10 flex flex-col sm:flex-row items-center gap-8 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            <div className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-5xl shadow-xl shadow-blue-600/20 border-4 border-white dark:border-slate-800 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || 'U'
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl hover:text-blue-600 transition-all active:scale-90 cursor-pointer">
              <Camera className="h-5 w-5" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            </label>
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{profile?.full_name || 'Loading...'}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800/50">
                Active Intern
              </span>
              <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 dark:border-slate-800">
                {profile?.role || 'Intern'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" /> Full Name
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-600/50 transition-all text-foreground font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" /> Email Address
              </label>
              <input 
                type="email" 
                disabled
                value={profile?.email || ''}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 cursor-not-allowed font-bold"
              />
            </div>
          </div>

          {/* HACKERRANK & LEETCODE INTEGRATION SECTION */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Algorithmic Skill Integration</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">LeetCode & HackerRank Accounts</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <label className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🟡 LeetCode Username</span>
                </label>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  placeholder="e.g. rahul_code54"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-3 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🟢 HackerRank Username</span>
                </label>
                <input
                  type="text"
                  value={hackerrankUsername}
                  onChange={(e) => setHackerrankUsername(e.target.value)}
                  placeholder="e.g. rahul_zaya54"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* LIVE LEETCODE STATS CARD */}
            {leetcodeUsername && (
              <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl border border-slate-800 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Live LeetCode Benchmark</h4>
                  </div>
                  <a
                    href={`https://leetcode.com/u/${leetcodeUsername}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest underline flex items-center gap-1"
                  >
                    <span>Official Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {isLoadingStats ? (
                  <div className="py-4 text-center text-slate-400 text-xs font-bold">Fetching Live Stats...</div>
                ) : leetcodeStats ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Solved</span>
                      <span className="text-2xl font-black text-white">{leetcodeStats.totalSolved || 0}</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest block">Easy</span>
                      <span className="text-2xl font-black text-emerald-400">{leetcodeStats.easySolved || 0}</span>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
                      <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">Medium</span>
                      <span className="text-2xl font-black text-amber-400">{leetcodeStats.mediumSolved || 0}</span>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                      <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest block">Hard</span>
                      <span className="text-2xl font-black text-red-400">{leetcodeStats.hardSolved || 0}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Enter a valid username to load live problem counts.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
