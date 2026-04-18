'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, Loader2, User, MessageCircle, Clock, Search, ChevronRight, Plus, X, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [allInterns, setAllInterns] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInterns, setIsLoadingInterns] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('intern_messages')
      .select('intern_id, intern_name, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const unique = Array.from(new Set(data.map(m => m.intern_id)))
        .map(id => data.find(m => m.intern_id === id));
      setConversations(unique);
    }
    setIsLoading(false);
  };

  const fetchAllInterns = async () => {
    setIsLoadingInterns(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'intern')
      .order('full_name', { ascending: true });
    
    if (!error && data) {
      setAllInterns(data);
    }
    setIsLoadingInterns(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleStartNewMessage = (intern: any) => {
    setSelectedIntern({
      intern_id: intern.id,
      intern_name: intern.full_name
    });
    setShowNewMessageModal(false);
  };

  useEffect(() => {
    if (selectedIntern) {
      loadMessages(selectedIntern.intern_id);
    }
  }, [selectedIntern]);

  async function loadMessages(internId: string) {
    setIsLoadingMessages(true);
    const { data, error } = await supabase
      .from('intern_messages')
      .select('*')
      .eq('intern_id', internId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setIsLoadingMessages(false);
  }

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
    if ((!newMessage.trim() && !selectedFile) || isSending || !selectedIntern) return;

    setIsSending(true);
    let fileUrl = null;
    let fileType = null;

    try {
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `admin/${selectedIntern.intern_id}/${fileName}`;

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
        intern_id: selectedIntern.intern_id,
        intern_name: selectedIntern.intern_name,
        content: newMessage.trim(),
        sender_type: 'admin',
        file_url: fileUrl,
        file_type: fileType
      });

      if (!error) {
        setMessages(prev => [...prev, {
            id: Date.now(),
            content: newMessage.trim(),
            sender_type: 'admin',
            created_at: new Date().toISOString(),
            file_url: fileUrl,
            file_type: fileType
        }]);
        setNewMessage('');
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (err) {
      console.error(err);
      alert('Action failed. Ensure the storage bucket "messages" exists.');
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar: Intern List */}
      <div className="w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Inbox</h2>
            <button 
              onClick={() => {
                fetchAllInterns();
                setShowNewMessageModal(true);
              }}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              title="Start New Conversation"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Search interns..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No conversations found</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.intern_id}
                onClick={() => setSelectedIntern(conv)}
                className={`w-full p-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left ${selectedIntern?.intern_id === conv.intern_id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {conv.intern_name?.charAt(0) || 'I'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{conv.intern_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">Last message: {new Date(conv.created_at).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {selectedIntern ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                     <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                     <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{selectedIntern.intern_name}</h3>
                     <p className="text-[10px] font-bold text-green-500 uppercase">Online</p>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]"
            >
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] space-y-1`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm font-medium ${
                          isAdmin 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.file_url && (
                            <div className="mb-2">
                              {msg.file_type === 'image' ? (
                                <img src={msg.file_url} alt="Uploaded" className="max-w-full rounded-xl cursor-pointer hover:opacity-90" onClick={() => window.open(msg.file_url, '_blank')} />
                              ) : (
                                <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-3 rounded-xl transition-all ${isAdmin ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                  <FileText className="h-5 w-5" />
                                  <span className="underline truncate text-[10px]">View Document</span>
                                </a>
                              )}
                            </div>
                          )}
                          {msg.content}
                        </div>
                        <p className={`text-[9px] font-bold text-slate-400 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
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
                         <img src={filePreview} className="h-10 w-10 rounded-lg object-cover" />
                       ) : (
                         <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                         </div>
                       )}
                       <div>
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{selectedFile.name}</p>
                       </div>
                    </div>
                    <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
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
                    placeholder="Type your reply..."
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
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-50">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
               <MessageCircle className="h-12 w-12 text-slate-400" />
            </div>
            <div className="max-w-xs">
               <p className="font-bold text-slate-900 dark:text-white">Select a conversation</p>
               <p className="text-sm text-slate-500">Choose an intern from the left to view and reply to their doubts.</p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Start New Chat</h2>
                <button onClick={() => setShowNewMessageModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input type="text" placeholder="Search interns..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all" />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {isLoadingInterns ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                  ) : allInterns.length === 0 ? (
                    <div className="py-10 text-center text-slate-500">No interns found</div>
                  ) : (
                    allInterns.map(intern => (
                      <button
                        key={intern.id}
                        onClick={() => handleStartNewMessage(intern)}
                        className="w-full p-4 flex items-center gap-3 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-left group"
                      >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {intern.full_name?.charAt(0) || 'I'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{intern.full_name}</p>
                          <p className="text-[10px] text-slate-500">{intern.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
