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
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block min-h-[1.4em] mb-1">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/20">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-50 dark:border-slate-950 rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Support Center</h1>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Support • 24/7 Assistance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth custom-scrollbar"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
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
                  initial={{ opacity: 0, x: isIntern ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id || idx}
                  className={`flex ${isIntern ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-3 max-w-[85%] ${isIntern ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg shrink-0 ${isIntern ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {isIntern ? 'ME' : 'AD'}
                    </div>
                    <div className="space-y-1">
                      <div className={`px-4 py-2.5 rounded-2xl text-[12px] font-normal shadow-sm transition-all leading-relaxed ${
                        isIntern 
                          ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/10' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                      }`}>
                        {msg.file_url && (
                          <div className="mb-3">
                            {msg.file_type === 'image' ? (
                              <img src={msg.file_url} alt="Uploaded" className="max-w-full rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-md" onClick={() => window.open(msg.file_url, '_blank')} />
                            ) : (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                                <FileText className="h-6 w-6" />
                                <div className="text-left">
                                  <p className="text-[10px] font-black uppercase opacity-60">PDF Document</p>
                                  <p className="underline truncate text-xs">View Resource</p>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 px-1 ${isIntern ? 'justify-end' : 'justify-start'}`}>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {isIntern && msg.is_read && (
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Seen</span>
                         )}
                         {isIntern && !msg.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="mb-6 p-4 bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl flex items-center justify-between shadow-xl"
              >
                <div className="flex items-center gap-4">
                   {filePreview ? (
                     <img src={filePreview} className="h-14 w-14 rounded-xl object-cover shadow-sm" />
                   ) : (
                     <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                     </div>
                   )}
                   <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] font-bold text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to send</p>
                   </div>
                </div>
                <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                   <X className="h-5 w-5 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
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
              className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Paperclip className="h-6 w-6" />
            </button>
            <div className="flex-1 relative group">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full pl-8 pr-24 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-sm font-bold focus:border-blue-600 outline-none transition-all shadow-sm text-foreground placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isSending}
                className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSending || isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send</span><Send className="h-4 w-4" /></>}
              </button>
            </div>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <AlertCircle className="h-3 w-3" />
             Typically replies within 24 hours
          </div>
        </div>
      </div>
    </div>
  );
}
