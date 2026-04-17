'use client';

import React from 'react';
import { Settings, Save, Bell, Shield, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <Settings className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">General Configuration</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Company Name</label>
            <input 
              type="text" 
              defaultValue="ZAYA CODE HUB"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Support Email</label>
            <input 
              type="email" 
              defaultValue="admin@zayacodehub.com"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          </div>
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
            <span className="text-sm font-medium text-foreground">Email on new application</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
            <span className="text-sm font-medium text-foreground">Weekly intern digest</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
          </label>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium text-foreground border border-slate-200 dark:border-slate-800">
              Manage Allowed IP Addresses
            </button>
            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium text-red-600 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
              Force Password Reset for All Interns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
