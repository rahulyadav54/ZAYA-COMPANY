'use client';

import React from 'react';
import { Bell, Lock, MonitorSmartphone, Key } from 'lucide-react';

export default function InternSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* Security Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Security</h2>
              <p className="text-xs text-slate-500">Manage your password and security settings</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-semibold text-foreground text-sm">Change Password</p>
                <p className="text-xs text-slate-500">Last changed 30 days ago</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-foreground font-semibold text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Update
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Preferences</h2>
              <p className="text-xs text-slate-500">Customize your portal experience</p>
            </div>
          </div>

          <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-semibold text-foreground text-sm">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive updates about task reviews</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
          </label>
        </div>
      </div>
    </div>
  );
}
