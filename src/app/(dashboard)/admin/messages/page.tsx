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
    let fileUrl: string | null = null;
    let fileType: string | null = null;

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
    <div className="h-[calc(100vh-10rem)] flex gap-6">
      {/* Sidebar: Intern List */}
      <div className="w-80 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Support Inbox</h2>
            <button 
              onClick={() => {
                fetchAllInterns();
                setShowNewMessageModal(true);
              }}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              title="Start New Conversation"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Filter conversations..." className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
               <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                  <MessageCircle className="h-6 w-6 text-slate-400" />
               </div>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">No active threads</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.intern_id}
                onClick={() => setSelectedIntern(conv)}
                className={`w-full p-5 flex items-center gap-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left ${selectedIntern?.intern_id === conv.intern_id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 flex items-center justify-center text-blue-600 font-black text-sm shrink-0 shadow-sm">
                  {conv.intern_name?.charAt(0) || 'I'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight">{conv.intern_name}</p>
                  <p className="text-[10px] font-bold text-slate-500 truncate uppercase opacity-60 mt-0.5">Updated {new Date(conv.created_at).toLocaleDateString()}</p>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${selectedIntern?.intern_id === conv.intern_id ? 'text-blue-600 translate-x-1' : 'text-slate-300'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {selectedIntern ? (
          <>
            {/* Header */}
            <div className="p-6 px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                       <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                  <div>
                     <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{selectedIntern.intern_name}</h3>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Session</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-8 overflow-y-auto space-y-8 scroll-smooth"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            >
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] space-y-1.5`}>
                        <div className={`px-6 py-4 rounded-[2rem] text-sm font-semibold shadow-sm transition-all leading-relaxed ${
                          isAdmin 
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-md border border-slate-200/50 dark:border-slate-700/50'
                        }`}>
                          {msg.file_url && (
                            <div className="mb-3">
                              {msg.file_type === 'image' ? (
                                <img src={msg.file_url} alt="Uploaded" className="max-w-full rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-md" onClick={() => window.open(msg.file_url, '_blank')} />
                              ) : (
                                <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${isAdmin ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                  <FileText className="h-6 w-6 text-blue-500" />
                                  <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase ${isAdmin ? 'opacity-60' : 'text-slate-400'}`}>Document attachment</p>
                                    <p className={`underline truncate text-xs ${isAdmin ? 'text-white' : 'text-blue-600'}`}>Preview File</p>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                          <p className="break-words">{msg.content}</p>
                        </div>
                        <p className={`text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 px-2 ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
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
                          <p className="text-[10px] font-bold text-slate-500">Attachment ready • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                    placeholder="Type your official reply..."
                    className="w-full pl-8 pr-24 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-sm font-bold focus:border-blue-600 outline-none transition-all shadow-sm text-foreground placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || isSending}
                    className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSending || isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Reply</span><Send className="h-4 w-4" /></>}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-6">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
               <MessageCircle className="h-10 w-10 text-slate-300" />
            </div>
            <div className="max-w-xs space-y-2">
               <h3 className="font-black text-slate-900 dark:text-white uppercase text-xl">Command Center</h3>
               <p className="text-sm text-slate-500 font-medium">Select an intern conversation from the left to start providing professional support.</p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl">
                     <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Initiate Support</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect with any active intern</p>
                  </div>
                </div>
                <button onClick={() => setShowNewMessageModal(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95">
                  <X className="h-6 w-6 text-slate-500" />
                </button>
              </div>
              <div className="p-8">
                <div className="relative mb-6">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                   <input type="text" placeholder="Search by name or email..." className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black outline-none focus:border-blue-600 transition-all placeholder:text-slate-400" />
                </div>
                <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {isLoadingInterns ? (
                    <div className="py-20 flex flex-col items-center gap-4 uppercase tracking-widest font-black text-[10px] text-slate-400">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                      Loading Database...
                    </div>
                  ) : allInterns.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 uppercase font-black text-xs">Accessing intern directory...</div>
                  ) : (
                    allInterns.map(intern => (
                      <button
                        key={intern.id}
                        onClick={() => handleStartNewMessage(intern)}
                        className="w-full p-5 flex items-center gap-4 rounded-3xl border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-left group"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {intern.full_name?.charAt(0) || 'I'}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase">{intern.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{intern.email}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <ChevronRight className="h-5 w-5 text-blue-600" />
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
