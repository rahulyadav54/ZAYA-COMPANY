'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  GraduationCap, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Trash2, 
  HelpCircle, 
  ShieldAlert, 
  Loader2,
  FileSpreadsheet,
  ChevronRight,
  Eye,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'submissions'>('exams');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);

  // Create Exam Form
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    domain: 'Full Stack Web Development',
    duration_minutes: 30,
    passing_score: 60,
    max_violations: 5,
    is_active: true
  });

  // Question Form
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    image_url: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExamsAndSubmissions();
  }, []);

  async function fetchExamsAndSubmissions() {
    setIsLoading(true);
    try {
      // Fetch Exams
      const { data: examData } = await supabase
        .from('exams')
        .select('*, exam_questions(id)')
        .order('created_at', { ascending: false });
      
      if (examData) setExams(examData);

      // Fetch Submissions
      const { data: subData } = await supabase
        .from('exam_submissions')
        .select('*, exams(title, domain)')
        .order('submitted_at', { ascending: false });

      if (subData) setSubmissions(subData);
    } catch (err) {
      console.error('Fetch exams notice:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault();
    if (!newExam.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert({
          title: newExam.title.trim(),
          description: newExam.description.trim(),
          domain: newExam.domain,
          duration_minutes: Number(newExam.duration_minutes),
          passing_score: Number(newExam.passing_score),
          max_violations: Number(newExam.max_violations),
          is_active: newExam.is_active
        })
        .select('*')
        .single();

      if (!error && data) {
        setExams(prev => [data, ...prev]);
        setShowCreateModal(false);
        setNewExam({
          title: '',
          description: '',
          domain: 'Full Stack Web Development',
          duration_minutes: 30,
          passing_score: 60,
          max_violations: 3,
          is_active: true
        });
      }
    } catch (err) {
      console.error('Create exam notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  async function openQuestionManager(exam: any) {
    setSelectedExam(exam);
    setShowQuestionModal(true);
    try {
      const { data } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('created_at', { ascending: true });
      if (data) setExamQuestions(data);
    } catch (e) {
      console.warn('Fetch questions notice:', e);
    }
  }

  const handleBulkUploadJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExam) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!Array.isArray(json)) {
        alert('Invalid JSON format. Expected an array of question objects.');
        return;
      }

      setIsSubmitting(true);
      const formattedQuestions = json.map(q => ({
        exam_id: selectedExam.id,
        question_text: q.question_text || q.question || 'Untitled Question',
        image_url: q.image_url || q.image || q.diagram_url || null,
        options: Array.isArray(q.options) ? q.options : [q.option1 || 'Option A', q.option2 || 'Option B', q.option3 || 'Option C', q.option4 || 'Option D'],
        correct_option: Number(q.correct_option ?? q.answerIndex ?? 0),
        points: Number(q.points || 1)
      }));

      const { data, error } = await supabase
        .from('exam_questions')
        .insert(formattedQuestions)
        .select('*');

      if (!error && data) {
        setExamQuestions(prev => [...prev, ...data]);
        alert(`Successfully uploaded ${data.length} questions into question bank!`);
        fetchExamsAndSubmissions();
      }
    } catch (err) {
      alert('Error parsing JSON file. Please verify JSON format.');
    } finally {
      setIsSubmitting(false);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
    }
  };

  const downloadSampleTemplate = () => {
    const sample = [
      {
        question_text: "What is the primary purpose of the React useEffect hook?",
        image_url: "",
        options: [
          "Managing local component state",
          "Performing side-effects like data fetching",
          "Routing between pages",
          "Styling DOM components"
        ],
        correct_option: 1,
        points: 1
      },
      {
        question_text: "Identify the architectural data flow in the diagram below:",
        image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
        options: ["Microservices Architecture", "Monolithic Architecture", "Event-Driven Serverless", "Peer-to-Peer Network"],
        correct_option: 0,
        points: 1
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_exam_questions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExam || !newQuestion.question_text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const options = [
        newQuestion.option1.trim(),
        newQuestion.option2.trim(),
        newQuestion.option3.trim(),
        newQuestion.option4.trim()
      ];

      const { data, error } = await supabase
        .from('exam_questions')
        .insert({
          exam_id: selectedExam.id,
          question_text: newQuestion.question_text.trim(),
          image_url: newQuestion.image_url.trim() || null,
          options: options,
          correct_option: Number(newQuestion.correct_option),
          points: 1
        })
        .select('*')
        .single();

      if (!error && data) {
        setExamQuestions(prev => [...prev, data]);
        setNewQuestion({
          question_text: '',
          image_url: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_option: 0
        });
        fetchExamsAndSubmissions();
      }
    } catch (err) {
      console.error('Add question notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteQuestion(qId: string) {
    try {
      await supabase.from('exam_questions').delete().eq('id', qId);
      setExamQuestions(prev => prev.filter(q => q.id !== qId));
      fetchExamsAndSubmissions();
    } catch (e) {
      console.warn('Delete question notice:', e);
    }
  }

  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  const toggleSelectSubmission = (subId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const toggleSelectAllSubmissions = () => {
    if (selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(s => s.id));
    }
  };

  async function handleDeleteExam(examId: string) {
    if (!confirm('Are you sure you want to delete this exam? All associated questions will be removed.')) return;
    try {
      await supabase.from('exams').delete().eq('id', examId);
      setExams(prev => prev.filter(e => e.id !== examId));
    } catch (e) {
      console.warn('Delete exam notice:', e);
    }
  }

  async function handleDeleteSubmission(subId: string) {
    if (!confirm('Are you sure you want to permanently delete this submission record from database?')) return;
    try {
      const res = await fetch('/api/admin/delete-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [subId] })
      });
      const data = await res.json();
      if (!res.ok) {
        const { error: directErr } = await supabase.from('exam_submissions').delete().eq('id', subId);
        if (directErr) throw new Error(data.error || directErr.message);
      }

      setSubmissions(prev => prev.filter(s => s.id !== subId));
      setSelectedSubmissions(prev => prev.filter(id => id !== subId));
    } catch (e: any) {
      alert(`Delete Error: ${e.message}\n\nPlease execute the SQL policy in your Supabase SQL Editor to enable RLS deletes.`);
    }
  }

  async function handleBulkDeleteSubmissions() {
    if (selectedSubmissions.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedSubmissions.length} selected submission record(s) from database?`)) return;

    try {
      const res = await fetch('/api/admin/delete-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubmissions })
      });
      const data = await res.json();
      if (!res.ok) {
        const { error: directErr } = await supabase.from('exam_submissions').delete().in('id', selectedSubmissions);
        if (directErr) throw new Error(data.error || directErr.message);
      }

      setSubmissions(prev => prev.filter(s => !selectedSubmissions.includes(s.id)));
      setSelectedSubmissions([]);
    } catch (e: any) {
      alert(`Bulk Delete Error: ${e.message}\n\nPlease execute the SQL policy in your Supabase SQL Editor to enable RLS deletes.`);
    }
  }

  const exportSubmissionsCSV = () => {
    if (submissions.length === 0) {
      alert('No submission data available to export.');
      return;
    }

    const headers = [
      'Candidate Name',
      'Intern/Student ID',
      'College Name',
      'Phone Number',
      'Exam Title',
      'Domain',
      'Score %',
      'Points',
      'Total Points',
      'Result Status',
      'Cheating Strikes',
      'Submitted At'
    ];

    const rows = submissions.map(s => [
      `"${(s.intern_name || 'Candidate').replace(/"/g, '""')}"`,
      `"${(s.intern_id || '').replace(/"/g, '""')}"`,
      `"${(s.college_name || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.exams?.title || 'Examination').replace(/"/g, '""')}"`,
      `"${(s.exams?.domain || '').replace(/"/g, '""')}"`,
      `"${s.percentage}%"`,
      `"${s.score}"`,
      `"${s.total_points}"`,
      `"${s.passed ? 'PASSED' : s.status === 'disqualified' ? 'DISQUALIFIED' : 'FAILED'}"`,
      `"${s.violations_count || 0}"`,
      `"${new Date(s.submitted_at).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam_submissions_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const [selectedSubmissionDomain, setSelectedSubmissionDomain] = useState<string>('ALL');

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submissionDomains = ['ALL', ...Array.from(new Set(submissions.map(s => s.exams?.domain).filter(Boolean)))];

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.intern_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.intern_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.college_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.exams?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedSubmissionDomain === 'ALL' || s.exams?.domain === selectedSubmissionDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 rounded-[2.5rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Anti-Cheating Proctoring Engine</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">Exam Portal System</h1>
          <p className="text-slate-300 text-xs max-w-xl font-medium leading-relaxed">
            Create proctored online examinations with strict fullscreen enforcement, tab-switch detection, right-click blocking, and automated cheating audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Exam</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'exams'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Exams & Quizzes ({exams.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Attempt Results & Logs ({submissions.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exam or candidate..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-blue-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* TAB 1: EXAMS LIST */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Exams...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 p-8 space-y-4">
              <GraduationCap className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">No Exams Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Click "Create New Exam" above to add your first proctored examination.</p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden flex flex-col justify-between p-6 space-y-5 hover:border-blue-500/50 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                      {exam.domain}
                    </span>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                    {exam.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" /> {exam.duration_minutes} mins
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pass Mark</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {exam.passing_score}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Max Violations</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" /> {exam.max_violations}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {exam.exam_questions?.length || 0} Questions
                  </span>
                  <button
                    onClick={() => openQuestionManager(exam)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    <span>Manage Questions</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SUBMISSIONS & CHEATING LOGS */}
      {activeTab === 'submissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden space-y-4">
          <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Attempt Results & Proctoring Audit</h3>
              <p className="text-[10px] text-slate-400">Filter by domain, export report, or select & delete submission records from database</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedSubmissions.length > 0 && (
                <button
                  onClick={handleBulkDeleteSubmissions}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected ({selectedSubmissions.length})</span>
                </button>
              )}
              <button
                onClick={exportSubmissionsCSV}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Domain Filter Bar */}
          <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 mr-1">Filter Domain:</span>
            {submissionDomains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedSubmissionDomain(dom)}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                  selectedSubmissionDomain === dom
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dom} ({dom === 'ALL' ? submissions.length : submissions.filter(s => s.exams?.domain === dom).length})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="p-5 pl-7 w-10">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                      onChange={toggleSelectAllSubmissions}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-5">Candidate</th>
                  <th className="p-5">Exam Title</th>
                  <th className="p-5">Score & Result</th>
                  <th className="p-5">Cheating Violations</th>
                  <th className="p-5">Submitted At</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 text-right pr-7">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400 uppercase font-black tracking-widest">
                      No candidate submissions logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const isSelected = selectedSubmissions.includes(sub.id);
                    return (
                      <tr key={sub.id} className={`transition-colors ${isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'}`}>
                        <td className="p-5 pl-7 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectSubmission(sub.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-5">
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{sub.intern_name || 'Candidate'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{sub.intern_id}</p>
                          {sub.college_name && (
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">🏫 {sub.college_name}</p>
                          )}
                          {sub.phone && (
                            <p className="text-[10px] text-slate-400 font-medium">📞 {sub.phone}</p>
                          )}
                        </td>
                        <td className="p-5 text-slate-700 dark:text-slate-300">
                          <p className="font-bold">{sub.exams?.title || 'Examination'}</p>
                          <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{sub.exams?.domain}</p>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${sub.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                              {sub.percentage}%
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              sub.passed ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                            }`}>
                              {sub.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{sub.score} / {sub.total_points} Points</p>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${sub.violations_count > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
                            <span className={`font-mono font-bold ${sub.violations_count >= 3 ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                              {sub.violations_count} Strike(s)
                            </span>
                          </div>
                          {sub.violations_log?.length > 0 && (
                            <div className="text-[9px] text-slate-400 mt-1 max-w-xs space-y-0.5">
                              {sub.violations_log.map((v: any, i: number) => (
                                <p key={i}>• {v.type || 'Violation'} at {new Date(v.timestamp).toLocaleTimeString()}</p>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-slate-400 text-[11px]">
                          {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            sub.status === 'disqualified' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-5 text-right pr-7">
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            title="Delete submission record permanently"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all active:scale-95"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 max-w-lg w-full space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Proctored Exam</h3>
                    <p className="text-xs text-slate-400 font-bold">Setup anti-cheating test parameters</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExam} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] mb-1">Exam Title *</label>
                  <input
                    type="text"
                    required
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    placeholder="e.g. Full Stack Web Engineering Qualification Test"
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] mb-1">Domain / Category</label>
                  <select
                    value={newExam.domain}
                    onChange={(e) => setNewExam({ ...newExam, domain: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600"
                  >
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                    <option value="Frontend Engineering">Frontend Engineering</option>
                    <option value="Backend Engineering">Backend Engineering</option>
                    <option value="Python & AI Data Science">Python & AI Data Science</option>
                    <option value="UI/UX Product Design">UI/UX Product Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px] mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    placeholder="Brief summary of test topics covered..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Time (Mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={newExam.duration_minutes}
                      onChange={(e) => setNewExam({ ...newExam, duration_minutes: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Pass Score %</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={newExam.passing_score}
                      onChange={(e) => setNewExam({ ...newExam, passing_score: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Max Strikes</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newExam.max_violations}
                      onChange={(e) => setNewExam({ ...newExam, max_violations: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Publish Proctored Exam</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUESTION MANAGER MODAL */}
      <AnimatePresence>
        {showQuestionModal && selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
                <div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Question Bank Manager</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedExam.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={bulkFileInputRef}
                    onChange={handleBulkUploadJSON}
                    className="hidden"
                    accept=".json,application/json"
                  />
                  <button
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Upload Questions JSON
                  </button>
                  <button
                    onClick={downloadSampleTemplate}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-xs font-bold transition-all"
                    title="Download JSON Question Template"
                  >
                    📥 Template
                  </button>
                  <button onClick={() => setShowQuestionModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Questions List & Add Form */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar pr-2">
                {/* Existing Questions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Questions ({examQuestions.length})</h4>
                  {examQuestions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No questions added yet. Use the form below to add MCQs.</p>
                  ) : (
                    examQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3 relative group">
                        <div className="flex items-start justify-between pr-8">
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 opacity-80 hover:opacity-100 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Diagram Thumbnail Preview if present */}
                        {(q.image_url || q.image) && (
                          <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-700 inline-flex items-center gap-3">
                            <img
                              src={q.image_url || q.image}
                              alt="Question Diagram"
                              className="h-16 w-24 object-contain rounded-lg bg-black"
                            />
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">🖼️ Diagram Attached</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {q.options?.map((opt: string, optIdx: number) => (
                            <div 
                              key={optIdx} 
                              className={`p-2 rounded-xl border flex items-center gap-2 ${
                                optIdx === q.correct_option 
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Question Form */}
                <form onSubmit={handleAddQuestion} className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl space-y-4 text-xs font-bold">
                  <h4 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Multiple Choice Question (MCQ)
                  </h4>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Question Text *</label>
                    <input
                      type="text"
                      required
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      placeholder="e.g. Identify the correct output or architecture in the diagram below:"
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">
                      Image / Diagram URL (Optional - Architecture, Code Screenshot, Schematic, Formula)
                    </label>
                    <input
                      type="url"
                      value={newQuestion.image_url}
                      onChange={(e) => setNewQuestion({ ...newQuestion, image_url: e.target.value })}
                      placeholder="https://example.com/diagram.png or https://i.imgur.com/..."
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-mono text-xs"
                    />
                    {newQuestion.image_url && (
                      <div className="mt-2 p-2 bg-slate-900 rounded-xl border border-slate-700 inline-block">
                        <img
                          src={newQuestion.image_url}
                          alt="Diagram Preview"
                          className="h-20 w-auto object-contain rounded-lg"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Option A</label>
                      <input
                        type="text"
                        required
                        value={newQuestion.option1}
                        onChange={(e) => setNewQuestion({ ...newQuestion, option1: e.target.value })}
                        placeholder="Option A"
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Option B</label>
                      <input
                        type="text"
                        required
                        value={newQuestion.option2}
                        onChange={(e) => setNewQuestion({ ...newQuestion, option2: e.target.value })}
                        placeholder="Option B"
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Option C</label>
                      <input
                        type="text"
                        required
                        value={newQuestion.option3}
                        onChange={(e) => setNewQuestion({ ...newQuestion, option3: e.target.value })}
                        placeholder="Option C"
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Option D</label>
                      <input
                        type="text"
                        required
                        value={newQuestion.option4}
                        onChange={(e) => setNewQuestion({ ...newQuestion, option4: e.target.value })}
                        placeholder="Option D"
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] mb-1">Select Correct Answer</label>
                    <select
                      value={newQuestion.correct_option}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: Number(e.target.value) })}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-blue-600"
                    >
                      <option value={0}>Option A is Correct</option>
                      <option value={1}>Option B is Correct</option>
                      <option value={2}>Option C is Correct</option>
                      <option value={3}>Option D is Correct</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Question'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
