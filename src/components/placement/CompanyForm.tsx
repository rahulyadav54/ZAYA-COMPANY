'use client';

import { useState, useRef } from 'react';
import { X, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface CompanyFormData {
  id?: string;
  company_name: string;
  company_image: string;
  drive_link: string;
  description: string;
  category: string;
  status: string;
  display_order: number;
}

interface CompanyFormProps {
  initial?: Partial<CompanyFormData>;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = ['IT', 'Product', 'Service-Based', 'Testing', 'Other'];

export default function CompanyForm({ initial, onSuccess, onCancel }: CompanyFormProps) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<CompanyFormData>({
    company_name: initial?.company_name || '',
    company_image: initial?.company_image || '',
    drive_link: initial?.drive_link || '',
    description: initial?.description || '',
    category: initial?.category || 'IT',
    status: initial?.status || 'active',
    display_order: initial?.display_order || 0,
  });
  const [imagePreview, setImagePreview] = useState<string>(initial?.company_image || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/placement/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm(f => ({ ...f, company_image: data.url }));
      setImagePreview(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...form, id: initial!.id } : form;

      const res = await fetch('/api/admin/placement', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Company Name */}
      <div>
        <label className={labelClass}>Company Name *</label>
        <input type="text" className={inputClass} required value={form.company_name}
          onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
          placeholder="e.g. ZOHO, TCS, Infosys" />
      </div>

      {/* Image Upload */}
      <div>
        <label className={labelClass}>Company Image / Logo</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-800/50"
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="max-h-28 max-w-[180px] object-contain rounded-lg" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setImagePreview(''); setForm(f => ({ ...f, company_image: '' })); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 hover:bg-red-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs text-slate-500">Click to replace</p>
            </>
          ) : uploading ? (
            <><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /><p className="text-xs text-slate-500">Uploading...</p></>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-500">Click to upload logo</p>
              <p className="text-xs text-slate-400">JPG, PNG, WEBP — max 5MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description *</label>
        <textarea className={inputClass} required rows={3} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Brief description of what preparation materials are available..." />
      </div>

      {/* Drive Link */}
      <div>
        <label className={labelClass}>Google Drive Preparation Link *</label>
        <input type="url" className={inputClass} required value={form.drive_link}
          onChange={e => setForm(f => ({ ...f, drive_link: e.target.value }))}
          placeholder="https://drive.google.com/drive/folders/..." />
        <p className="mt-1 text-[10px] text-slate-400">This link is never shown to unpaid users.</p>
      </div>

      {/* Category + Status + Order */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Display Order</label>
          <input type="number" className={inputClass} value={form.display_order} min={0}
            onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving || uploading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-70">
          {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : isEdit ? '✓ Update Company' : '+ Save Company'}
        </button>
      </div>
    </form>
  );
}
