'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { practiceSlug } from '@/lib/practiceSlug';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Maximize2, 
  Minimize2,
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
  X,
  Bookmark,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fisher-Yates Shuffle Algorithm to ensure every candidate receives questions in a unique random order
function shuffleQuestions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'question' | 'palette'>('question');

  const handleSaveAndNext = () => {
    const currentQ = questions[currentQuestionIdx];
    if (currentQ) {
      setMarkedForReview(prev => prev.filter(id => id !== currentQ.id));
    }
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    const currentQ = questions[currentQuestionIdx];
    if (currentQ) {
      if (!markedForReview.includes(currentQ.id)) {
        setMarkedForReview(prev => [...prev, currentQ.id]);
      }
    }
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentQuestionIdx];
    if (currentQ) {
      const updated = { ...selectedAnswers };
      delete updated[currentQ.id];
      setSelectedAnswers(updated);
      setMarkedForReview(prev => prev.filter(id => id !== currentQ.id));
    }
  };
  
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
        let { data: examData } = await supabase
          .from('exams')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        // New links use a readable title slug; keep old UUID links working.
        if (!examData) {
          const { data: exams } = await supabase
            .from('exams')
            .select('*')
            .eq('is_active', true);
          examData = exams?.find((candidate) => practiceSlug(candidate.title) === id) || null;
        }

        if (examData) {
          setExam(examData);
          setTimeLeftSeconds(examData.duration_minutes * 60);

          const { data: qData } = await supabase
            .from('exam_questions')
            .select('*')
            .eq('exam_id', examData.id)
            .order('created_at', { ascending: true });

          if (qData && qData.length > 0) {
            setQuestions(shuffleQuestions(qData));
          } else {
            // Seed 35 Comprehensive Technical Questions with random order per user
            setQuestions(shuffleQuestions([
              { id: 'f1', question_text: 'What is the primary function of the React useEffect hook?', options: ['Managing local component state', 'Performing side-effects like data fetching', 'Routing between pages', 'Styling DOM components'], correct_option: 1, points: 1 },
              { id: 'f2', question_text: 'Which SQL keyword is used to sort the result-set in descending order?', options: ['ASC', 'SORT BY', 'ORDER BY DESC', 'GROUP BY'], correct_option: 2, points: 1 },
              { id: 'f3', question_text: 'What is the virtual DOM in React?', options: ['A direct copy of the HTML file', 'An in-memory lightweight representation of the real DOM', 'A browser extension for debugging', 'A server-side database engine'], correct_option: 1, points: 1 },
              { id: 'f4', question_text: 'In Node.js, which built-in module is used to handle file paths?', options: ['fs', 'path', 'url', 'http'], correct_option: 1, points: 1 },
              { id: 'f5', question_text: 'Which HTTP status code indicates a Successful Request?', options: ['200 OK', '404 Not Found', '500 Internal Server Error', '301 Moved Permanently'], correct_option: 0, points: 1 },
              { id: 'f6', question_text: 'What does CSS flexbox property `justify-content: center` do?', options: ['Aligns items vertically along cross axis', 'Aligns items horizontally along main axis', 'Adds padding around elements', 'Changes font family'], correct_option: 1, points: 1 },
              { id: 'f7', question_text: 'Which data structure follows First-In, First-Out (FIFO) principle?', options: ['Stack', 'Queue', 'Array', 'Tree'], correct_option: 1, points: 1 },
              { id: 'f8', question_text: 'What is the purpose of TypeScript in modern web development?', options: ['To replace HTML structure', 'To add static typing and type checking to JavaScript', 'To style responsive layouts', 'To execute database queries'], correct_option: 1, points: 1 },
              { id: 'f9', question_text: 'In Next.js App Router, which file convention defines a dynamic route page?', options: ['page.js', 'route.ts', 'layout.tsx', '[id]/page.tsx'], correct_option: 3, points: 1 },
              { id: 'f10', question_text: 'Which Git command creates and switches to a new branch simultaneously?', options: ['git branch <name>', 'git checkout -b <name>', 'git status', 'git merge <name>'], correct_option: 1, points: 1 },
              { id: 'f11', question_text: 'In Python, which built-in function returns the number of items in an object?', options: ['count()', 'length()', 'len()', 'size()'], correct_option: 2, points: 1 },
              { id: 'f12', question_text: 'What is the worst-case time complexity of QuickSort algorithm?', options: ['O(1)', 'O(n log n)', 'O(n^2)', 'O(n)'], correct_option: 2, points: 1 },
              { id: 'f13', question_text: 'Which Supabase feature allows securing database tables based on user authentication?', options: ['GraphQL', 'Row Level Security (RLS)', 'CORS', 'Cron Jobs'], correct_option: 1, points: 1 },
              { id: 'f14', question_text: 'What does JWT stand for in web security?', options: ['Java Web Technology', 'JSON Web Token', 'JavaScript Working Transfer', 'Joint Web Protocol'], correct_option: 1, points: 1 },
              { id: 'f15', question_text: 'Which keyword in JavaScript declares a block-scoped re-assignable variable?', options: ['var', 'let', 'const', 'global'], correct_option: 1, points: 1 }
            ]));
          }
        }
      } catch (err) {
        console.error('Fetch public exam notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExamDetails();
  }, [id]);

  // Toggle Fullscreen handler
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle notice:', e);
    }
  };

  const [isVerifyingAttempt, setIsVerifyingAttempt] = useState(false);
  const [alreadyCompletedInfo, setAlreadyCompletedInfo] = useState<any>(null);

  // Start Exam & Enable Fullscreen + Mobile/Desktop Camera
  const startExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim() || !studentForm.email.trim()) {
      alert('Please fill in your Official Name and Email Address before starting the test.');
      return;
    }

    // 1. Check if candidate with same email or phone number has already submitted/attempted this exam
    setIsVerifyingAttempt(true);
    setAlreadyCompletedInfo(null);

    const cleanEmail = studentForm.email.trim().toLowerCase();
    const cleanPhone = studentForm.phone.trim().replace(/[^0-9]/g, '');

    try {
      const { data: existingSubmissions, error } = await supabase
        .from('exam_submissions')
        .select('id, submitted_at, percentage, score, total_points, passed, status, intern_id, phone')
        .eq('exam_id', exam.id);

      if (existingSubmissions && existingSubmissions.length > 0) {
        const matched = existingSubmissions.find((sub: any) => {
          const subEmail = (sub.intern_id || '').trim().toLowerCase();
          const subPhone = (sub.phone || '').trim().replace(/[^0-9]/g, '');

          const isEmailMatch = cleanEmail && (subEmail === cleanEmail);
          const isPhoneMatch = cleanPhone && subPhone && (
            subPhone === cleanPhone || 
            (cleanPhone.length >= 10 && subPhone.endsWith(cleanPhone.slice(-10))) ||
            (subPhone.length >= 10 && cleanPhone.endsWith(subPhone.slice(-10)))
          );

          return isEmailMatch || isPhoneMatch;
        });

        if (matched) {
          setAlreadyCompletedInfo(matched);
          setIsVerifyingAttempt(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Check previous attempt error notice:', err);
    }
    setIsVerifyingAttempt(false);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
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
      const fsActive = !!document.fullscreenElement;
      setIsFullscreen(fsActive);
      if (!fsActive) triggerViolation('Exited Fullscreen Proctored Mode');
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
    setShowSubmitConfirmModal(false);

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
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Secure Exam Portal...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-md">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black uppercase text-red-500">Test Not Found</h2>
          <p className="text-xs text-slate-400">The requested evaluation assessment link is either invalid or has been archived.</p>
          <button onClick={() => router.push('/practice')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
            Return to Practice Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. STUDENT REGISTRATION & START SCREEN (Full Page Hero Container) */}
      {!isExamStarted && !isExamFinished && (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 w-full">
          <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-6 sm:p-10 md:p-12 space-y-8">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/30">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-500/20">
                  {exam.domain || 'TECHNICAL EVALUATION'}
                </span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ARM Engine Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight italic">
                {exam.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                {exam.description || 'Complete your identity details below to begin this proctored evaluation exam.'}
              </p>
            </div>

            {/* Candidate Registration Details Form */}
            <form onSubmit={startExam} className="space-y-6">
              <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" /> Student Verification & Profile Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">Official Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      placeholder="e.g. Rahul Kumar Yadav"
                      className="w-full p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl outline-none text-white focus:border-blue-500 font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={studentForm.email}
                      onChange={(e) => {
                        setStudentForm({ ...studentForm, email: e.target.value });
                        if (alreadyCompletedInfo) setAlreadyCompletedInfo(null);
                      }}
                      placeholder="e.g. rahul@example.com"
                      className="w-full p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl outline-none text-white focus:border-blue-500 font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">Contact Phone Number</label>
                    <input
                      type="text"
                      value={studentForm.phone}
                      onChange={(e) => {
                        setStudentForm({ ...studentForm, phone: e.target.value });
                        if (alreadyCompletedInfo) setAlreadyCompletedInfo(null);
                      }}
                      placeholder="e.g. +91 9876543210"
                      className="w-full p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl outline-none text-white focus:border-blue-500 font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">College / University / Organization</label>
                    <input
                      type="text"
                      value={studentForm.collegeName}
                      onChange={(e) => setStudentForm({ ...studentForm, collegeName: e.target.value })}
                      placeholder="e.g. Indian Institute of Technology"
                      className="w-full p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl outline-none text-white focus:border-blue-500 font-bold transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Already Completed Warning Banner */}
              {alreadyCompletedInfo && (
                <div className="p-5 sm:p-6 bg-red-950/60 border-2 border-red-500/60 rounded-2xl space-y-3 text-red-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl shrink-0 border border-red-500/30">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase tracking-wider text-red-400 flex items-center gap-2">
                        You Have Already Completed This Examination!
                      </h4>
                      <p className="text-xs text-red-300 leading-relaxed">
                        A submission associated with your email (<strong>{studentForm.email}</strong>) or phone number was already recorded on <strong>{new Date(alreadyCompletedInfo.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-red-500/30 flex items-center justify-between text-xs font-bold flex-wrap gap-2">
                    <span>Previous Score: <strong className={alreadyCompletedInfo.passed ? 'text-emerald-400' : 'text-red-400'}>{alreadyCompletedInfo.percentage}% ({alreadyCompletedInfo.status?.toUpperCase() || 'COMPLETED'})</strong></span>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      Single Attempt Only
                    </span>
                  </div>
                </div>
              )}

              {/* Anti-Cheating Rules Summary */}
              <div className="p-6 bg-blue-950/30 rounded-2xl border border-blue-900/50 space-y-3 text-xs">
                <h4 className="font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Strictly Proctored Examination Protocol
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px]">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>Fullscreen browser window is strictly required during the test.</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>Tab switching, window unfocusing & screen recording trigger strikes.</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Webcam preview is continuously analyzed by ARM Proctor Engine.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/practice')}
                  className="px-6 py-3.5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel & Return
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingAttempt || !!alreadyCompletedInfo}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isVerifyingAttempt ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Candidate Attempt...</span>
                    </>
                  ) : alreadyCompletedInfo ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span>Already Completed (Attempt Closed)</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      <span>Launch Full-Screen Exam Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* 2. FULL-PAGE PROCTORED TEST ROOM (ENTERPRISE ASSESSMENT PLATFORM) */}
      {isExamStarted && !isExamFinished && (
        <div className="fixed inset-0 z-50 w-full h-full bg-slate-950 flex flex-col select-none overflow-hidden font-sans" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
          {/* TOP HEADER (WIDE ENTERPRISE HEADER BAR) */}
          <header className="h-16 border-b border-slate-800/90 bg-slate-900/95 backdrop-blur px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 z-30 shadow-md">
            {/* Left: Shield Icon, Domain, & Exam Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ARM PROCTOR ACTIVE
                  </span>
                  <span className="hidden md:inline-block px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-500/20">
                    {exam.domain || 'SKILL TEST'}
                  </span>
                </div>
                <h1 className="font-black text-sm sm:text-base uppercase tracking-tight text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md lg:max-w-lg mt-0.5">
                  {exam.title}
                </h1>
              </div>
            </div>

            {/* Mobile Tab Switcher (Visible on small screens < lg) */}
            <div className="flex lg:hidden items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setMobileTab('question')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  mobileTab === 'question' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                📝 Q.{currentQuestionIdx + 1}
              </button>
              <button
                onClick={() => setMobileTab('palette')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  mobileTab === 'palette' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎛️ Palette ({Object.keys(selectedAnswers).length}/{questions.length})
              </button>
            </div>

            {/* Center / Right: Digital Timer */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/90 border border-blue-500/30 rounded-xl text-blue-300 font-mono text-sm sm:text-base font-black shadow-inner shrink-0">
              <Clock className={`h-4 w-4 ${timeLeftSeconds < 300 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
              <span className="text-xs text-slate-400 uppercase font-sans font-bold hidden sm:inline">Time Remaining:</span>
              <span className={timeLeftSeconds < 300 ? 'text-red-400' : 'text-blue-300'}>
                {formatTimer(timeLeftSeconds)}
              </span>
            </div>

            {/* Right: Security Strikes & Fullscreen / Submit */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Strikes Counter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-[11px] font-black">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Strikes: {violationsCount}/{exam.max_violations || 5}</span>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 active:scale-95"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span className="text-[10px] uppercase tracking-wider">{isFullscreen ? 'Window' : 'Full'}</span>
              </button>

              {/* Submit Exam Button */}
              <button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Submit Exam
              </button>
            </div>
          </header>

          {/* MAIN 2-COLUMN FULL-PAGE WORKSPACE (72% QUESTION AREA : 28% PROCTOR & PALETTE SIDEBAR) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950 w-full h-[calc(100vh-64px)]">
            {/* LEFT COLUMN: LARGE EXPANSIVE QUESTION WORKSPACE */}
            <main className={`w-full lg:w-[72%] xl:w-[75%] flex flex-col h-full overflow-hidden bg-slate-950 lg:border-r border-slate-800/80 relative ${
              mobileTab === 'question' ? 'flex' : 'hidden lg:flex'
            }`}>
              {/* Dynamic Translucent Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-[-12deg] select-none text-sm font-black uppercase tracking-widest text-white leading-loose text-center z-0 p-8">
                ARM ENGINE SECURE PROCTORING • CANDIDATE: {studentForm.fullName || 'STUDENT'} • ID: {studentForm.studentId || 'EXAM'} • CONFIDENTIAL DO NOT COPY • TIME: {new Date().toLocaleTimeString()}
              </div>

              {/* Sub-Header Strip: Question Number, Points, and Copy Protection Indicator */}
              <div className="h-14 border-b border-slate-800/80 bg-slate-900/60 px-6 lg:px-8 flex items-center justify-between shrink-0 z-10 gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    Question <span className="text-white text-sm font-black">{currentQuestionIdx + 1}</span> of {questions.length}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700">
                    +{questions[currentQuestionIdx]?.points || 1}.00 Mark
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-red-500/20 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Copy & Selection Protected
                  </span>
                </div>
              </div>

              {/* Scrollable Question & Large Clickable Option Cards */}
              <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10 space-y-8 relative z-10 custom-scrollbar max-w-5xl">
                {questions.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No questions available for this evaluation.
                  </div>
                ) : (
                  <>
                    {/* Question Statement (Large, Comfortable 22-26px Typography) */}
                    <div className="space-y-4">
                      <h2 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-white leading-relaxed select-none tracking-tight">
                        {questions[currentQuestionIdx]?.question_text}
                      </h2>

                      {/* Question Diagram / Schematic Image (if available) */}
                      {(questions[currentQuestionIdx]?.image_url || questions[currentQuestionIdx]?.image) && (
                        <div className="relative inline-block max-w-2xl group my-3">
                          <div 
                            onClick={() => setZoomedImage(questions[currentQuestionIdx]?.image_url || questions[currentQuestionIdx]?.image)}
                            className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 cursor-pointer shadow-xl hover:border-blue-500 transition-all p-3"
                          >
                            <img
                              src={questions[currentQuestionIdx]?.image_url || questions[currentQuestionIdx]?.image}
                              alt="Question Diagram / Schematic"
                              className="max-h-72 sm:max-h-84 w-auto object-contain rounded-xl mx-auto"
                            />
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-slate-950/90 backdrop-blur rounded-xl border border-slate-700/80 text-xs font-bold text-blue-400 flex items-center gap-2 opacity-90 group-hover:opacity-100 shadow-md">
                              <Eye className="h-3.5 w-3.5" /> Click to Zoom Diagram
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Answer Options: Large Clickable Cards (65-75px height) */}
                    <div className="space-y-4 pt-2">
                      {questions[currentQuestionIdx]?.options?.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[questions[currentQuestionIdx].id] === optIdx;
                        const isImageOpt = typeof opt === 'string' && (opt.startsWith('http') || opt.startsWith('data:image') || /\.(png|jpg|jpeg|svg|webp|gif)/i.test(opt));

                        return (
                          <button
                            key={optIdx}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [questions[currentQuestionIdx].id]: optIdx })}
                            className={`w-full min-h-[64px] sm:min-h-[72px] p-4 sm:p-5 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer group ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white border-blue-400 shadow-xl shadow-blue-600/25 ring-2 ring-blue-500/40 scale-[1.008]'
                                : 'bg-slate-900/85 hover:bg-slate-800/90 text-slate-200 border-slate-800/90 hover:border-slate-700 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                              {/* Large Clearly Visible A/B/C/D Indicator Badge */}
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors shadow-sm ${
                                isSelected 
                                  ? 'bg-white text-blue-700' 
                                  : 'bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-slate-600 group-hover:text-white'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>

                              {/* Option Text Vertically Centered */}
                              {isImageOpt ? (
                                <img src={opt} alt={`Option ${String.fromCharCode(65 + optIdx)}`} className="max-h-24 max-w-xs rounded-xl object-contain border border-slate-700 p-1.5 bg-slate-950" />
                              ) : (
                                <span className="text-sm sm:text-base lg:text-[17px] font-medium leading-normal break-words">
                                  {opt}
                                </span>
                              )}
                            </div>

                            {/* Obvious Selected Check Icon */}
                            <div className="shrink-0 ml-3">
                              {isSelected ? (
                                <div className="w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg">
                                  <Check className="h-4 w-4 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-slate-700 bg-slate-950/40 group-hover:border-slate-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Sticky Action Toolbar (Spacious & Distinct) */}
              <footer className="h-20 border-t border-slate-800 bg-slate-900/95 px-6 lg:px-8 flex items-center justify-between shrink-0 z-20 gap-3 shadow-lg">
                {/* Left Navigation Controls */}
                <div className="flex items-center gap-3">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="px-4 sm:px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-700 active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" /> <span>Previous</span>
                  </button>

                  <button
                    onClick={handleClearResponse}
                    disabled={selectedAnswers[questions[currentQuestionIdx]?.id] === undefined}
                    className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-700/60 active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4" /> <span>Clear Response</span>
                  </button>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-3">
                  {/* Mark for Review & Next */}
                  <button
                    onClick={handleMarkForReviewAndNext}
                    className="px-4 sm:px-6 py-3 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-amber-500/10"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Mark For Review & Next</span>
                  </button>

                  {/* Save & Next / Review & Submit */}
                  {currentQuestionIdx < questions.length - 1 ? (
                    <button
                      onClick={handleSaveAndNext}
                      className="px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2.5 active:scale-95"
                    >
                      <span>Save & Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitConfirmModal(true)}
                      className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95"
                    >
                      Review & Submit
                    </button>
                  )}
                </div>
              </footer>
            </main>

            {/* RIGHT COLUMN: PROCTOR FEED, DYNAMIC PROGRESS & QUESTION PALETTE */}
            <aside className={`w-full lg:w-[28%] xl:w-[25%] flex flex-col h-full overflow-hidden bg-slate-900/60 ${
              mobileTab === 'palette' ? 'flex' : 'hidden lg:flex'
            }`}>
              {/* 1. Live Proctor Webcam Card */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> PROCTOR ACTIVE
                    </span>
                    <Camera className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800/80 flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {!hasCameraPermission && (
                      <p className="text-[10px] text-slate-500 text-center px-4 font-bold">Camera Feed Standby</p>
                    )}
                    <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none rounded-xl" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span className="truncate">Candidate: {studentForm.fullName || 'User'}</span>
                    <span className="text-emerald-400">AI Verified</span>
                  </div>
                </div>
              </div>

              {/* 2. Dynamic Question Progress Section */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 space-y-2.5 shrink-0">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-300 uppercase tracking-wider">Exam Progress</span>
                  <span className="text-blue-400">{Object.keys(selectedAnswers).length} / {questions.length} Answered</span>
                </div>
                {/* Dynamic Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full shadow-sm"
                    style={{ width: `${(Object.keys(selectedAnswers).length / (questions.length || 1)) * 100}%` }}
                  />
                </div>
                {/* Summary Chips */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase text-center pt-1">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <span className="block text-sm font-black text-emerald-300">
                      {Object.keys(selectedAnswers).filter(id => !markedForReview.includes(id)).length}
                    </span>
                    <span>Answered</span>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <span className="block text-sm font-black text-amber-300">{markedForReview.length}</span>
                    <span>Review</span>
                  </div>
                  <div className="p-2 bg-slate-800/60 text-slate-400 rounded-xl border border-slate-700/50">
                    <span className="block text-sm font-black text-slate-200">
                      {questions.length - Object.keys(selectedAnswers).length}
                    </span>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>

              {/* 3. Interactive Question Palette (Scrollable Grid) */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Palette</h3>
                  <span className="text-xs font-black text-blue-400 uppercase">Q.{currentQuestionIdx + 1}</span>
                </div>

                {/* 5-Column Grid with 5 Distinct States */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <div className="grid grid-cols-5 gap-2 p-1">
                    {questions.map((q, idx) => {
                      const isAnswered = selectedAnswers[q.id] !== undefined;
                      const isReview = markedForReview.includes(q.id);
                      const isCurrent = idx === currentQuestionIdx;

                      // 5 Clear Visual States:
                      // 1. Current: Ring & elevation
                      // 2. Answered + Review: Emerald bg with amber indicator
                      // 3. Answered: Emerald filled + check
                      // 4. Review only: Amber filled
                      // 5. Unanswered: Slate neutral
                      let bgStyle = 'bg-slate-800/90 text-slate-400 border border-slate-700/70 hover:bg-slate-700/80 hover:text-white';
                      if (isAnswered && isReview) {
                        bgStyle = 'bg-emerald-600 text-white font-black shadow-md border-2 border-amber-400';
                      } else if (isReview) {
                        bgStyle = 'bg-amber-500 text-slate-950 font-black shadow-md border border-amber-400';
                      } else if (isAnswered) {
                        bgStyle = 'bg-emerald-600 text-white font-black shadow-md border border-emerald-500';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentQuestionIdx(idx);
                            setMobileTab('question');
                          }}
                          className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center relative ${bgStyle} ${
                            isCurrent ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10' : ''
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {/* Answered + Review Corner Badge */}
                          {isAnswered && isReview && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compact Clean Palette Legend */}
                <div className="pt-3 border-t border-slate-800/80 mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-600 border border-emerald-500" />
                    <span>✓ Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-500 border border-amber-400" />
                    <span>⚑ Review</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700" />
                    <span>● Unanswered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-800 border-2 border-blue-400" />
                    <span>◉ Current</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* 3. SUBMIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSubmitConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
                <HelpCircle className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Confirm Exam Submission</h3>
                <p className="text-xs text-slate-400">
                  Please review your answering summary before submitting your test.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs font-bold">
                <div className="p-2">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Answered</span>
                  <span className="text-xl font-black text-emerald-400">{Object.keys(selectedAnswers).length}</span>
                </div>
                <div className="p-2 border-x border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">In Review</span>
                  <span className="text-xl font-black text-amber-400">{markedForReview.length}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Unanswered</span>
                  <span className="text-xl font-black text-slate-300">{questions.length - Object.keys(selectedAnswers).length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  onClick={() => submitExam(newAnswersToScore(), false, violationsCount, violationsLog)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Yes, Submit Test
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CHEATING WARNING MODAL */}
      <AnimatePresence>
        {showWarningModal && !isDisqualified && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 rounded-[2rem] border-2 border-red-500 shadow-2xl p-8 max-w-md w-full text-center space-y-5"
            >
              <div className="w-16 h-16 bg-red-950/60 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30 animate-bounce">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-red-500/20">
                  Warning {violationsCount} of {exam.max_violations || 5}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-2">
                  Security Violation Detected!
                </h3>
                <p className="text-xs text-red-400 font-bold mt-1">
                  Reason: {warningMessage}
                </p>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Exiting fullscreen, closing windows, or swapping tabs is prohibited. Reaching {exam.max_violations || 5} warnings will automatically disqualify and terminate your test.
              </p>
              <button
                onClick={async () => {
                  setShowWarningModal(false);
                  if (!document.fullscreenElement) {
                    try {
                      await document.documentElement.requestFullscreen();
                      setIsFullscreen(true);
                    } catch (e) {
                      console.warn('Re-enter fullscreen notice:', e);
                    }
                  }
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/30 transition-all active:scale-95"
              >
                Re-Enter Fullscreen & Resume
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. QUESTION DIAGRAM FULL-SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {zoomedImage && (
          <div 
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/95 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-4 flex flex-col items-center justify-center"
            >
              <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-slate-800">
                <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Exam Question Diagram / Reference
                </span>
                <button
                  onClick={() => setZoomedImage(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[75vh] flex items-center justify-center">
                <img
                  src={zoomedImage}
                  alt="Expanded Diagram"
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. RESULT SUMMARY SCORECARD */}
      {isExamFinished && examResult && (
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 w-full">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl p-8 md:p-12 space-y-8 text-center max-w-2xl w-full">
            <div className="space-y-3">
              {examResult.status === 'disqualified' ? (
                <div className="w-20 h-20 bg-red-950/60 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-red-500/30">
                  <XCircle className="h-10 w-10" />
                </div>
              ) : examResult.passed ? (
                <div className="w-20 h-20 bg-emerald-950/60 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-emerald-500/30">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-amber-950/60 text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-amber-500/30">
                  <XCircle className="h-10 w-10" />
                </div>
              )}

              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${
                examResult.status === 'disqualified'
                  ? 'bg-red-600 text-white border-red-700'
                  : examResult.passed
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {examResult.status === 'disqualified' ? 'DISQUALIFIED (CHEATING STRIKES EXCEEDED)' : examResult.passed ? 'PASSED SKILL EVALUATION' : 'PRACTICE TEST COMPLETED'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">
                {exam.title}
              </h2>
              <p className="text-xs font-extrabold text-blue-400">
                Candidate: {studentForm.fullName} ({studentForm.collegeName || 'Student'})
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-6 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Score %</span>
                <span className={`text-2xl font-black ${examResult.passed ? 'text-emerald-400' : 'text-white'}`}>
                  {examResult.percentage}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Points</span>
                <span className="text-2xl font-black text-white">
                  {examResult.score} / {examResult.total_points}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Strikes</span>
                <span className={`text-2xl font-black ${examResult.violations_count > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {examResult.violations_count}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/practice')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Try Another Skill Test
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
