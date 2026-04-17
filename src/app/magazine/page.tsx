'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Newspaper, ChevronRight, Loader2, Calendar, User } from 'lucide-react';

export default function MagazinePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setPosts(data);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm font-bold mb-6"
          >
            <Newspaper className="h-4 w-4" />
            <span>ZAYA HUB MAGAZINE</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6"
          >
            Latest News & <span className="text-blue-500">Insights</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Stay updated with the latest technological trends, company announcements, and career opportunities at ZAYA HUB.
          </motion.p>
        </div>
      </section>

      {/* Feed Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-bold">Loading magazine feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px]">
              <Newspaper className="h-20 w-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-slate-400">Our Magazine is coming soon!</h3>
              <p className="text-slate-500 mt-4 text-lg">We are currently preparing some amazing content for you. Stay tuned.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    {post.image_url ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={post.image_url} 
                          alt={post.title} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Newspaper className="h-16 w-16 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-lg">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center space-x-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1 text-blue-500" />
                        {post.author}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="mt-auto">
                      <button className="flex items-center text-blue-600 font-black text-sm uppercase tracking-widest hover:translate-x-2 transition-transform">
                        Read Full Story <ChevronRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Placeholder */}
      <section className="py-24 bg-blue-600">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Stay ahead of the curve</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Subscribe to our magazine to receive the latest updates, articles, and vacancy alerts directly in your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-2xl bg-white text-slate-900 focus:outline-none font-bold"
            />
            <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
