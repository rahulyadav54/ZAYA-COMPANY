'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Shield, Camera, Save } from 'lucide-react';

export default function InternProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold">
          <Save className="h-4 w-4" /> Update Profile
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 flex flex-col sm:flex-row items-center gap-8 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-3xl">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:text-blue-600 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{profile?.full_name || 'Loading...'}</h2>
            <p className="text-slate-500 capitalize">{profile?.role || 'Intern'}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Full Name
              </label>
              <input 
                type="text" 
                defaultValue={profile?.full_name}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" /> Email Address
              </label>
              <input 
                type="email" 
                disabled
                defaultValue={profile?.email}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
