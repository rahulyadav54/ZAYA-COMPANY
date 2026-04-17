'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { 
  Mail, 
  Search, 
  Loader2, 
  Trash2, 
  Clock, 
  User, 
  ChevronRight,
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setIsLoading(false);
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
            Inbox
          </h1>
          <p className="text-slate-500 mt-1">Manage contact form inquiries and messages.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-600/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* Messages List */}
        <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-bold">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Mail className="h-12 w-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">No messages found.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col gap-1 ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-inset ring-blue-600/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 dark:text-white truncate pr-2">{msg.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-blue-600 truncate">{msg.subject}</div>
                  <div className="text-xs text-slate-400 line-clamp-1">{msg.message}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Content Area */}
        <div className="hidden md:flex flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col h-full"
              >
                {/* Message Header */}
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {selectedMessage.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedMessage.name}</h2>
                      <p className="text-sm text-slate-500 font-medium">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Message Details */}
                <div className="p-8 flex-1 overflow-y-auto space-y-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Subject</span>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                      {selectedMessage.subject}
                    </h3>
                  </div>
                  
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Message</span>
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>

                {/* Message Footer */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center text-sm text-slate-400">
                    <Clock className="h-4 w-4 mr-2" />
                    Sent on {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Reply via Email
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                  <Mail className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold text-slate-400">Select a message to read</h3>
                <p className="text-slate-300 mt-2 max-w-xs mx-auto">Click on any message from the left panel to view its full details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Modal (For selected message on mobile) */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm md:hidden p-4 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Message Details</h3>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {selectedMessage.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{selectedMessage.name}</div>
                    <div className="text-xs text-slate-500">{selectedMessage.email}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Subject</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{selectedMessage.subject}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Message</div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedMessage.message}</div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </button>
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className="py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-2" /> Reply
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
