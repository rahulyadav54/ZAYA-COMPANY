'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, Lock, MonitorSmartphone, Key, User, Mail, Save, CheckCircle2, Loader2 } from 'lucide-react';

export default function InternSettingsPage() {
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

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
      if (error) throw error;
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal information, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Personal Information</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Update your profile details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" /> Full Name
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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

          <div className="flex items-center justify-between">
            {updateSuccess && (
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" /> Profile Updated
              </div>
            )}
            <button 
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="ml-auto flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 disabled:bg-blue-400"
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Security Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl flex flex-col">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Security</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Password & Protection</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Password</p>
                    <p className="text-xs text-slate-500 font-medium">Last changed 30 days ago</p>
                  </div>
                </div>
                <button className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                  <Key className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl flex flex-col">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                <MonitorSmartphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Preferences</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Customize experience</p>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <label className="flex items-center justify-between p-6 rounded-3xl border-2 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-colors">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Notifications</p>
                    <p className="text-xs text-slate-500 font-medium">Task review updates</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
