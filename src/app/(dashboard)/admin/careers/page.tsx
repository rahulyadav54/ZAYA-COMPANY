'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Briefcase, 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const jobData = {
      title: formData.get('title') as string,
      type: formData.get('type') as string,
      location: formData.get('location') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      is_active: formData.get('is_active') === 'on',
    };

    let error;
    if (editingJob) {
      const { error: updateError } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', editingJob.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('jobs')
        .insert([jobData]);
      error = insertError;
    }

    if (!error) {
      setIsModalOpen(false);
      setEditingJob(null);
      fetchJobs();
    } else {
      alert(`Error: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  const deleteJob = async (id: number) => {
    if (confirm('Are you sure you want to delete this job listing?')) {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (!error) fetchJobs();
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Career Management</h1>
          <p className="text-sm text-slate-500">Post and manage job/internship opportunities</p>
        </div>
        <button 
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          <span>Post New Career</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No career opportunities posted yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{job.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <Tag className="h-3 w-3 mr-1" /> {job.type}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                          <MapPin className="h-3 w-3 mr-1" /> {job.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(job.id, job.is_active)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          job.is_active 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 hover:bg-red-200'
                        }`}
                      >
                        {job.is_active ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setEditingJob(job);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteJob(job.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {editingJob ? 'Edit Career Option' : 'Post New Career Option'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XCircle className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Position Title</label>
                <input 
                  required 
                  name="title"
                  defaultValue={editingJob?.title}
                  placeholder="e.g. Android Developer Intern"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Job Type</label>
                  <select 
                    name="type"
                    defaultValue={editingJob?.type || 'Internship'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Category</label>
                  <select 
                    name="category"
                    defaultValue={editingJob?.category || 'Tech'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none"
                  >
                    <option value="Tech">Tech / Engineering</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">Human Resources</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Location</label>
                <input 
                  required 
                  name="location"
                  defaultValue={editingJob?.location || 'Remote / Office'}
                  placeholder="e.g. Remote / Salem, India"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Description</label>
                <textarea 
                  required 
                  name="description"
                  rows={4}
                  defaultValue={editingJob?.description}
                  placeholder="Briefly describe the role and requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <input 
                  type="checkbox" 
                  name="is_active" 
                  id="is_active"
                  defaultChecked={editingJob ? editingJob.is_active : true}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-foreground">
                  Visible on public careers page
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingJob ? 'Save Changes' : 'Post Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
