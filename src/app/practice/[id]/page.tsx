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
  User,
  School,
  Phone,
  Mail,
  Award,
  Download,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicProctoredExamRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  // Exam Data
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Student Form Details
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    studentId: ''
  });

  // Exam Status
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

  // Result State
  const [examResult, setExamResult] = useState<any>(null);

  // Webcam Stream & Mobile Camera Support
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Attach Stream to Video Element when mounted
  useEffect(() => {
    if (isExamStarted && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn('Video element play notice:', e));
    }
  }, [isExamStarted, cameraStream]);

  // Fetch Public Exam Data
  useEffect(() => {
    async function loadExamDetails() {
      if (!id) return;
      try {
        const { data: examData } = await supabase
          .from('exams')
          .select('*')
          .eq('id', id)
          .single();

        if (examData) {
          setExam(examData);
          setTimeLeftSeconds(examData.duration_minutes * 60);

          const { data: qData } = await supabase
            .from('exam_questions')
            .select('*')
            .eq('exam_id', id)
            .order('created_at', { ascending: true });

          if (qData) setQuestions(qData);
        }
      } catch (err) {
        console.error('Fetch public exam notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExamDetails();
  }, [id]);

  // Start Exam & Enable Fullscreen + Mobile/Desktop Camera
  const startExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim() || !studentForm.email.trim()) {
      alert('Please fill in your Official Name and Email Address before starting the test.');
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request notice:', err);
    }

    // Request Camera Access (Mobile Front Camera / Desktop Webcam)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      setHasCameraPermission(true);
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(fallbackStream);
        setHasCameraPermission(true);
      } catch (e) {
        console.warn('Camera stream permission notice:', e);
      }
    }

    setIsExamStarted(true);
  };

  // Violation Handler
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

    if (newCount >= maxAllowed) {
      setIsDisqualified(true);
      submitExam(newAnswersToScore(), true, newCount, newLog);
    }
  };

  // Anti-Cheating Event Listeners
  useEffect(() => {
    if (!isExamStarted || isExamFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) triggerViolation('Tab Switch / Window Switch Detected');
    };

    const handleWindowBlur = () => {
      triggerViolation('Focus Lost (Switched Window / Closed Application)');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) triggerViolation('Exited Fullscreen Proctored Mode');
    };

    const handleWindowResize = () => {
      if (window.outerWidth < window.screen.width * 0.95 || window.outerHeight < window.screen.height * 0.95) {
        triggerViolation('Browser Window Resized / Minimized');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      triggerViolation('Attempted to Close or Refresh Browser Window');
      e.preventDefault();
      e.returnValue = 'Warning: Closing browser window will automatically submit and terminate your exam!';
      return e.returnValue;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation('Right Click / Context Menu Triggered');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('Copy / Cut / Paste Attempt Detected');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 ||
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

  // Countdown Timer
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

  const newAnswersToScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_option) {
        score += q.points || 1;
      }
    });
    return score;
  };

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
      intern_id: studentForm.studentId.trim() || studentForm.email.trim(),
      intern_name: studentForm.fullName.trim(),
      college_name: studentForm.collegeName.trim() || 'Student Candidate',
      phone: studentForm.phone.trim() || null,
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
      console.warn('Save public submission notice:', e);
    }

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Practice Room...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black uppercase text-red-600">Test Not Found</h2>
        <button onClick={() => router.push('/practice')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs">
          Return to Practice Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
      <main className="flex-1 py-10 px-4 sm:px-6 container mx-auto max-w-5xl">
        {/* 1. STUDENT REGISTRATION & START SCREEN */}
        {!isExamStarted && !isExamFinished && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 md:p-12 space-y-8">
            <div className="space-y-3 text-center max-w-2xl mx-auto">
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
                {exam.description || 'Public proctored skill evaluation.'}
              </p>
            </div>

            {/* Candidate Registration Details Form */}
            <form onSubmit={startExam} className="space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 text-xs font-bold">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" /> Student Verification & Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Official Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="e.g. student@college.edu"
                      className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">College / University / Institute</label>
                    <input
                      type="text"
                      value={studentForm.collegeName}
                      onChange={(e) => setStudentForm({ ...studentForm, collegeName: e.target.value })}
                      placeholder="e.g. SRM Institute of Science & Tech"
                      className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Anti-Cheating Rules Summary */}
              <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-3xl border border-blue-200 dark:border-blue-900/40 space-y-3 text-xs font-bold">
                <h4 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Proctored Test Rules
                </h4>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Fullscreen mode is strictly enforced. Swapping tabs, closing windows, or right-clicking will trigger a violation warning. Reaching 5 warnings will auto-submit your test.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/practice')}
                  className="px-6 py-3.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest"
                >
                  Back to Practice Hub
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span>Enter Fullscreen & Begin Test</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. PROCTORED TEST ROOM */}
        {isExamStarted && !isExamFinished && (
          <div className="space-y-6 select-none">
            {/* Top Status Header with ARM Engine Badge */}
            <div className="bg-slate-900 text-white p-5 px-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800 sticky top-4 z-30">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-full uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ARM ENGINE PROCTORING ACTIVE
                    </span>
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-tight italic mt-0.5">{exam.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs font-black">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Strikes: {violationsCount} / {exam.max_violations || 5}</span>
                </div>

                <div className="flex items-center gap-2 px-5 py-2 bg-blue-600/20 border border-blue-500/40 rounded-2xl text-blue-300 font-mono text-sm font-black">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span>{formatTimer(timeLeftSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Questions Grid with Candidate Security Watermark & Copy Protection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 space-y-6 relative overflow-hidden select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                {/* Dynamic ARM Engine Security Watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06] flex items-center justify-center rotate-[-15deg] select-none text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white leading-loose text-center">
                  ARM ENGINE SECURE PROCTORING • CANDIDATE: {studentForm.fullName || 'STUDENT'} • ID: {studentForm.studentId || 'EXAM'} • CONFIDENTIAL DO NOT COPY
                </div>

                {questions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
                    No questions available.
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</span>
                        <span className="px-2.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-red-500/20">
                          🔒 COPY & SELECTION PROTECTED
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white leading-relaxed select-none">
                        {questions[currentQuestionIdx]?.question_text}
                      </h2>
                    </div>

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
                          Submit Test
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Proctor Active
                    </span>
                    <Camera className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {!hasCameraPermission && (
                      <p className="text-[10px] text-slate-500 text-center px-4 font-bold">Camera Standby</p>
                    )}
                  </div>
                </div>

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

        {/* 3. CHEATING WARNING MODAL */}
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
                  Closing windows or swapping tabs is prohibited. Reaching {exam.max_violations || 5} warnings will automatically submit your test.
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
                  Re-Enter Fullscreen & Resume
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 4. RESULT SUMMARY SCORECARD */}
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
                {examResult.status === 'disqualified' ? 'DISQUALIFIED (CHEATING STRIKES EXCEEDED)' : examResult.passed ? 'PASSED SKILL EVALUATION' : 'PRACTICE TEST COMPLETED'}
              </span>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                {exam.title}
              </h2>
              <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                Candidate: {studentForm.fullName} ({studentForm.collegeName || 'Student'})
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Percentage</span>
                <span className={`text-2xl font-black ${examResult.passed ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {examResult.percentage}%
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Points</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {examResult.score} / {examResult.total_points}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Violations</span>
                <span className={`text-2xl font-black ${examResult.violations_count > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                  {examResult.violations_count}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/practice')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Try Another Skill Test
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
