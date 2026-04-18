'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, CheckCircle2, ShieldCheck, AlertCircle, QrCode, Upload, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const UPI_ID = "zayacodehub@okhdfcbank";
  const ACCOUNT_NAME = "ZAYA CODE HUB";

  // Dynamic QR Code generation for UPI
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(ACCOUNT_NAME)}&am=125&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  useEffect(() => {
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
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      alert('Please upload a payment screenshot first.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Upload Screenshot to Supabase Storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${id}-${Math.random()}.${fileExt}`;
      const filePath = `payment_proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, screenshot);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      // 2. Update status in Supabase
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ 
          payment_status: 'pending_verification', 
          payment_id: `MANUAL-${Date.now()}`,
          payment_proof_url: publicUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. Update task status
      await supabase.from('tasks').update({ status: 'submitted' }).eq('id', submission.task_id);

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/intern'); // Fixed redirect to main dashboard
      }, 4000);

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsProcessing(false);
    }
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
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-6">
      <div className="bg-blue-500/10 p-6 rounded-full">
        <Loader2 className="h-20 w-20 text-blue-500 animate-spin" />
      </div>
      <h1 className="text-4xl font-black text-white">Verification Pending</h1>
      <p className="text-slate-400 text-lg">
        Thank you! Your payment screenshot has been uploaded. Our team will verify it within 12-24 hours and issue your certificate.
      </p>
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 px-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Step 2: Payment & Verification</h1>
        <p className="text-slate-400 text-lg">Pay via UPI and upload the screenshot to complete your submission.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Order Summary & QR */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <QrCode className="text-blue-500" /> 1. Pay via UPI
            </h3>
            
            <div className="flex flex-col items-center gap-6">
              {/* Dynamic QR Code */}
              <div className="relative p-6 bg-white rounded-[2rem] shadow-2xl">
                <div className="w-48 h-48 relative">
                   <img src={qrCodeUrl} alt="UPI QR Code" className="w-full h-full" />
                </div>
                <div className="mt-4 text-center">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Scan with any UPI App</p>
                    <div className="flex justify-center gap-2 mt-2">
                       <div className="h-4 w-4 bg-blue-600 rounded-sm" />
                       <div className="h-4 w-4 bg-orange-500 rounded-sm" />
                       <div className="h-4 w-4 bg-green-500 rounded-sm" />
                    </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Holder</p>
                  <p className="text-white font-bold">{ACCOUNT_NAME}</p>
                </div>

                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UPI ID</p>
                    <p className="text-white font-bold">{UPI_ID}</p>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-blue-400"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6">
             <div className="flex gap-4">
                <AlertCircle className="text-blue-500 h-6 w-6 shrink-0" />
                <p className="text-sm text-blue-100 leading-relaxed">
                  Make sure to pay exactly <span className="font-bold text-white">₹125.00</span>. Any other amount might delay the verification process.
                </p>
             </div>
          </div>
        </div>

        {/* Right Side: Upload Proof */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="text-green-500" /> 2. Upload Screenshot
            </h3>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center gap-4 ${
                previewUrl ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              {previewUrl ? (
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <Image src={previewUrl} alt="Screenshot Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold">Change Image</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-white/5 rounded-full">
                    <Upload className="h-10 w-10 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Click to Upload</p>
                    <p className="text-slate-500 text-sm">Upload payment success screenshot (JPG, PNG)</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSubmitPayment}
              disabled={isProcessing || !screenshot}
              className="w-full mt-8 py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-slate-500 text-white rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/30 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Uploading Proof...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-6 w-6" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-slate-500 text-sm font-medium pt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-500/50" />
          <span>Manual Verification Secure</span>
        </div>
        <div className="w-1 h-1 bg-slate-700 rounded-full" />
        <span>24/7 Support Available</span>
      </div>
    </div>
  );
}

