'use client';

import React, { useEffect, useState } from 'react';
import { Upload, FileText, Send, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function InternSubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(true);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoadingScript(false);
    document.body.appendChild(script);

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

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentAndSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const taskId = formData.get('taskId') as string;
    const githubLink = formData.get('githubLink') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File;

    try {
      // 1. Create Razorpay Order
      const orderResponse = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 125 }), // Updated amount: 125 INR
      });
      const order = await orderResponse.json();

      if (order.error) throw new Error(order.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Zaya Company',
        description: 'Project Submission Fee',
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyResponse = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            await finalizeSubmission(taskId, githubLink, message, file, response.razorpay_payment_id);
          } else {
            alert('Payment verification failed. Please try again.');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: '', // Will be filled by user if needed
          email: '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const finalizeSubmission = async (taskId: string, githubLink: string, message: string, file: File, paymentId: string) => {
    let fileUrl = '';

    // Fetch user details for the email
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user?.id).single();
    const taskTitle = tasks.find(t => t.id.toString() === taskId)?.title || 'Assigned Project';

    // Upload file if selected
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
      review_status: 'pending',
      payment_id: paymentId,
      payment_status: 'paid'
    });

    if (!submitError) {
      await supabase.from('tasks').update({ status: 'submitted' }).eq('id', taskId);
      
      // Send Confirmation Email
      try {
        await fetch('/api/send-submission-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profile?.email || user?.email,
            fullName: profile?.full_name || 'Intern',
            taskTitle: taskTitle,
            paymentId: paymentId,
            amount: 125
          })
        });
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
      setFileName(null);
      window.location.reload(); 
    } else {
      alert(`Error submitting: ${submitError.message}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Final Project Submission</h1>
          <p className="text-slate-500 mt-2 text-lg">Complete your internship by submitting your work and processing the certificate fee.</p>
        </div>
        <div className="px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-blue-600">Fee: ₹125</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-900/5 overflow-hidden transition-all duration-300">
        <form onSubmit={handlePaymentAndSubmit} className="p-10 space-y-8">
          {isSuccess && (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 text-green-600 animate-in fade-in slide-in-from-top-4">
              <div className="bg-green-500 rounded-full p-1 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Success! Project Submitted.</p>
                <p className="text-sm opacity-90">Your payment was verified and submission recorded.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Select Assignment</label>
              <div className="relative">
                <select 
                  required 
                  name="taskId" 
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-blue-600 focus:ring-0 transition-all text-foreground font-medium appearance-none"
                >
                  <option value="">Select your task...</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">GitHub Link</label>
              <input 
                name="githubLink"
                type="url" 
                required
                placeholder="https://github.com/..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-blue-600 focus:ring-0 transition-all text-foreground font-medium"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Project Files / Documentation</label>
            <div className="relative group">
              <input
                name="file"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
              />
              <div className={`w-full px-6 py-12 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${fileName ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 group-hover:border-blue-600/50'}`}>
                <div className={`p-4 rounded-2xl mb-4 ${fileName ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 transition-colors'}`}>
                  <Upload className="h-10 w-10" />
                </div>
                <p className="text-lg font-bold text-foreground">
                  {fileName ? fileName : 'Drop your project archive here'}
                </p>
                <p className="text-sm text-slate-500 mt-2 font-medium">ZIP, PDF or Cloud Drive link (Max 50MB)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Submission Notes</label>
            <textarea 
              name="message"
              required
              rows={4}
              placeholder="Tell us about your implementation details..."
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:border-blue-600 focus:ring-0 transition-all text-foreground font-medium resize-none"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting || tasks.length === 0 || isLoadingScript}
              className="group relative w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-[1.5rem] font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>Pay ₹125 & Submit Project</span>
                  <Send className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium uppercase tracking-widest">Secure Payment Powered by Razorpay</p>
          </div>
        </form>
      </div>
    </div>
  );
}


