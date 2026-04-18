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
    let fileUrl = null;
    let fileType = null;

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

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ask Doubt / Support</h1>
            <p className="text-slate-500 text-sm font-medium">Direct communication with Zaya Admins</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]"
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                <MessageCircle className="h-12 w-12 text-slate-400" />
              </div>
              <div className="max-w-xs">
                <p className="font-bold text-slate-600 dark:text-slate-300">No messages yet</p>
                <p className="text-sm text-slate-500">Ask a doubt or report a problem to the admin directly.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isIntern = msg.sender_type === 'intern';
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id || idx}
                  className={`flex ${isIntern ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] space-y-1`}>
                    <div className={`flex items-center gap-2 mb-1 ${isIntern ? 'flex-row-reverse' : 'flex-row'}`}>
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isIntern ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {isIntern ? 'ME' : 'AD'}
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {isIntern ? 'You' : 'Admin'}
                       </span>
                    </div>
                    <div className={`px-5 py-3 rounded-3xl text-sm font-medium shadow-sm transition-all ${
                      isIntern 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.file_url && (
                        <div className="mb-2">
                          {msg.file_type === 'image' ? (
                            <img src={msg.file_url} alt="Uploaded" className="max-w-full rounded-xl cursor-pointer hover:opacity-90 shadow-sm" onClick={() => window.open(msg.file_url, '_blank')} />
                          ) : (
                            <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                              <FileText className="h-5 w-5" />
                              <span className="underline truncate text-xs">View Document</span>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isIntern ? 'justify-end' : 'justify-start'}`}>
                       <Clock className="h-3 w-3 text-slate-300" />
                       <span className="text-[9px] font-bold text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                   {filePreview ? (
                     <img src={filePreview} className="h-12 w-12 rounded-lg object-cover" />
                   ) : (
                     <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                     </div>
                   )}
                   <div className="max-w-[200px]">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                </div>
                <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                   <X className="h-4 w-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
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
              className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-6 pr-16 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-sm font-medium focus:border-blue-600 outline-none transition-all shadow-sm text-foreground"
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isSending}
                className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                {isSending || isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <AlertCircle className="h-3 w-3" />
             Typically replies within 24 hours
          </div>
        </div>
      </div>
    </div>
  );
}
