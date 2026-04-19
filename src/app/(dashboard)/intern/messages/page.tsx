'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, Loader2, User, MessageCircle, AlertCircle, Clock, Paperclip, Image, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InternMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from('intern_messages')
          .select('*')
          .eq('intern_id', user.id)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data);
          // Mark messages from admin as read
          await supabase
            .from('intern_messages')
            .update({ is_read: true })
            .eq('intern_id', user.id)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
        }
      }
      setIsLoading(false);
    }
    loadMessages();

    const channel = supabase
      .channel('intern_messages_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'intern_messages' 
      }, (payload) => {
         if (payload.new.intern_id === user?.id) {
            setMessages(prev => [...prev, payload.new]);
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    let fileUrl: string | null = null;
    let fileType: string | null = null;

    try {
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('messages')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
        fileType = selectedFile.type.startsWith('image/') ? 'image' : 'pdf';
      }

      const { error } = await supabase.from('intern_messages').insert({
        intern_id: user.id,
        intern_name: user.user_metadata.full_name || 'Intern',
        content: newMessage.trim(),
        sender_type: 'intern',
        file_url: fileUrl,
        file_type: fileType
      });

      if (!error) {
        setNewMessage('');
        setSelectedFile(null);
        setFilePreview(null);
      } else {
        throw error;
      }
    } catch (err) {
      console.error(err);
      alert('Action failed. Make sure the "intern_messages" table and "messages" storage bucket exist in your Supabase.');
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={i} className="flex gap-2 items-start mb-1.5 pl-2 text-inherit">
            <span className="text-blue-400 font-bold">•</span>
            <span className="flex-1">{line.trim().substring(1).trim()}</span>
          </div>
        );
      }

      // Headings
      if (line.trim().endsWith(':')) {
        return (
          <h4 key={i} className="font-black text-[10px] uppercase tracking-[0.2em] mb-2 mt-4 text-blue-500 dark:text-blue-400">
            {line}
          </h4>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g);
      return (
        <p key={i} className="min-h-[1.5em] mb-1 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-black text-blue-500 dark:text-blue-400">{part.slice(2, -2)}</strong>;
            }
            if (part.match(/^https?:\/\//)) {
              return <a key={j} href={part} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">{part.replace(/^https?:\/\//, '')}</a>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="p-7 px-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
           <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-105 transition-transform">
                   <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1.5">Official Support</h2>
                 <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ZAYA Admin Online</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <Clock className="h-5 w-5 text-slate-400" />
              </div>
           </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar"
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Encrypting Connection...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-bounce">
                <MessageCircle className="h-12 w-12 text-blue-600" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase">How can we help?</h3>
                <p className="text-sm text-slate-500 font-medium">Send a message to our team and we'll get back to you as soon as possible.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isIntern = msg.sender_type === 'intern';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id || idx}
                  className={`flex ${isIntern ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-4 max-w-[75%] ${isIntern ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center text-xs font-black shadow-xl shrink-0 transition-transform hover:scale-110 ${isIntern ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                      {isIntern ? 'ME' : 'AD'}
                    </div>
                    <div className="space-y-2">
                      <div className={`px-6 py-4 rounded-[2.5rem] text-[13px] font-medium shadow-2xl transition-all leading-relaxed ${
                        isIntern 
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none shadow-blue-600/10' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-100 dark:border-slate-700'
                      }`}>
                        {msg.file_url && (
                          <div className="mb-4">
                            {msg.file_type === 'image' ? (
                              <img src={msg.file_url} alt="Uploaded" className="max-w-full rounded-3xl cursor-pointer hover:scale-[1.03] transition-transform shadow-2xl border-4 border-white/10" onClick={() => window.open(msg.file_url, '_blank')} />
                            ) : (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-5 rounded-2xl transition-all border ${isIntern ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-inner'}`}>
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isIntern ? 'bg-white/20' : 'bg-blue-600'}`}>
                                  <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-left min-w-0">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${isIntern ? 'text-white/60' : 'text-slate-400'}`}>Resource attached</p>
                                  <p className={`underline truncate font-bold text-sm ${isIntern ? 'text-white' : 'text-blue-600'}`}>View Material</p>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2.5 mt-1 px-3 ${isIntern ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isIntern && (
                            <div className="flex items-center gap-1.5">
                                {msg.is_read ? (
                                  <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Seen</span>
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Delivered</span>
                                  </div>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 px-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-25px_50px_rgba(0,0,0,0.03)]">
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-blue-100/50 dark:border-blue-900/30 rounded-[2.5rem] flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-5">
                   {filePreview ? (
                     <img src={filePreview} className="h-20 w-20 rounded-3xl object-cover shadow-2xl border-4 border-white dark:border-slate-700" />
                   ) : (
                     <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl">
                        <FileText className="h-10 w-10 text-white" />
                     </div>
                   )}
                   <div>
                      <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[300px]">{selectedFile.name}</p>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Secure Document</p>
                   </div>
                </div>
                <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-4 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 group rounded-[1.5rem] transition-all shadow-xl">
                   <X className="h-6 w-6 text-slate-400 group-hover:text-red-600 transition-colors" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*,application/pdf"
            />
            <button
              type="button"
              disabled={isSending}
              onClick={() => fileInputRef.current?.click()}
              className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-xl active:scale-95 disabled:opacity-50 border border-slate-100 dark:border-slate-700"
            >
              <Paperclip className="h-7 w-7" />
            </button>
            <div className="flex-1 relative group">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask support anything..."
                className="w-full pl-10 pr-32 py-6.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-transparent rounded-[2.5rem] text-sm font-bold focus:border-blue-600/50 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all shadow-inner text-foreground placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isSending}
                className="absolute right-3.5 top-3.5 bottom-3.5 px-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.25em] hover:shadow-2xl hover:shadow-blue-600/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isSending || isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Send</span><Send className="h-5 w-5" /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
