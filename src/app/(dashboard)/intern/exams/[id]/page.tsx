'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Maximize2, 
  Camera, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProctoredExamRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  // State Data
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Exam Status State
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  
  // Timer State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

  // Anti-Cheating & Violation State
  const [violationsCount, setViolationsCount] = useState(0);
  const [violationsLog, setViolationsLog] = useState<{ type: string; timestamp: string }[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isDisqualified, setIsDisqualified] = useState(false);

  // Result Summary State
  const [examResult, setExamResult] = useState<any>(null);

  // Webcam Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // Candidate Registration Details Form
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    internId: '',
    phone: '',
    collegeName: ''
  });

  // 1. Fetch Exam Data
  useEffect(() => {
    async function loadExamDetails() {
      if (!id) return;
      try {
        const { getActiveUser } = await import('@/lib/getActiveUser');
        const activeUser = await getActiveUser();
        if (!activeUser) {
          router.push('/login');
          return;
        }
        setUser(activeUser);
        setCandidateForm({
          fullName: activeUser.user_metadata?.full_name || activeUser.full_name || '',
          internId: activeUser.id || activeUser.email || '',
          phone: activeUser.phone || activeUser.user_metadata?.phone || '',
          collegeName: activeUser.user_metadata?.college || ''
        });

        // Fetch Exam
        const { data: examData } = await supabase
          .from('exams')
          .select('*')
          .eq('id', id)
          .single();

        if (examData) {
          setExam(examData);
          setTimeLeftSeconds(examData.duration_minutes * 60);

          // Fetch Questions
          const { data: qData } = await supabase
            .from('exam_questions')
            .select('*')
            .eq('exam_id', id)
            .order('created_at', { ascending: true });

          if (qData) setQuestions(qData);
        }
      } catch (err) {
        console.error('Fetch exam room notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExamDetails();
  }, [id, router]);

  // 2. Start Exam & Enable Fullscreen + Camera
  const startExam = async () => {
    if (!candidateForm.fullName.trim() || !candidateForm.internId.trim()) {
      alert('Please fill in your Official Name and Student/Intern ID before starting the exam.');
      return;
    }

    try {
      // Request Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request notice:', e);
    }

    // Request Camera Access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (e) {
      console.warn('Webcam proctoring permission notice:', e);
    }

    setIsExamStarted(true);
  };

  // 3. Violation Handler
  const triggerViolation = (reason: string) => {
    if (!isExamStarted || isExamFinished || isDisqualified) return;

    const maxAllowed = exam?.max_violations || 5;
    const timestamp = new Date().toISOString();
    const newCount = violationsCount + 1;
    const newLog = [...violationsLog, { type: reason, timestamp }];

    setViolationsCount(newCount);
    setViolationsLog(newLog);
    setWarningMessage(reason);
    setShowWarningModal(true);

    // Check if 5th strike reached (Final strike: Auto submit & close)
    if (newCount >= maxAllowed) {
      setIsDisqualified(true);
      submitExam(newAnswersToScore(), true, newCount, newLog);
    }
  };

  // 4. Anti-Cheating Event Listeners (Tab Switch, Key Combinations, Right Click, Copy/Paste, Window Close/Resize)
  useEffect(() => {
    if (!isExamStarted || isExamFinished) return;

    // A. Tab Visibility Switch & Window Blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab Switch / Window Switch Detected');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('Focus Lost (Switched Window / Closed Application)');
    };

    // B. Fullscreen Exit Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation('Exited Fullscreen Proctored Mode');
      }
    };

    // C. Window Resize / Minimize Detection
    const handleWindowResize = () => {
      if (window.outerWidth < window.screen.width * 0.95 || window.outerHeight < window.screen.height * 0.95) {
        triggerViolation('Browser Window Resized / Minimized');
      }
    };

    // D. Window Close / Refresh Attempt Interception
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      triggerViolation('Attempted to Close or Refresh Browser Window');
      e.preventDefault();
      e.returnValue = 'Warning: Closing browser window will automatically submit and terminate your exam!';
      return e.returnValue;
    };

    // E. Right-Click & Copy/Paste Blocking
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation('Right Click / Context Menu Triggered');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('Copy / Cut / Paste Attempt Detected');
    };

    // F. Developer Tools & Shortcut Blocking
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) ||
        e.altKey
      ) {
        e.preventDefault();
        triggerViolation(`Restricted Shortcut Key Pressed (${e.key})`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExamStarted, isExamFinished, violationsCount]);

  // 5. Exam Countdown Timer
  useEffect(() => {
    if (!isExamStarted || isExamFinished || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(newAnswersToScore(), false, violationsCount, violationsLog);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isExamFinished, timeLeftSeconds]);

  // Calculate current score helper
  const newAnswersToScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_option) {
        score += q.points || 1;
      }
    });
    return score;
  };

  // 6. Submit Exam & Save Results to Database
  const submitExam = async (
    calculatedScore: number, 
    disqualified: boolean = false, 
    finalViolationsCount: number = violationsCount, 
    finalViolationsLog: any[] = violationsLog
  ) => {
    if (isExamFinished) return;
    setIsExamFinished(true);

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = totalPoints > 0 ? Number(((calculatedScore / totalPoints) * 100).toFixed(2)) : 0;
    const passed = !disqualified && percentage >= (exam?.passing_score || 60);

    const payload = {
      exam_id: exam.id,
      intern_id: candidateForm.internId.trim() || user?.id || 'CANDIDATE',
      intern_name: candidateForm.fullName.trim() || user?.user_metadata?.full_name || 'Candidate',
      college_name: candidateForm.collegeName.trim() || null,
      phone: candidateForm.phone.trim() || null,
      score: calculatedScore,
      total_points: totalPoints,
      percentage: percentage,
      passed: passed,
      violations_count: finalViolationsCount,
      violations_log: finalViolationsLog,
      answers: selectedAnswers,
      status: disqualified ? 'disqualified' : 'completed',
      submitted_at: new Date().toISOString()
    };

    setExamResult(payload);

    try {
      await supabase.from('exam_submissions').insert(payload);
    } catch (e) {
      console.warn('Save submission notice:', e);
    }

    // Exit Fullscreen if active
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.warn('Exit fullscreen notice:', e);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Secure Room...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-black uppercase text-red-600">Exam Not Found</h2>
        <button onClick={() => router.push('/intern/exams')} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">
          Return to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. START SCREEN */}
      {!isExamStarted && !isExamFinished && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 md:p-12 space-y-8">
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/30">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
              {exam.domain}
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              {exam.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {exam.description || 'Standard proctored examination.'}
            </p>
          </div>

          {/* Exam Rules Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 text-xs font-bold">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-500" /> Strictly Enforced Anti-Cheating Rules
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Enforced Fullscreen Browser Mode</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Tab-Switching & App Switching Flagged</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Right-Click, Copy & Paste Blocked</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Webcam Proctoring Preview Active</span>
              </li>
            <div className="pt-2 text-[11px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Exceeding {exam.max_violations} cheating violations results in immediate exam disqualification.</span>
            </div>
          </div>

          {/* Candidate Registration Details Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 text-xs font-bold">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-500" /> Candidate Verification & Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Official Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={candidateForm.fullName}
                  onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                  placeholder="Enter your official full name"
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-extrabold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Student / Intern ID *</label>
                <input
                  type="text"
                  required
                  value={candidateForm.internId}
                  onChange={(e) => setCandidateForm({ ...candidateForm, internId: e.target.value })}
                  placeholder="e.g. ZAYA-INT-8942"
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">College / University Name</label>
                <input
                  type="text"
                  value={candidateForm.collegeName}
                  onChange={(e) => setCandidateForm({ ...candidateForm, collegeName: e.target.value })}
                  placeholder="e.g. SRM Institute of Science & Tech"
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              onClick={() => router.push('/intern/exams')}
              className="px-6 py-3.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest"
            >
              Cancel & Exit
            </button>
            <button
              onClick={startExam}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Enter Fullscreen & Begin Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PROCTORED EXAM FEED */}
      {isExamStarted && !isExamFinished && (
        <div className="space-y-6 select-none">
          {/* Top Status Strip */}
          <div className="bg-slate-900 text-white p-5 px-8 rounded-3xl flex items-center justify-between shadow-xl border border-slate-800 sticky top-4 z-30">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">{exam.title}</h3>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Strikes Counter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs font-black">
                <AlertTriangle className="h-4 w-4" />
                <span>Strikes: {violationsCount} / {exam.max_violations}</span>
              </div>

              {/* Timer Display */}
              <div className="flex items-center gap-2 px-5 py-2 bg-blue-600/20 border border-blue-500/40 rounded-2xl text-blue-300 font-mono text-sm font-black">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Main Question Card & Proctor Feed */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Question Box (3 Cols) */}
            <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 space-y-6">
              {questions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
                  No questions available for this exam.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIdx + 1}</span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-relaxed">
                      {questions[currentQuestionIdx]?.question_text}
                    </h2>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {questions[currentQuestionIdx]?.options?.map((opt: string, optIdx: number) => {
                      const isSelected = selectedAnswers[questions[currentQuestionIdx].id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [questions[currentQuestionIdx].id]: optIdx })}
                          className={`w-full p-4 px-6 rounded-2xl text-left text-xs font-extrabold transition-all flex items-center justify-between border ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-[1.01]'
                              : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Navigation Controls */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-30 flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </button>

                    {currentQuestionIdx < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        Next <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => submitExam(newAnswersToScore(), false, violationsCount, violationsLog)}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
                      >
                        Finish & Submit Exam
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Proctor Preview Box (1 Col) */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Camera Proctor
                  </span>
                  <Camera className="h-4 w-4 text-slate-400" />
                </div>
                <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {!hasCameraPermission && (
                    <p className="text-[10px] text-slate-500 text-center px-4 font-bold">Proctor Camera Standby</p>
                  )}
                </div>
              </div>

              {/* Question Navigation Palette */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Palette</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`h-9 rounded-xl font-black text-xs transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHEATING VIOLATION WARNING MODAL */}
      <AnimatePresence>
        {showWarningModal && !isDisqualified && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-red-500 shadow-2xl p-8 max-w-md w-full text-center space-y-5"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <span className="px-3 py-1 bg-red-500/10 text-red-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-red-500/20">
                  Warning {violationsCount} of {exam.max_violations || 5}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2">
                  Security Violation Detected!
                </h3>
                <p className="text-xs text-red-600 font-bold mt-1">
                  Reason: {warningMessage}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Closing windows, swapping browser tabs, or exiting fullscreen is strictly monitored. Reaching {exam.max_violations || 5} warnings will automatically submit and terminate your exam.
              </p>
              <button
                onClick={async () => {
                  setShowWarningModal(false);
                  if (!document.fullscreenElement) {
                    try {
                      await document.documentElement.requestFullscreen();
                    } catch (e) {
                      console.warn('Re-enter fullscreen notice:', e);
                    }
                  }
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/30 transition-all active:scale-95"
              >
                Re-Enter Fullscreen & Resume Test
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. RESULT SUMMARY PAGE */}
      {isExamFinished && examResult && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 md:p-12 space-y-8 text-center max-w-2xl mx-auto">
          <div className="space-y-3">
            {examResult.status === 'disqualified' ? (
              <div className="w-20 h-20 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <XCircle className="h-10 w-10" />
              </div>
            ) : examResult.passed ? (
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <XCircle className="h-10 w-10" />
              </div>
            )}

            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${
              examResult.status === 'disqualified'
                ? 'bg-red-600 text-white border-red-700'
                : examResult.passed
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              {examResult.status === 'disqualified' ? 'DISQUALIFIED (EXCEEDED CHEATING STRIKES)' : examResult.passed ? 'PASSED QUALIFICATION' : 'TEST NOT PASSED'}
            </span>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              {exam.title}
            </h2>
          </div>

          {/* Score Performance Card */}
          <div className="grid grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Percentage Score</span>
              <span className={`text-2xl font-black ${examResult.passed ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                {examResult.percentage}%
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Points Achieved</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {examResult.score} / {examResult.total_points}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Cheating Strikes</span>
              <span className={`text-2xl font-black ${examResult.violations_count > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                {examResult.violations_count}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => router.push('/intern/exams')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              Return to Exams Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
