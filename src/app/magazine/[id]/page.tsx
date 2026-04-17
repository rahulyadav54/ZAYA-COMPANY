'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, User, ArrowLeft, Tag, Loader2, Newspaper } from 'lucide-react';

export default function ArticlePage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setPost(data);
      }
      setIsLoading(false);
    };
    if (params.id) fetchPost();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-center px-6">
        <Newspaper className="h-20 w-20 text-slate-300 mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
        <p className="text-slate-500 mb-8">This article may have been removed or does not exist.</p>
        <Link href="/magazine" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
          Back to Magazine
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero Image Banner */}
      <div className="relative w-full h-64 md:h-96 bg-slate-900">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/magazine"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Magazine
          </Link>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-8 left-6 md:left-[calc((100%-768px)/2+24px)] lg:left-[calc((100%-896px)/2+24px)]">
          <span className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg">
            {post.category}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="-mt-16 relative z-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 mb-16"
        >
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-blue-500" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-blue-500" />
              {post.category}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-8">
            {post.title}
          </h1>

          {/* Divider */}
          <div className="w-16 h-1 bg-blue-600 rounded-full mb-8" />

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph: string, i: number) =>
              paragraph.trim() ? (
                <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-lg">
                  {paragraph}
                </p>
              ) : <br key={i} />
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Published by</p>
              <p className="font-bold text-foreground">{post.author}</p>
            </div>
            <Link
              href="/magazine"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-foreground font-bold hover:border-blue-600 hover:text-blue-600 transition-all text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> More Articles
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
