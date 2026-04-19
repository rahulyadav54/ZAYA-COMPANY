'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Search, MoreVertical, Loader2, Download, CheckCircle, XCircle, Plus, X, Trash2, Upload, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState({ total: 0, new: 0, skipped: 0 });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    reader.onload = async (event) => {
      let data: any[] = [];
      
      if (fileExt === 'csv') {
        const text = event.target?.result as string;
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        data = result.data;
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws);
      }

      // Map common Google Form headers to our DB fields
      const mappedData = data.map(row => ({
        full_name: row['Full Name'] || row['Name'] || row['full_name'] || '',
        email: row['Email'] || row['Email Address'] || row['email'] || '',
        phone: row['Phone'] || row['Phone Number'] || row['phone'] || '',
        position: row['Position'] || row['Role'] || row['Which role are you applying for?'] || row['position'] || 'Intern',
        status: 'pending',
        applied_at: new Date().toISOString()
      })).filter(item => item.email && item.full_name);

      // Check for duplicates in existing applications
      const existingEmails = new Set(applications.map(a => a.email.toLowerCase()));
      const filtered = mappedData.filter(item => !existingEmails.has(item.email.toLowerCase()));
      
      setBulkData(filtered);
      setImportStats({
        total: mappedData.length,
        new: filtered.length,
        skipped: mappedData.length - filtered.length
      });
    };

    if (fileExt === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleBulkImport = async () => {
    if (bulkData.length === 0) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('applications')
      .insert(bulkData);

    if (error) {
      alert('Error during bulk import: ' + error.message);
    } else {
      alert(`Success! Imported ${bulkData.length} new applications.`);
      setShowBulkModal(false);
      setBulkData([]);
      fetchApplications();
    }
    setIsSubmitting(false);
  };

    setIsSubmitting(false);
  };

  const exportToCSV = () => {
    if (applications.length === 0) return;
    
    const exportData = applications.map(app => ({
      'Full Name': app.full_name,
      'Email': app.email,
      'Phone': app.phone,
      'Position': app.position,
      'Applied Date': new Date(app.applied_at).toLocaleString(),
      'Status': app.status.toUpperCase()
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Zaya_Applications_Export_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this application? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchApplications();
      alert('Application permanently deleted.');
    } catch (error: any) {
      console.error('Error deleting application:', error);
      alert('Delete failed: ' + (error.message || 'Unknown error'));
    }
  };

  const updateStatus = async (id: string, newStatus: string, appData?: any) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;

      if (newStatus === 'accepted' && appData) {
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
        } catch (err) {
          console.error('Failed to send email:', err);
        }
      }
      
      await fetchApplications();
      alert(`Successfully updated status to ${newStatus.toUpperCase()}`);
    } catch (error: any) {
      console.error('Error handling application decision:', error);
      alert('Action failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Job Applications</h1>
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
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <FileUp className="h-4 w-4" />
            Bulk Import
          </button>
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
                          <button 
                            onClick={() => deleteApplication(app.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border-l border-slate-100 dark:border-slate-800 ml-2 pl-4"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Add Application Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 rounded-xl">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Add Manual Application</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddApplication} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 00000 00000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Position Applying For</label>
                    <input 
                      required
                      type="text" 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="e.g. Android Developer Intern"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Portfolio / GitHub Link</label>
                    <input 
                      type="url" 
                      value={formData.portfolio_url}
                      onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Resume Link (Drive/Cloud)</label>
                    <input 
                      type="url" 
                      value={formData.resume_url}
                      onChange={(e) => setFormData({...formData, resume_url: e.target.value})}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cover Letter / Experience Notes</label>
                  <textarea 
                    rows={4}
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                    placeholder="Brief details about the candidate's skills and experience..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 rounded-xl">
                    <FileUp className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Bulk Import Interns</h2>
                </div>
                <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <p className="text-sm font-bold text-foreground">Click to upload CSV or Excel</p>
                  <p className="text-xs text-slate-500 mt-2">Exported from Google Forms</p>
                </div>

                {importStats.total > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Found:</span>
                      <span className="font-bold text-foreground">{importStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Already in System (Skipped):</span>
                      <span className="font-bold text-orange-600">{importStats.skipped}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-bold">New to Import:</span>
                      <span className="font-bold text-green-600">{importStats.new}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={bulkData.length === 0 || isSubmitting}
                    onClick={handleBulkImport}
                    className="flex-1 py-4 bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Import ${bulkData.length} Users`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
