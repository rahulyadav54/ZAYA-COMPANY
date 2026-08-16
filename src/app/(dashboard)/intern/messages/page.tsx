'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, Loader2, User, MessageCircle, AlertCircle, Clock, Paperclip, Image, FileText, X, ShieldCheck } from 'lucide-react';
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
      const { getActiveUser } = await import('@/lib/getActiveUser');
      const activeUser = await getActiveUser();
      if (activeUser) {
        setUser(activeUser);
        const userKeys = Array.from(new Set([activeUser.id, activeUser.email].filter(Boolean)));

        const { data, error } = await supabase
          .from('intern_messages')
          .select('*')
          .in('intern_id', userKeys)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data);
          // Mark messages from admin as read
          await supabase
            .from('intern_messages')
            .update({ is_read: true })
            .in('intern_id', userKeys)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
        }
      }
      setIsLoading(false);
    }
    loadMessages();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userKeys = Array.from(new Set([user.id, user.email].filter(Boolean)));

    // 1. Supabase Realtime WebSocket Listener
    const channel = supabase
      .channel('intern_chat_live')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'intern_messages' 
      }, (payload: any) => {
         const newMsg = payload.new;
         if (newMsg && userKeys.some(k => k === newMsg.intern_id || (k && newMsg.intern_id && k.toLowerCase() === newMsg.intern_id.toLowerCase()))) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
         }
      })
      .subscribe();

    // 2. 3-Second Background Polling Sync (Guarantees instant sync even if WebSocket is blocked)
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('intern_messages')
        .select('*')
        .in('intern_id', userKeys)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(prev => {
          if (data.length !== prev.length || data.some((m, idx) => m.id !== prev[idx]?.id)) {
            return data;
          }
          return prev;
        });
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

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
    if ((!newMessage.trim() && !selectedFile) || isSending || !user) return;

    setIsSending(true);
    let fileUrl: string | null = null;
    let fileType: string | null = null;

    try {
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id || 'intern'}/${fileName}`;

        try {
          // Try 'resumes' bucket first as reliable storage
          let { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, selectedFile);

          let bucketName = 'resumes';
          if (uploadError) {
            const res2 = await supabase.storage.from('messages').upload(filePath, selectedFile);
            uploadError = res2.error;
            bucketName = 'messages';
          }
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from(bucketName)
              .getPublicUrl(filePath);
            fileUrl = publicUrl;
            fileType = selectedFile.type.startsWith('image/') ? 'image' : 'pdf';
          }
        } catch (storageErr) {
          console.warn('Storage bucket notice:', storageErr);
        }
      }

      const senderName = user.user_metadata?.full_name || user.full_name || user.email?.split('@')[0] || 'Intern';

      const payload = {
        intern_id: user.id || user.email,
        intern_name: senderName,
        content: newMessage.trim(),
        message: newMessage.trim() || 'Attachment',
        sender_type: 'intern',
        file_url: fileUrl,
        file_type: fileType,
        is_read: false
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('intern_messages')
        .insert(payload)
        .select('*');

      if (insertError) {
        console.error('Send message error:', insertError);
        alert(`Failed to send message: ${insertError.message}`);
      } else {
        const newMsg = (insertedData && insertedData[0]) || {
          ...payload,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (err: any) {
      console.error('Send message notice:', err);
      alert(`Failed to send message: ${err.message || err}`);
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
    <div className="max-w-5xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="p-6 px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                   <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-3 border-white dark:border-slate-900 rounded-full shadow-md" />
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                     Priority Support
                   </span>
                 </div>
                 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Official Support Portal</h2>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ZAYA Support Desk Online</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                 <Clock className="h-4 w-4 text-blue-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
              </div>
           </div>
        </div>

        {/* Chat Scroll Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 scroll-smooth"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }}
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Establishing Encrypted Connection...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 my-auto">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 transform -rotate-3">
                  <MessageCircle className="h-10 w-10" />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight italic">How can we assist you today?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Send a message or attachment directly to our admin team. We respond quickly during active hours.</p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-lg">
                {[
                  "Question about my assigned task",
                  "Need help with Certificate & ID verification",
                  "Offer Letter details clarification",
                  "General internship support"
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => setNewMessage(chip)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    💡 {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isIntern = msg.sender_type === 'intern';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id || idx}
                  className={`flex ${isIntern ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-3 max-w-[80%] md:max-w-[70%] ${isIntern ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-md shrink-0 ${
                      isIntern 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20' 
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                    }`}>
                      {isIntern ? 'ME' : 'ZAYA'}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium shadow-xl transition-all leading-relaxed ${
                        isIntern 
                          ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white rounded-br-none shadow-blue-600/15' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700 shadow-md'
                      }`}>
                        {msg.file_url && (
                          <div className="mb-4">
                            {msg.file_type === 'image' ? (
                              <img src={msg.file_url} alt="Attachment" className="max-w-full rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform shadow-xl border-4 border-white/10" onClick={() => window.open(msg.file_url, '_blank')} />
                            ) : (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${isIntern ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${isIntern ? 'bg-white/20' : 'bg-blue-600'}`}>
                                  <FileText className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left min-w-0">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${isIntern ? 'text-white/60' : 'text-slate-400'}`}>Attachment</p>
                                  <p className={`underline truncate font-bold text-xs ${isIntern ? 'text-white' : 'text-blue-600'}`}>Open File</p>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          {renderMessageContent(msg.content || msg.message)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-2 ${isIntern ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isIntern && (
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                              {msg.is_read ? '✓✓ Seen' : '✓ Sent'}
                            </span>
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
        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/60 border border-blue-200 dark:border-blue-900/40 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                   {filePreview ? (
                     <img src={filePreview} className="h-14 w-14 rounded-xl object-cover shadow-sm border border-white" />
                   ) : (
                     <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                        <FileText className="h-7 w-7" />
                     </div>
                   )}
                   <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[220px]">{selectedFile.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                </div>
                <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                   <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
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
              className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              title="Attach File or Document"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask support anything..."
                className="w-full pl-6 pr-32 py-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isSending}
                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-40 flex items-center gap-2"
              >
                {isSending || isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send</span><Send className="h-3.5 w-3.5" /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
