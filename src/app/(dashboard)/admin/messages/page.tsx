'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, Loader2, User, MessageCircle, Clock, Search, ChevronRight, Plus, X, Paperclip, FileText, Image as ImageIcon, Check, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('intern_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const uniqueIds = Array.from(new Set(data.map(m => m.intern_id)));
        const uniqueConvs = uniqueIds.map(id => {
          const m = data.find(item => item.intern_id === id);
          return {
            intern_id: id,
            id: id,
            intern_name: m?.intern_name || 'Intern',
            created_at: m?.created_at,
            last_message: m?.content || 'Sent attachment'
          };
        });
        setConversations(uniqueConvs);
      }
    } catch (e) {
      console.warn('Fetch conversations notice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllInterns = async () => {
    setIsLoadingInterns(true);
    let list: any[] = [];

    // 1. Try API endpoint first (bypasses browser RLS)
    try {
      const res = await fetch('/api/admin/interns');
      const json = await res.json();
      if (json.success && Array.isArray(json.interns) && json.interns.length > 0) {
        list = json.interns.map((i: any) => ({
          id: i.id || i.intern_id || i.email,
          intern_id: i.intern_id || i.id || i.email,
          full_name: i.full_name || i.email?.split('@')[0] || 'Intern',
          intern_name: i.full_name || i.email?.split('@')[0] || 'Intern',
          email: i.email || '',
          position: i.position || 'Intern'
        }));
      }
    } catch (e) {
      console.warn('API fetch interns notice:', e);
    }

    // 2. Client fallback
    if (list.length === 0) {
      try {
        const { data: profs } = await supabase.from('profiles').select('*');
        const { data: apps } = await supabase.from('applications').select('*');

        const seen = new Set();
        if (profs && Array.isArray(profs)) {
          for (const p of profs) {
            const key = (p.email || p.id).toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              list.push({
                id: p.id || p.intern_id,
                intern_id: p.intern_id || p.id,
                full_name: p.full_name || p.email?.split('@')[0] || 'Intern',
                intern_name: p.full_name || p.email?.split('@')[0] || 'Intern',
                email: p.email || '',
                position: p.department || 'Intern'
              });
            }
          }
        }

        if (apps && Array.isArray(apps)) {
          for (const a of apps) {
            const key = (a.email || a.id).toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              list.push({
                id: a.id || a.intern_id,
                intern_id: a.intern_id || a.id,
                full_name: a.full_name || a.email?.split('@')[0] || 'Intern Applicant',
                intern_name: a.full_name || a.email?.split('@')[0] || 'Intern Applicant',
                email: a.email || '',
                position: a.position || 'Intern'
              });
            }
          }
        }
      } catch (e) {
        console.warn('Client fallback fetch interns notice:', e);
      }
    }

    setAllInterns(list);
    return list;
  };

  useEffect(() => {
    fetchConversations();
    fetchAllInterns();
  }, []);

  // Realtime updates for Admin messages
  useEffect(() => {
    const channel = supabase
      .channel('admin_messages_global_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'intern_messages'
      }, (payload) => {
        const newMsg = payload.new;
        if (selectedIntern) {
          const sId = (selectedIntern.intern_id || selectedIntern.id || '').toLowerCase();
          const sEmail = (selectedIntern.email || '').toLowerCase();
          const mId = (newMsg.intern_id || '').toLowerCase();
          if (mId === sId || mId === sEmail) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedIntern]);

  const handleStartNewMessage = (intern: any) => {
    setSelectedIntern({
      intern_id: intern.intern_id || intern.id || intern.email,
      id: intern.id || intern.intern_id,
      intern_name: intern.full_name || intern.intern_name || 'Intern',
      full_name: intern.full_name || intern.intern_name || 'Intern',
      email: intern.email || ''
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
        const intern = allInterns.find(i => i.id === id || i.intern_id === id);
        return {
          intern_id: intern?.intern_id || intern?.id || id,
          intern_name: intern?.full_name || intern?.intern_name || 'Intern',
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
    (intern.full_name || intern.intern_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (intern.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedIntern) {
      loadMessages(selectedIntern);
    }
  }, [selectedIntern]);

  async function loadMessages(internTarget: any) {
    if (!internTarget) return;
    setIsLoadingMessages(true);

    const idsToSearch = new Set<string>();
    if (internTarget.intern_id) idsToSearch.add(internTarget.intern_id);
    if (internTarget.id) idsToSearch.add(internTarget.id);
    if (internTarget.email) idsToSearch.add(internTarget.email);

    const orConditions = Array.from(idsToSearch).map(id => `intern_id.eq.${id}`).join(',');

    try {
      const { data, error } = await supabase
        .from('intern_messages')
        .select('*')
        .or(orConditions)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        await supabase
          .from('intern_messages')
          .update({ is_read: true })
          .or(orConditions)
          .eq('sender_type', 'intern')
          .eq('is_read', false);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.warn('Load messages notice:', e);
    } finally {
      setIsLoadingMessages(false);
    }
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

    const targetId = selectedIntern.intern_id || selectedIntern.id;

    try {
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `admin/${targetId}/${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('messages')
            .upload(filePath, selectedFile);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('messages')
              .getPublicUrl(filePath);
            fileUrl = publicUrl;
            fileType = selectedFile.type.startsWith('image/') ? 'image' : 'pdf';
          }
        } catch (storageErr) {
          console.warn('Storage notice:', storageErr);
        }
      }

      const payload = {
        intern_id: targetId,
        intern_name: selectedIntern.intern_name || selectedIntern.full_name || 'Intern',
        content: newMessage.trim(),
        sender_type: 'admin',
        file_url: fileUrl,
        file_type: fileType,
        is_read: false
      };

      const { data: inserted, error } = await supabase.from('intern_messages').insert(payload).select('*').single();

      const newMsg = inserted || {
        ...payload,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      fetchConversations();
    } catch (err) {
      console.error('Send admin message notice:', err);
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
    <div className="h-[calc(100vh-7.5rem)] flex gap-4 md:gap-6">
      {/* Sidebar: Intern List */}
      <div className="w-[320px] lg:w-[380px] shrink-0 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all">
        {/* Sidebar Header */}
        <div className="p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                Support Inbox
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2 italic">
                Messages
              </h2>
            </div>
            <button 
              onClick={() => {
                fetchAllInterns();
                setShowNewMessageModal(true);
              }}
              className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.05] active:scale-95 flex items-center justify-center"
              title="Start New Thread"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
             <input 
               type="text" 
               value={sidebarSearchQuery}
               onChange={(e) => setSidebarSearchQuery(e.target.value)}
               placeholder="Search interns or messages..." 
               className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-400" 
             />
          </div>
        </div>

        {/* Sidebar List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scroll-smooth">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Inbox Threads...</p>
            </div>
          ) : (() => {
            const map = new Map<string, any>();
            conversations.forEach(c => {
              const k = c.intern_id || c.id;
              if (k) map.set(k, c);
            });
            allInterns.forEach(i => {
              const k = i.id || i.intern_id;
              if (k && !map.has(k)) {
                map.set(k, {
                  intern_id: k,
                  intern_name: i.full_name || i.intern_name,
                  email: i.email,
                  last_message: 'Start new discussion...'
                });
              }
            });

            const combinedList = Array.from(map.values()).filter(item => {
              if (!sidebarSearchQuery.trim()) return true;
              const q = sidebarSearchQuery.toLowerCase();
              return (
                item.intern_name?.toLowerCase().includes(q) ||
                item.email?.toLowerCase().includes(q) ||
                item.last_message?.toLowerCase().includes(q)
              );
            });

            if (combinedList.length === 0) {
              return (
                <div className="p-12 text-center space-y-4 my-auto">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto opacity-60 border border-dashed border-slate-300 dark:border-slate-700">
                      <MessageCircle className="h-8 w-8 text-slate-400" />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching interns</p>
                </div>
              );
            }

            return combinedList.map((conv) => {
              const isSelected = selectedIntern?.intern_id === conv.intern_id || selectedIntern?.id === conv.intern_id;
              return (
                <button
                  key={conv.intern_id || conv.id}
                  onClick={() => setSelectedIntern(conv)}
                  className={`w-full p-4 flex items-center gap-4 rounded-3xl transition-all text-left relative group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/25 scale-[1.01]' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md transition-all ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                    }`}>
                      {conv.intern_name?.charAt(0) || 'I'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                      isSelected ? 'border-blue-600 bg-emerald-400' : 'border-white dark:border-slate-900 bg-emerald-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-black text-xs uppercase tracking-tight truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {conv.intern_name}
                      </p>
                      {conv.created_at && (
                        <span className={`text-[8px] font-bold uppercase shrink-0 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                          {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-medium truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {conv.last_message || "Active support thread..."}
                    </p>
                  </div>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {selectedIntern ? (
          <>
            {/* Active Header Bar */}
            <div className="p-6 px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/20">
                       {selectedIntern.intern_name?.charAt(0) || 'I'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-sm" />
                  </div>
                  <div>
                     <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl leading-none mb-1.5 italic">
                       {selectedIntern.intern_name}
                     </h3>
                     <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Thread • Instant Sync</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Link 
                    href={`/admin/interns/${encodeURIComponent(selectedIntern.intern_id || selectedIntern.id)}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200 dark:border-blue-800"
                  >
                    View Profile
                  </Link>
               </div>
            </div>

            {/* Messages Scroll Feed */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 md:p-8 overflow-y-auto space-y-4 scroll-smooth"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
                backgroundSize: '28px 28px'
              }}
            >
              {isLoadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-3 opacity-60">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No messages in this thread yet. Send a message below to start.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg.id || idx} 
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[65%] space-y-1.5`}>
                        <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium shadow-xl transition-all leading-relaxed ${
                          isAdmin 
                            ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-600/15' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700 shadow-md'
                        }`}>
                          {msg.file_url && (
                            <div className="mb-4">
                              {msg.file_type === 'image' ? (
                                <img src={msg.file_url} alt="Uploaded Attachment" className="max-w-full rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform shadow-xl border-4 border-white/10" onClick={() => window.open(msg.file_url, '_blank')} />
                              ) : (
                                <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${isAdmin ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? 'bg-white/20' : 'bg-blue-600'}`}>
                                    <FileText className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-left min-w-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-white/60' : 'text-slate-400'}`}>Attached File</p>
                                    <p className={`underline truncate font-bold text-xs ${isAdmin ? 'text-white' : 'text-blue-600'}`}>Open Document</p>
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
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isAdmin && (
                             <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                               {msg.is_read ? '✓✓ Seen' : '✓ Sent'}
                             </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
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
                  title="Attach File or Photo"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type an official message or instruction..."
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
          </>
        ) : (
          /* Executive Command Center Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-8 my-auto">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 transform -rotate-3">
                 <MessageCircle className="h-12 w-12" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-md">
                 <Check className="h-4 w-4 text-white stroke-[3]" />
              </div>
            </div>
            
            <div className="max-w-md space-y-3">
               <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                 Support Inbox • Active Engine
               </span>
               <h3 className="font-black text-slate-900 dark:text-white uppercase text-2xl tracking-tight italic">
                 Command Center
               </h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                 Select an intern thread from the sidebar to view past messages, send direct guidance, or upload official documents.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-4">
              <button 
                onClick={() => {
                  fetchAllInterns();
                  setShowNewMessageModal(true);
                }}
                className="p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left transition-all group"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Initiate Thread</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Start a discussion with any registered intern</p>
              </button>

              <button 
                onClick={() => {
                  fetchAllInterns();
                  setShowNewMessageModal(true);
                  setIsBulkView(true);
                }}
                className="p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left transition-all group"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Send className="h-4 w-4" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">Broadcast Announcement</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Send a message to multiple selected interns</p>
              </button>
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
