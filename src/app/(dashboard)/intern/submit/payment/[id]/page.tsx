'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    async function fetchSubmission() {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          tasks:task_id(title),
          profiles:intern_id(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching submission:', error);
      } else {
        setSubmission(data);
      }
      setIsLoading(false);
    }

    fetchSubmission();

    return () => {
      document.body.removeChild(script);
    };
  }, [id]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create Razorpay Order
      const orderResponse = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 125 }),
      });
      const order = await orderResponse.json();

      if (order.error) throw new Error(order.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Zaya Company',
        description: `Certificate Fee for ${submission.tasks?.title}`,
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
            await finalizePayment(response.razorpay_payment_id);
          } else {
            alert('Payment verification failed.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: submission.profiles?.full_name || '',
          email: submission.profiles?.email || '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function() { setIsProcessing(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const finalizePayment = async (paymentId: string) => {
    // 1. Update status in Supabase
    const { error } = await supabase
      .from('submissions')
      .update({ 
        payment_status: 'paid', 
        payment_id: paymentId 
      })
      .eq('id', id);

    if (error) {
      alert('Error updating payment record. Please contact support.');
      return;
    }

    // 2. Update task status
    await supabase.from('tasks').update({ status: 'submitted' }).eq('id', submission.task_id);

    // 3. Send confirmation email
    try {
      await fetch('/api/send-submission-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: submission.profiles?.email,
          fullName: submission.profiles?.full_name,
          taskTitle: submission.tasks?.title,
          paymentId: paymentId,
          amount: 125
        })
      });
    } catch (e) {
      console.error('Email notification failed');
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.push('/intern/submissions'); // Redirect to submissions list
    }, 3000);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-slate-500 font-medium">Loading payment details...</p>
    </div>
  );

  if (!submission) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <h2 className="text-2xl font-bold">Submission Not Found</h2>
      <p className="text-slate-500">We couldn't find the project details you're looking for.</p>
    </div>
  );

  if (isSuccess) return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="bg-green-500/10 p-6 rounded-full">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
      </div>
      <h1 className="text-4xl font-black text-white">Payment Successful!</h1>
      <p className="text-slate-400 text-lg">Your project has been officially submitted. Redirecting you to your submissions...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Step 2: Complete Payment</h1>
        <p className="text-slate-400 text-lg">Process the certificate and processing fee to finalize your submission.</p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Intern Name</p>
                <p className="text-xl font-bold text-white">{submission.profiles?.full_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Project Task</p>
                <p className="text-xl font-bold text-white">{submission.tasks?.title}</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-3xl p-8 space-y-4">
              <div className="flex justify-between text-slate-400">
                <span>Certification Fee</span>
                <span>₹100.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing & Hosting</span>
                <span>₹25.00</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total Amount</span>
                <span className="text-3xl font-black text-blue-500">₹125.00</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 text-white rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/30 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6" />
                  <span>Pay Now</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-green-500/50" />
              <span>Secure Encrypted Payment by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
