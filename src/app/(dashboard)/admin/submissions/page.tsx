'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle, XCircle, Search, FileText, Download, Code } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      setIsLoading(true);
      // Fetch submissions and join with profiles and tasks to get names/titles
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:intern_id(full_name, email),
          tasks:task_id(title)
        `)
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        setSubmissions(data);
      }
      setIsLoading(false);
    }
    fetchSubmissions();
  }, []);

  const updateReviewStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ review_status: status })
      .eq('id', id);

    if (error) {
      alert(`Failed to update status: ${error.message}`);
    } else {
      setSubmissions(submissions.map(s => s.id === id ? { ...s, review_status: status } : s));
    }
  };

  const handleSaveFeedback = async (id: string) => {
    const scoreInput = document.getElementById(`score-${id}`) as HTMLInputElement;
    const feedbackInput = document.getElementById(`feedback-${id}`) as HTMLInputElement;
    
    if (!scoreInput || !feedbackInput) return;

    const score = parseInt(scoreInput.value);
    const feedback = feedbackInput.value;

    const { error } = await supabase
      .from('submissions')
      .update({ score, feedback, review_status: 'reviewed' })
      .eq('id', id);

    if (error) {
      alert(`Error saving feedback: ${error.message}`);
    } else {
      alert('Feedback saved successfully!');
      setSubmissions(submissions.map(s => s.id === id ? { ...s, score, feedback, review_status: 'reviewed' } : s));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Review Submissions</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search submissions..." 
            className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 w-full sm:w-64 text-foreground"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Intern</th>
                <th className="px-6 py-4">Task Title</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No submissions found yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <React.Fragment key={sub.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{sub.profiles?.full_name || 'Unknown Intern'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{sub.profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground text-sm font-medium">
                        {sub.tasks?.title || 'Unknown Task'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          sub.review_status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                          sub.review_status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                          sub.review_status === 'revision' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                          sub.review_status === 'reviewed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                          'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        }`}>
                          {(sub.review_status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sub.payment_status === 'paid' ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md w-fit">PAID</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1">{sub.payment_id}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">Unpaid / N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              const el = document.getElementById(`sub-details-${sub.id}`);
                              if (el) el.classList.toggle('hidden');
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Submission Details"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => updateReviewStatus(sub.id, 'approved')}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => updateReviewStatus(sub.id, 'revision')}
                            className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Request Revision"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr id={`sub-details-${sub.id}`} className="hidden bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="max-w-3xl space-y-4">
                          <h4 className="text-sm font-bold text-foreground border-b border-slate-200 dark:border-slate-700 pb-2">Submission Details</h4>
                          
                          {sub.github_link && (
                            <p className="flex items-center gap-2 text-sm">
                              <Code className="h-4 w-4 text-slate-500" />
                              <span className="font-semibold text-slate-500">Repository:</span>{' '}
                              <a href={sub.github_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{sub.github_link}</a>
                            </p>
                          )}
                          
                          {sub.file_url && (
                            <p className="flex items-center gap-2 text-sm">
                              <Download className="h-4 w-4 text-slate-500" />
                              <span className="font-semibold text-slate-500">Attachment:</span>{' '}
                              <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Download Attached File</a>
                            </p>
                          )}

                          <div>
                            <span className="font-semibold text-slate-500 text-sm">Notes from Intern:</span>
                            <div className="mt-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                              {sub.message || 'No additional notes provided.'}
                            </div>
                          </div>

                          <div className="pt-4 flex gap-3">
                            <input id={`score-${sub.id}`} defaultValue={sub.score || ''} type="number" placeholder="Score (0-100)" className="w-32 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600" />
                            <input id={`feedback-${sub.id}`} defaultValue={sub.feedback || ''} type="text" placeholder="Add feedback comment..." className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600" />
                            <button onClick={() => handleSaveFeedback(sub.id)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">Save Feedback</button>
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
