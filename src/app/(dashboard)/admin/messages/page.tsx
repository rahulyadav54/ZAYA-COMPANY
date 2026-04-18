'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, Loader2, User, MessageCircle, Clock, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load unique interns who sent messages
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('intern_messages')
        .select('intern_id, intern_name, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Group by intern_id to get unique conversations
        const unique = Array.from(new Set(data.map(m => m.intern_id)))
          .map(id => data.find(m => m.intern_id === id));
        setConversations(unique);
      }
      setIsLoading(false);
    }
    loadConversations();
  }, []);

  // Load messages for selected intern
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedIntern) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from('intern_messages').insert({
        intern_id: selectedIntern.intern_id,
        intern_name: selectedIntern.intern_name,
        content: newMessage.trim(),
        sender_type: 'admin'
      });

      if (!error) {
        setMessages(prev => [...prev, {
            id: Date.now(),
            content: newMessage.trim(),
            sender_type: 'admin',
            created_at: new Date().toISOString()
        }]);
        setNewMessage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar: Intern List */}
      <div className="w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Inbox</h2>
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
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full pl-6 pr-16 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-sm font-medium focus:border-blue-600 outline-none transition-all shadow-sm text-foreground"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
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
    </div>
  );
}
