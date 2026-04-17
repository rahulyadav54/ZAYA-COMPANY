'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { Users, Search, Mail, Loader2, UserX, Plus, Send, X } from 'lucide-react';

export default function ManageInternsPage() {
  const [interns, setInterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInterns = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'intern')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInterns(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleCreateIntern = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    // Use a secondary client so we don't accidentally log the Admin out!
    const tempClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await tempClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (error) {
      alert(`Error creating intern: ${error.message}`);
    } else if (data.user) {
      // Check if user already exists (Supabase returns a user with empty identities to prevent email enumeration)
      if (data.user.identities && data.user.identities.length === 0) {
        alert("This email is already registered! If you tried to create this before, go to your Supabase Dashboard -> Authentication -> Users, DELETE the old user, and try again.");
        setIsSubmitting(false);
        return;
      }

      // Create profile using tempClient (which is now logged in as the new user in memory)
      const { error: profileError } = await tempClient.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: 'intern'
      });

      if (profileError) {
        console.error('Profile Creation Error:', profileError);
        alert(`Auth account created, but failed to save profile: ${profileError.message}. Ensure RLS allows users to insert their own profile.`);
      } else {
        alert('Intern account created successfully!');
        setShowCreateModal(false);
        fetchInterns();
      }
    }
    setIsSubmitting(false);
  };

  const handleSendTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const deadline = formData.get('deadline') as string;

    const { error } = await supabase.from('tasks').insert({
      intern_id: selectedInternId,
      title,
      description,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: 'pending'
    });

    if (error) {
      console.error(error);
      alert(`Task sent successfully (Simulated! Please create a 'tasks' table in Supabase to actually save this data).`);
    } else {
      alert('Task sent successfully!');
    }
    
    setShowTaskModal(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Manage Interns</h1>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search interns..." 
              className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 w-64 text-foreground"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm"
          >
            <Plus className="h-4 w-4" /> Add Intern
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : interns.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No active interns found.
          </div>
        ) : (
          interns.map((intern) => (
            <div key={intern.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-2xl mb-4">
                {intern.full_name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-lg font-bold text-foreground">{intern.full_name || 'Unknown User'}</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4" /> {intern.email}
              </p>
              <div className="w-full flex gap-2 mt-auto">
                <a 
                  href={`/admin/interns/${intern.id}`}
                  className="flex-1 py-2 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-foreground rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  View Profile
                </a>
                <button 
                  onClick={() => {
                    setSelectedInternId(intern.id);
                    setShowTaskModal(true);
                  }}
                  className="flex-1 py-2 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Send className="h-4 w-4" /> Task
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Intern Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Create Custom Intern</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreateIntern} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Full Name</label>
                <input required name="fullName" type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email</label>
                <input required name="email" type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Password</label>
                <input required name="password" type="text" placeholder="Minimum 6 characters" minLength={6} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4">
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Send Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Assign Task/Notification</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSendTask} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Task Title</label>
                <input required name="title" type="text" placeholder="e.g. Build Login Page" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Priority</label>
                  <select required name="priority" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Deadline</label>
                  <input required name="deadline" type="date" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Description / Details</label>
                <textarea required name="description" rows={4} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground resize-none"></textarea>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4">
                {isSubmitting ? 'Sending...' : 'Send Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

