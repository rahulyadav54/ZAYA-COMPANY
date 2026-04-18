'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Send, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function InternSubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();

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
    
    // Certificate details
    const certFullName = formData.get('certFullName') as string;
    const certCollege = formData.get('certCollege') as string;
    const certDept = formData.get('certDept') as string;

    try {
      let fileUrl = '';

      // 1. Upload file if selected
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

      // 2. Insert into submissions table with 'pending' payment
      const { data: submission, error: submitError } = await supabase.from('submissions').insert({
        task_id: taskId,
        intern_id: userId,
        github_link: githubLink,
        message: message,
        file_url: fileUrl,
        review_status: 'pending',
        payment_status: 'pending',
        cert_full_name: certFullName,
        cert_college: certCollege,
        cert_dept: certDept
      }).select().single();

      if (submitError) throw submitError;

      // 3. Redirect to payment page
      router.push(`/intern/submit/payment/${submission.id}`);

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Step 1: Submit Your Work</h1>
        <p className="text-slate-400 mt-2 text-lg">Provide your project details and certificate information.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300">
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* Section: Certificate Information */}
          <div className="space-y-6 border-b border-white/5 pb-8">
            <h3 className="text-xl font-bold text-blue-500 flex items-center gap-2">
              <span className="bg-blue-500/10 p-2 rounded-lg">🎓</span>
              Certificate Information
            </h3>
            <div className="grid md:grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name (As on Certificate)</label>
                <input 
                  name="certFullName"
                  type="text" 
                  required
                  placeholder="Enter your legal full name"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-white/5 bg-black/20 focus:border-blue-500 focus:ring-0 transition-all text-white font-medium"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">College / University</label>
                <input 
                  name="certCollege"
                  type="text" 
                  required
                  placeholder="e.g. Salem Institute of Technology"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-white/5 bg-black/20 focus:border-blue-500 focus:ring-0 transition-all text-white font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Department / Field</label>
                <input 
                  name="certDept"
                  type="text" 
                  required
                  placeholder="e.g. Computer Science Engineering"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-white/5 bg-black/20 focus:border-blue-500 focus:ring-0 transition-all text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Project Submission */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-500 flex items-center gap-2">
              <span className="bg-blue-500/10 p-2 rounded-lg">🚀</span>
              Project Submission
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Select Assignment</label>
                <div className="relative">
                  <select 
                    required 
                    name="taskId" 
                    className="w-full px-5 py-4 rounded-2xl border-2 border-white/5 bg-black/20 focus:border-blue-500 focus:ring-0 transition-all text-white font-medium appearance-none"
                  >
                    <option value="">Select your task...</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-500 rotate-45" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">GitHub Link</label>
                <input 
                  name="githubLink"
                  type="url" 
                  required
                  placeholder="https://github.com/..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-white/5 bg-black/20 focus:border-blue-500 focus:ring-0 transition-all text-white font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Project Files / Documentation</label>
              <div className="relative group">
                <input
                  name="file"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                />
                <div className={`w-full px-6 py-12 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${fileName ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-black/10 group-hover:border-blue-500/50'}`}>
                  <Upload className={`h-10 w-10 mb-4 ${fileName ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-500'}`} />
                  <p className="text-lg font-bold text-white">
                    {fileName ? fileName : 'Drop your project archive here'}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 font-medium">ZIP, PDF or Images (Max 50MB)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Submission Notes</label>
              <textarea 
                name="message"
                required
                rows={4}
                placeholder="Tell us about your implementation details..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-white/5 bg-black/20 focus:border-blue-500 focus:ring-0 transition-all text-white font-medium resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting || tasks.length === 0}
              className="group relative w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 text-white rounded-[1.5rem] font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Saving details...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


