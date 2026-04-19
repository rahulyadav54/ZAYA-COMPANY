'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, Loader2, User, MessageCircle, Clock, Search, ChevronRight, Plus, X, Paperclip, FileText, Image as ImageIcon, Check, CheckSquare, Square } from 'lucide-react';
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

  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [isBulkView, setIsBulkView] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setSelectedInternIds([]);
    setIsBulkView(false);
  };

  const toggleInternSelection = (id: string) => {
    setSelectedInternIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInternIds.length === filteredInterns.length) {
      setSelectedInternIds([]);
    } else {
      setSelectedInternIds(filteredInterns.map(i => i.id));
    }
  };

  const handleSendBulkMessage = async () => {
    if (!bulkMessage.trim() || isBulkSending) return;
    setIsBulkSending(true);

    try {
      const messagesToInsert = selectedInternIds.map(id => {
        const intern = allInterns.find(i => i.id === id);
        return {
          intern_id: id,
          intern_name: intern?.full_name || 'Intern',
          content: bulkMessage.trim(),
          sender_type: 'admin'
        };
      });

      const { error } = await supabase.from('intern_messages').insert(messagesToInsert);

      if (error) throw error;

      alert(`Successfully sent message to ${selectedInternIds.length} interns`);
      setShowNewMessageModal(false);
      setIsBulkView(false);
      setBulkMessage('');
      setSelectedInternIds([]);
      fetchConversations();
    } catch (err: any) {
      console.error(err);
      alert('Failed to send bulk message: ' + err.message);
    } finally {
      setIsBulkSending(false);
    }
  };

  const filteredInterns = allInterns.filter(intern => 
    intern.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intern.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      // Mark messages from intern as read
      await supabase
        .from('intern_messages')
        .update({ is_read: true })
        .eq('intern_id', internId)
        .eq('sender_type', 'intern')
        .eq('is_read', false);
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

  const renderMessageContent = (content: string) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={i} className="flex gap-2 items-start mb-1.5 pl-2">
            <span className="text-blue-400 font-bold">•</span>
            <span className="flex-1">{line.trim().substring(1).trim()}</span>
          </div>
        );
      }

      // Headings (lines that end with :)
      if (line.trim().endsWith(':')) {
        return (
          <h4 key={i} className="font-black text-xs uppercase tracking-[0.15em] mb-2 mt-4 text-blue-500/90 dark:text-blue-400">
            {line}
          </h4>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g);
      return (
        <p key={i} className="min-h-[1.5em] mb-1.5 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-slate-900 dark:text-white bg-blue-500/10 px-1 rounded">{part.slice(2, -2)}</strong>;
            }
            if (part.match(/^https?:\/\//)) {
              return <a key={j} href={part} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-bold">{part.replace(/^https?:\/\//, '')}</a>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 md:gap-6">
      {/* Sidebar: Intern List */}
      <div className="w-[30%] min-w-[320px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all">
        <div className="p-7 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Messages</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Support Inbox</p>
            </div>
            <button 
              onClick={() => {
                fetchAllInterns();
                setShowNewMessageModal(true);
              }}
              className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
             <input type="text" placeholder="Search conversations..." className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {isLoading ? (
            <div className="p-10 flex flex-col items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Threads...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50 border border-dashed border-slate-300">
                  <MessageCircle className="h-8 w-8 text-slate-400" />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active discussions</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.intern_id}
                onClick={() => setSelectedIntern(conv)}
                className={`w-full p-4 flex items-center gap-4 rounded-3xl transition-all text-left relative group ${selectedIntern?.intern_id === conv.intern_id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="relative shrink-0">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${selectedIntern?.intern_id === conv.intern_id ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>
                    {conv.intern_name?.charAt(0) || 'I'}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${selectedIntern?.intern_id === conv.intern_id ? 'border-blue-600 bg-green-400' : 'border-white dark:border-slate-900 bg-green-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`font-black text-xs uppercase tracking-tight truncate ${selectedIntern?.intern_id === conv.intern_id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{conv.intern_name}</p>
                    <span className={`text-[8px] font-bold uppercase ${selectedIntern?.intern_id === conv.intern_id ? 'text-white/60' : 'text-slate-400'}`}>
                      {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-[10px] font-medium truncate opacity-70 ${selectedIntern?.intern_id === conv.intern_id ? 'text-white' : 'text-slate-500'}`}>
                    {conv.last_message || "Active support thread..."}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {selectedIntern ? (
          <>
            {/* Header */}
            <div className="p-6 px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                       <User className="h-7 w-7 text-slate-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full shadow-sm" />
                  </div>
                  <div>
                     <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl leading-none mb-1.5">{selectedIntern.intern_name}</h3>
                     <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active now</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95">
                    <Clock className="h-5 w-5" />
                  </button>
               </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth custom-scrollbar"
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
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg.id || idx} 
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] space-y-1.5`}>
                        <div className={`px-6 py-4 rounded-[2rem] text-[13px] font-medium shadow-xl transition-all leading-relaxed ${
                          isAdmin 
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-500/10' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-lg'
                        }`}>
                          {msg.file_url && (
                            <div className="mb-4">
                              {msg.file_type === 'image' ? (
                                <img src={msg.file_url} alt="Uploaded" className="max-w-full rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-2xl border-4 border-white/10" onClick={() => window.open(msg.file_url, '_blank')} />
                              ) : (
                                <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-5 rounded-2xl transition-all border ${isAdmin ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-inner'}`}>
                                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? 'bg-white/20' : 'bg-blue-600'}`}>
                                    <FileText className={`h-6 w-6 ${isAdmin ? 'text-white' : 'text-white'}`} />
                                  </div>
                                  <div className="text-left min-w-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-white/60' : 'text-slate-400'}`}>Document attachment</p>
                                    <p className={`underline truncate font-bold text-sm ${isAdmin ? 'text-white' : 'text-blue-600'}`}>Preview Resource</p>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                          <div className="space-y-1">
                            {renderMessageContent(msg.content)}
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 px-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isAdmin && (
                             <div className="flex items-center gap-1">
                                {msg.is_read ? (
                                   <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Seen</span>
                                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                                      <span className="text-[8px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                   </div>
                                ) : (
                                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sent</span>
                                )}
                             </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-7 px-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
              <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="mb-6 p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-blue-100/50 dark:border-blue-900/30 rounded-3xl flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                       {filePreview ? (
                         <img src={filePreview} className="h-16 w-16 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-700" />
                       ) : (
                         <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                            <FileText className="h-8 w-8 text-white" />
                         </div>
                       )}
                       <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[250px]">{selectedFile.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for secure transmission</p>
                       </div>
                    </div>
                    <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-3 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 group rounded-2xl transition-all shadow-sm">
                       <X className="h-5 w-5 text-slate-400 group-hover:text-red-600 transition-colors" />
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
                  className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm active:scale-95 disabled:opacity-50 border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                >
                  <Paperclip className="h-6 w-6" />
                </button>
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Compose an official message..."
                    className="w-full pl-8 pr-28 py-5.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-transparent rounded-[2rem] text-sm font-bold focus:border-blue-600/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all shadow-inner text-foreground placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || isSending}
                    className="absolute right-3 top-3 bottom-3 px-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
                {!isBulkView ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={toggleSelectAll}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        {selectedInternIds.length === filteredInterns.length && filteredInterns.length > 0 ? (
                          <><CheckSquare className="h-4 w-4" /> Deselect All</>
                        ) : (
                          <><Square className="h-4 w-4" /> Select All</>
                        )}
                      </button>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {selectedInternIds.length} Selected
                      </span>
                    </div>

                    <div className="relative mb-6">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Search by name or email..." 
                         className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black outline-none focus:border-blue-600 transition-all placeholder:text-slate-400" 
                       />
                    </div>

                    <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {isLoadingInterns ? (
                        <div className="py-20 flex flex-col items-center gap-4 uppercase tracking-widest font-black text-[10px] text-slate-400">
                          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                          Loading Database...
                        </div>
                      ) : filteredInterns.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 uppercase font-black text-xs">No interns found...</div>
                      ) : (
                        filteredInterns.map(intern => (
                          <div key={intern.id} className="relative group">
                            <button
                              onClick={() => handleStartNewMessage(intern)}
                              className="w-full p-5 flex items-center gap-4 rounded-3xl border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-left"
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
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleInternSelection(intern.id);
                              }}
                              className={`absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${selectedInternIds.includes(intern.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {selectedInternIds.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800"
                      >
                        <button 
                          onClick={() => setIsBulkView(true)}
                          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                        >
                          Compose Bulk Message ({selectedInternIds.length})
                        </button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Content</label>
                      <textarea 
                        value={bulkMessage}
                        onChange={(e) => setBulkMessage(e.target.value)}
                        placeholder="Type the message to be sent to all selected interns..."
                        className="w-full min-h-[150px] p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold outline-none focus:border-blue-600 transition-all resize-none"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setIsBulkView(false)}
                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSendBulkMessage}
                        disabled={!bulkMessage.trim() || isBulkSending}
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isBulkSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send To {selectedInternIds.length}</>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
