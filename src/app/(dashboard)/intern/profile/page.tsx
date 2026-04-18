'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Shield, Camera, Save } from 'lucide-react';

export default function InternProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
        }
      }
    }
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      
      setUpdateSuccess(true);
      // Refresh profile data
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <button 
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 disabled:bg-blue-400 active:scale-95"
        >
          {isUpdating ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4" /> Update Profile
            </>
          )}
        </button>
      </div>

      {updateSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl text-green-600 dark:text-green-400 text-sm font-bold animate-in slide-in-from-top-2">
          Profile updated successfully!
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="p-10 flex flex-col sm:flex-row items-center gap-8 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-blue-600/20 border-4 border-white dark:border-slate-800">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl hover:text-blue-600 transition-all active:scale-90">
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{profile?.full_name || 'Loading...'}</h2>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">{profile?.role || 'Intern'}</p>
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
        </div>
      </div>
    </div>
  );
}
