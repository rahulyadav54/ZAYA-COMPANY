'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Send, CheckCircle2, Upload } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface ApplicationFormProps {
  position: string;
  onSuccess: () => void;
}

export default function ApplicationForm({ position, onSuccess }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Gather form data
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const portfolio = formData.get('portfolio') as string;
    const location = formData.get('location') as string;
    const startDate = formData.get('startDate') as string;
    const isEnrolled = formData.get('isEnrolled') as string;
    const major = formData.get('major') as string;
    const experience = formData.get('experience') as string;
    const tools = formData.get('tools') as string;
    const confidence = formData.get('confidence') as string;
    const resumeFile = (formData.get('resume') as File) || null;

    // Form Validation
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(fullName)) {
      alert('Please enter a valid full name (letters and spaces only).');
      setIsSubmitting(false);
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number (10-15 digits, optional + prefix).');
      setIsSubmitting(false);
      return;
    }

    // Upload resume if present
    let resumeUrl = '';
    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > 5 * 1024 * 1024) {
         alert('Resume file is too large. Maximum size is 5MB.');
         setIsSubmitting(false);
         return;
      }
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Date.now()}_${fullName.replace(/\s+/g, '_')}.${fileExt}`;
      const { data, error } = await supabase.storage.from('resumes').upload(fileName, resumeFile, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        console.error('Resume upload error:', error);
        alert(`Failed to upload resume: ${error.message}. Please ensure the Storage Bucket RLS is configured correctly.`);
        setIsSubmitting(false);
        return;
      }
      resumeUrl = `${supabaseUrl}/storage/v1/object/public/resumes/${data?.path}`;
    }

    // Insert application record
    const { error: insertError } = await supabase.from('applications').insert({
      full_name: fullName,
      email,
      phone,
      position: position,
      resume_url: resumeUrl,
      portfolio_url: portfolio,
      // Store all the extra questionnaire data in a JSONB column or format it into the cover_letter for now
      // since we don't know if the user added these columns to the DB yet. 
      // To prevent crashing, we will combine the answers into the cover_letter field as a structured string.
      cover_letter: `Location: ${location}
Start Date: ${startDate}
Enrolled in Degree: ${isEnrolled}
Major: ${major}
Experience: ${experience}
Proficient Tools: ${tools}
Code Confidence: ${confidence}/10`,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      alert(`Failed to submit application: ${insertError.message}`);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Application Submitted!</h3>
        <p className="text-foreground">
          Thank you for applying for the <span className="font-bold text-blue-600">{position}</span> role. 
          We have received your application and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Full Name</label>
          <input
            required
            name="fullName"
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Email Address</label>
          <input
            required
            name="email"
            type="email"
            placeholder="zayacodehub@gmail.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Phone Number</label>
          <input
            required
            name="phone"
            type="tel"
            placeholder="+91 7033399183"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Current Location (City/State)</label>
          <input
            required
            name="location"
            type="text"
            placeholder="Salem, Tamil Nadu"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Expected Internship Start Date</label>
          <input
            required
            name="startDate"
            type="date"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Currently enrolled in a degree program?</label>
          <select
            required
            name="isEnrolled"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Primary educational background/major</label>
        <input
          required
          name="major"
          type="text"
          placeholder="e.g. Computer Science"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Years of experience (personal or academic projects count) with relevant tools/Android Development</label>
        <select
          required
          name="experience"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
        >
          <option value="">Select experience level...</option>
          <option value="Less than 1 year">Less than 1 year</option>
          <option value="1-2 years">1-2 years</option>
          <option value="2+ years">2+ years</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Please select/list the development tools/languages you are proficient in:</label>
        <input
          required
          name="tools"
          type="text"
          placeholder="e.g. Kotlin, Java, React Native, Git"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">How would you rate your confidence in writing clean, documented code? (1-10)</label>
        <input
          required
          name="confidence"
          type="number"
          min="1"
          max="10"
          placeholder="10"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Link to your portfolio, GitHub, or relevant projects (Optional)</label>
        <input
          name="portfolio"
          type="url"
          placeholder="https://github.com/yourusername"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Upload Your Latest Resume/CV (PDF preferred)</label>
        <div className="relative group">
          <input
            required
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFileName(e.target.files[0].name);
              } else {
                setFileName(null);
              }
            }}
          />
          <div className={`w-full px-4 py-8 rounded-xl border-2 border-dashed ${fileName ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'} flex flex-col items-center justify-center group-hover:border-blue-600/50 transition-all`}>
            <Upload className={`h-8 w-8 mb-2 transition-colors ${fileName ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            <p className="text-sm text-foreground font-bold text-center">
              {fileName ? `Selected: ${fileName}` : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-foreground mt-1 font-bold">PDF, DOC (Max 5MB)</p>
          </div>
        </div>
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-blue-600/20"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting Application...
          </>
        ) : (
          <>
            Submit Application <Send className="ml-2 h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
