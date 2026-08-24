'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSpreadsheet,
  Download,
  Upload,
  Filter,
  BookOpen,
  Brain,
  MessageSquare,
  Briefcase,
  Code,
  Lightbulb,
  ChevronDown,
  X,
} from 'lucide-react';

type QuestionCategory = 'aptitude' | 'verbal' | 'soft_skills' | 'placement' | 'technical' | 'reasoning';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: number;
  category: QuestionCategory;
  subcategory: string | null;
  question_text: string;
  options: string[];
  correct_option: number;
  difficulty: Difficulty;
  explanation: string | null;
  points: number;
  is_active: boolean;
  created_at: string;
}

const categoryConfig: Record<QuestionCategory, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  aptitude: { label: 'Aptitude', icon: Brain, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  verbal: { label: 'Verbal', icon: MessageSquare, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  soft_skills: { label: 'Soft Skills', icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  placement: { label: 'Placement', icon: Briefcase, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  technical: { label: 'Technical', icon: Code, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  reasoning: { label: 'Reasoning', icon: BookOpen, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
};

const difficultyConfig: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-600 bg-emerald-50' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50' },
  hard: { label: 'Hard', color: 'text-red-600 bg-red-50' },
};

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    category: 'aptitude' as QuestionCategory,
    subcategory: '',
    question_text: '',
    options: ['', '', '', ''],
    correct_option: 0,
    difficulty: 'medium' as Difficulty,
    explanation: '',
    points: 1,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  async function fetchQuestions() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch questions error:', error);
        setErrorMessage(`Failed to load questions: ${error.message}`);
        return;
      }
      if (data) {
        setQuestions(data.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
        })));
      }
    } catch (err: any) {
      console.error('Fetch questions error:', err);
      setErrorMessage(`Failed to load questions: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  function filterQuestions() {
    let filtered = questions;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.question_text.toLowerCase().includes(term) ||
        q.subcategory?.toLowerCase().includes(term) ||
        q.explanation?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  }

  function resetForm() {
    setFormData({
      category: 'aptitude',
      subcategory: '',
      question_text: '',
      options: ['', '', '', ''],
      correct_option: 0,
      difficulty: 'medium',
      explanation: '',
      points: 1,
    });
    setEditingQuestion(null);
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(question: Question) {
    setEditingQuestion(question);
    setFormData({
      category: question.category,
      subcategory: question.subcategory || '',
      question_text: question.question_text,
      options: [...question.options, ...Array(4 - question.options.length).fill('')].slice(0, 4),
      correct_option: question.correct_option,
      difficulty: question.difficulty,
      explanation: question.explanation || '',
      points: question.points,
    });
    setShowAddModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (!formData.question_text.trim()) {
      setErrorMessage('Question text is required.');
      return;
    }
    if (formData.options.some(o => !o.trim())) {
      setErrorMessage('All four options are required.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const questionData = {
        category: formData.category,
        subcategory: formData.subcategory.trim() || null,
        question_text: formData.question_text.trim(),
        options: formData.options.map(o => o.trim()),
        correct_option: formData.correct_option,
        difficulty: formData.difficulty,
        explanation: formData.explanation.trim() || null,
        points: formData.points,
        is_active: true,
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('question_bank')
          .update(questionData)
          .eq('id', editingQuestion.id);
        if (error) throw error;
        setSuccessMessage('Question updated successfully!');
      } else {
        const { error } = await supabase
          .from('question_bank')
          .insert(questionData);
        if (error) throw error;
        setSuccessMessage('Question added successfully!');
      }

      setShowAddModal(false);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      console.error('Save question error:', err);
      setErrorMessage(`Failed to save question: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('question_bank')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Delete question error:', err);
      alert('Failed to delete question.');
    }
  }

  async function handleToggleActive(question: Question) {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update({ is_active: !question.is_active })
        .eq('id', question.id);
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          bulkUploadQuestions(json);
        } else {
          alert('Invalid JSON format. Expected an array of questions.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function bulkUploadQuestions(questions: any[]) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const formattedQuestions = questions.map(q => ({
        category: q.category || 'aptitude',
        subcategory: q.subcategory || null,
        question_text: q.question_text || q.question,
        options: Array.isArray(q.options) ? q.options : [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
        correct_option: q.correct_option ?? q.answerIndex ?? 0,
        difficulty: q.difficulty || 'medium',
        explanation: q.explanation || null,
        points: q.points || 1,
        is_active: true,
      })).filter(q => q.question_text && q.options.length >= 2);

      if (formattedQuestions.length === 0) {
        setErrorMessage('No valid questions found in the file. Please check the format.');
        return;
      }

      const { error } = await supabase
        .from('question_bank')
        .insert(formattedQuestions);

      if (error) throw error;

      setSuccessMessage(`Successfully uploaded ${formattedQuestions.length} questions!`);
      fetchQuestions();
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      setErrorMessage(`Failed to upload questions: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  function downloadTemplate() {
    const template = [
      {
        category: 'aptitude',
        subcategory: 'numerical',
        question_text: 'What is 15% of 200?',
        options: ['25', '30', '35', '40'],
        correct_option: 1,
        difficulty: 'easy',
        explanation: '15% of 200 = 0.15 × 200 = 30',
        points: 1
      },
      {
        category: 'verbal',
        subcategory: 'grammar',
        question_text: 'Choose the correct sentence:',
        options: [
          'He go to school every day.',
          'He goes to school every day.',
          'He going to school every day.',
          'He gone to school every day.'
        ],
        correct_option: 1,
        difficulty: 'easy',
        explanation: 'Third person singular requires "goes" in present simple tense.',
        points: 1
      },
      {
        category: 'soft_skills',
        subcategory: 'communication',
        question_text: 'What is the most important aspect of effective communication?',
        options: [
          'Speaking loudly',
          'Active listening',
          'Using complex words',
          'Talking frequently'
        ],
        correct_option: 1,
        difficulty: 'medium',
        explanation: 'Active listening is fundamental to effective communication as it ensures understanding.',
        points: 1
      },
      {
        category: 'placement',
        subcategory: 'aptitude',
        question_text: 'A train travels 360 km in 4 hours. What is its speed?',
        options: ['80 km/h', '90 km/h', '100 km/h', '120 km/h'],
        correct_option: 1,
        difficulty: 'medium',
        explanation: 'Speed = Distance / Time = 360 / 4 = 90 km/h',
        points: 1
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_bank_template.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const stats = {
    total: questions.length,
    aptitude: questions.filter(q => q.category === 'aptitude').length,
    verbal: questions.filter(q => q.category === 'verbal').length,
    soft_skills: questions.filter(q => q.category === 'soft_skills').length,
    placement: questions.filter(q => q.category === 'placement').length,
    technical: questions.filter(q => q.category === 'technical').length,
    reasoning: questions.filter(q => q.category === 'reasoning').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Question Bank</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage questions for all test categories</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {successMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.entries(categoryConfig) as [QuestionCategory, typeof categoryConfig[QuestionCategory]][]).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedCategory === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Icon className={`h-5 w-5 ${config.color}`} />
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stats[key]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as QuestionCategory | 'all')}
              className="appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 pr-8 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
              className="appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 pr-8 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No questions found</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {questions.length === 0
              ? 'Start by adding your first question or bulk upload from a JSON file.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => {
            const category = categoryConfig[question.category];
            const difficulty = difficultyConfig[question.difficulty];
            const CategoryIcon = category.icon;

            return (
              <div
                key={question.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${category.bgColor} ${category.color}`}>
                        <CategoryIcon className="h-3 w-3" />
                        {category.label}
                      </span>
                      {question.subcategory && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                          {question.subcategory}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficulty.color}`}>
                        {difficulty.label}
                      </span>
                      {!question.is_active && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                      {question.question_text}
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            idx === question.correct_option
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEditModal(question)}
                      className="rounded-lg border border-slate-200 dark:border-slate-600 p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(question)}
                      className={`rounded-lg border p-2 transition-colors ${
                        question.is_active
                          ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20'
                          : 'border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700'
                      }`}
                      title={question.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {question.is_active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category & Difficulty */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestionCategory })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subcategory (optional)</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g., numerical, grammar, communication"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Question Text *</label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Answer Options *</label>
                {formData.options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={formData.correct_option === idx}
                      onChange={() => setFormData({ ...formData, correct_option: idx })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-6">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      required
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ))}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select the radio button next to the correct answer.
                </p>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Explanation (optional)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is right..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Points</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                  className="w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.question_text.trim() || formData.options.some(o => !o.trim())}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}