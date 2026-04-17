'use client';

import React, { useEffect, useState } from 'react';
import { Upload, FileText, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function InternSubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('intern_id', user.id)
          .neq('status', 'completed');
        if (data) setTasks(data);
      }
    }
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const taskId = formData.get('taskId') as string;
    const githubLink = formData.get('githubLink') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File;

    let fileUrl = '';

    // Upload file if selected (reusing resumes bucket for simplicity)
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const newFileName = `submission_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(newFileName, file);
      
      if (!uploadError && uploadData) {
        fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${uploadData.path}`;
      }
    }

    // Insert into submissions table
    const { error: submitError } = await supabase.from('submissions').insert({
      task_id: taskId,
      intern_id: userId,
      github_link: githubLink,
      message: message,
      file_url: fileUrl,
      review_status: 'pending'
    });

    if (!submitError) {
      // Update task status
      await supabase.from('tasks').update({ status: 'submitted' }).eq('id', taskId);
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
      e.currentTarget.reset();
      setFileName(null);
    } else {
      alert(`Error submitting: ${submitError.message}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Task Submission</h1>
        <p className="text-slate-500 mt-2">Submit your completed assignments for review.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {isSuccess && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Task submitted successfully! Your mentor will review it shortly.</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Select Task</label>
            <select required name="taskId" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-foreground">
              <option value="">Choose a task...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">GitHub Repository Link</label>
            <input 
              name="githubLink"
              type="url" 
              placeholder="https://github.com/yourusername/repo"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Upload Files (Optional)</label>
            <div className="relative group">
              <input
                name="file"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
              />
              <div className={`w-full px-4 py-8 rounded-xl border-2 border-dashed ${fileName ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'} flex flex-col items-center justify-center group-hover:border-blue-600/50 transition-all`}>
                <Upload className={`h-8 w-8 mb-2 transition-colors ${fileName ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <p className="text-sm text-foreground font-bold">
                  {fileName ? `Selected: ${fileName}` : 'Click to upload files'}
                </p>
                <p className="text-xs text-slate-500 mt-1">ZIP, PDF, images (Max 10MB)</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Additional Notes</label>
            <textarea 
              name="message"
              required
              rows={4}
              placeholder="Any challenges you faced or specific things you want reviewed..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-foreground resize-none"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || tasks.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-5 w-5" /> Submit Work</>}
          </button>
        </form>
      </div>
    </div>
  );
}

