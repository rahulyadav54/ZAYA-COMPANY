'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Loader2, 
  XCircle,
  Clock,
  User,
  Tag,
  Upload
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function AdminMagazinePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    let imageUrl = editingPost?.image_url || '';

    // Upload image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('magazine')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert(`Image Upload Error: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      imageUrl = `${supabaseUrl}/storage/v1/object/public/magazine/${data.path}`;
    }

    const postData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      author: formData.get('author') as string,
      image_url: imageUrl,
    };

    let error;
    if (editingPost) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', editingPost.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('posts')
        .insert([postData]);
      error = insertError;
    }

    if (!error) {
      setIsModalOpen(false);
      setEditingPost(null);
      setImageFile(null);
      setPreviewUrl(null);
      fetchPosts();
    } else {
      alert(`Error: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  const deletePost = async (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (!error) fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Magazine & News Manager</h1>
          <p className="text-sm text-slate-500">Post articles, announcements, and updates</p>
        </div>
        <button 
          onClick={() => {
            setEditingPost(null);
            setPreviewUrl(null);
            setImageFile(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            No posts found. Start sharing your updates!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all flex flex-col">
              {post.image_url ? (
                <div className="h-48 overflow-hidden relative">
                  <Image src={post.image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 z-10">
                    {post.category}
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2">{post.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{post.content}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => {
                        setEditingPost(post);
                        setPreviewUrl(post.image_url);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deletePost(post.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {editingPost ? 'Edit Post' : 'Create New Post'}
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
                <label className="text-sm font-bold text-foreground">Post Title</label>
                <input 
                  required 
                  name="title"
                  defaultValue={editingPost?.title}
                  placeholder="e.g. New Internship Vacancies for June 2026"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Category</label>
                  <select 
                    name="category"
                    defaultValue={editingPost?.category || 'Announcement'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Article">Article</option>
                    <option value="Vacancy">Job/Intern Vacancy</option>
                    <option value="Gallery">Gallery Update</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Author Display Name</label>
                  <input 
                    name="author"
                    defaultValue={editingPost?.author || 'ZAYA HUB Admin'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Featured Image</label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setImageFile(null);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer hover:border-blue-600/50 transition-colors">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-bold mt-2">Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                  <p className="text-xs text-slate-500 max-w-[200px]">
                    Recommended size: 1200x800px. JPG, PNG or WebP.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Content</label>
                <textarea 
                  required 
                  name="content"
                  rows={6}
                  defaultValue={editingPost?.content}
                  placeholder="Write your article or announcement here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-foreground focus:ring-2 focus:ring-blue-600/50 outline-none resize-none"
                ></textarea>
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
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingPost ? 'Save Changes' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
