'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Search, MoreVertical, Loader2, Download, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    portfolio_url: '',
    resume_url: '',
    cover_letter: ''
  });

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (!error && data) {
      setApplications(data);
    }
    setIsLoading(false);
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase
      .from('applications')
      .insert([
        { 
          ...formData, 
          status: 'pending',
          applied_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      alert('Error adding application: ' + error.message);
    } else {
      setShowAddModal(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        portfolio_url: '',
        resume_url: '',
        cover_letter: ''
      });
      fetchApplications();
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: number, newStatus: string, appData?: any) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      if ((newStatus === 'accepted' || newStatus === 'rejected') && appData) {
        try {
          await fetch('/api/send-acceptance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: appData.email,
              fullName: appData.full_name,
              position: appData.position,
              status: newStatus
            }),
          });
          alert(`Success! Application ${newStatus} and email sent to ${appData.email}`);
        } catch (err) {
          console.error('Failed to send email:', err);
          alert(`Application ${newStatus}, but there was an error sending the confirmation email.`);
        }
      }
      fetchApplications();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Job Applications</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search applicants..." 
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search applicants..." 
              className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 w-full sm:w-64 text-foreground"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Applied</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{app.full_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{app.email}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{app.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground text-sm font-medium">
                        {app.position}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(app.applied_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                          app.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                          'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              const el = document.getElementById(`details-${app.id}`);
                              if (el) el.classList.toggle('hidden');
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Full Questionnaire Details"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {app.resume_url && (
                            <a 
                              href={app.resume_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Download Resume"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => updateStatus(app.id, 'accepted', app)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Accept Intern"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus(app.id, 'rejected', app)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Reject Intern"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr id={`details-${app.id}`} className="hidden bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="max-w-3xl">
                          <h4 className="text-sm font-bold text-foreground mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Full Questionnaire Responses</h4>
                          {app.portfolio_url && (
                            <p className="text-sm mb-4">
                              <span className="font-semibold text-slate-500">Portfolio/GitHub:</span>{' '}
                              <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{app.portfolio_url}</a>
                            </p>
                          )}
                          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            {app.cover_letter || 'No details provided.'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
