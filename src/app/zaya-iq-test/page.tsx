'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  MailCheck,
  Play,
  Shield,
  Sparkles,
  TimerReset,
  Trophy,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { downloadAsPDF, downloadAsPNG } from '@/lib/downloadHelper';
import CertificateCard from '@/components/zaya-iq/CertificateCard';
import PerformanceChart from '@/components/zaya-iq/PerformanceChart';
import {
  AnswerMap,
  buildPerformanceAnalysis,
  buildShuffledQuestions,
  createAttemptId,
  createCertificateId,
  formatDuration,
  getPerformanceLabel,
  makeVerificationUrl,
  shuffleWithSeed,
  summarizeResults,
  type ShuffledQuestion,
  type ZayaIqScoreBreakdown,
} from '@/lib/zayaIqTestUtils';
import { difficultyOrder, sampleQuestion, zayaIqQuestions } from '@/lib/zayaIqTestData';

type Stage = 'landing' | 'sample' | 'test' | 'result';

type ProfileForm = {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  country: string;
};

type AnalysisData = ReturnType<typeof buildPerformanceAnalysis> | null;

const TEST_DURATION_SECONDS = 20 * 60;
const STORAGE_KEY = 'zaya-iq-test-session';
const CERTIFICATE_STORAGE_KEY = 'zaya-iq-test-certificates';

function bucketAndShuffleQuestions(seed: string) {
  const ordered = difficultyOrder.flatMap((difficulty) =>
    shuffleWithSeed(
      zayaIqQuestions.filter((question) => question.difficulty === difficulty),
      `${seed}-${difficulty}`,
    ),
  );
  return buildShuffledQuestions(ordered, seed);
}

function normalizeGmail(input: string) {
  return input.trim().toLowerCase();
}

function isValidGmail(input: string) {
  return /^[^\s@]+@gmail\.com$/i.test(input.trim());
}

function getCategoryAccent(category: string) {
  if (category.includes('Numerical')) return 'bg-emerald-500';
  if (category.includes('Logical')) return 'bg-blue-500';
  if (category.includes('Pattern')) return 'bg-amber-500';
  if (category.includes('Verbal')) return 'bg-violet-500';
  if (category.includes('Analytical')) return 'bg-cyan-500';
  if (category.includes('Problem')) return 'bg-rose-500';
  return 'bg-slate-600';
}

export default function ZayaIqTestPage() {
  const [stage, setStage] = useState<Stage>('landing');
  const [sampleSelection, setSampleSelection] = useState('');
  const [sampleFeedback, setSampleFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const [attemptId, setAttemptId] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [submittedAt, setSubmittedAt] = useState<number>(0);
  const [testError, setTestError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [integrityNotice, setIntegrityNotice] = useState('Test integrity tools are active.');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION_SECONDS);

  const [result, setResult] = useState<ZayaIqScoreBreakdown | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData>(null);
  const [gmail, setGmail] = useState('');
  const [gmailConsent, setGmailConsent] = useState(false);
  const [gmailError, setGmailError] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    country: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileComplete, setProfileComplete] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const certificateRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const completionPercent = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.stage === 'test' && Array.isArray(parsed.questions)) {
        setStage('test');
        setAttemptId(parsed.attemptId || '');
        setQuestions(parsed.questions);
        setCurrentIndex(parsed.currentIndex || 0);
        setAnswers(parsed.answers || {});
        setStartedAt(parsed.startedAt || Date.now());
        setSubmittedAt(parsed.submittedAt || 0);
        setTimerEnabled(Boolean(parsed.timerEnabled));
        setTimeRemaining(typeof parsed.timeRemaining === 'number' ? parsed.timeRemaining : TEST_DURATION_SECONDS);
        setWarningCount(parsed.warningCount || 0);
        setIntegrityNotice(parsed.integrityNotice || 'Test integrity tools are active.');
      }

      if (parsed?.stage === 'result' && parsed.result) {
        setStage('result');
        setAttemptId(parsed.attemptId || '');
        setCertificateId(parsed.certificateId || '');
        setQuestions(parsed.questions || []);
        setCurrentIndex(parsed.currentIndex || 0);
        setAnswers(parsed.answers || {});
        setStartedAt(parsed.startedAt || Date.now());
        setSubmittedAt(parsed.submittedAt || Date.now());
        setTimerEnabled(Boolean(parsed.timerEnabled));
        setTimeRemaining(typeof parsed.timeRemaining === 'number' ? parsed.timeRemaining : TEST_DURATION_SECONDS);
        setWarningCount(parsed.warningCount || 0);
        setIntegrityNotice(parsed.integrityNotice || 'Test integrity tools are active.');
        setResult(parsed.result);
        setAnalysis(parsed.analysis || null);
        setGmail(parsed.gmail || '');
        setGmailConsent(Boolean(parsed.gmailConsent));
        setProfileForm(parsed.profileForm || profileForm);
        setProfileComplete(Boolean(parsed.profileComplete));
      }
    } catch (error) {
      console.warn('Unable to restore ZAYA IQ Test session:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage === 'landing' || stage === 'sample') {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const session = {
      stage,
      attemptId,
      certificateId,
      questions,
      currentIndex,
      answers,
      startedAt,
      submittedAt,
      timerEnabled,
      timeRemaining,
      warningCount,
      integrityNotice,
      result,
      analysis,
      gmail,
      gmailConsent,
      profileForm,
      profileComplete,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [
    stage,
    attemptId,
    certificateId,
    questions,
    currentIndex,
    answers,
    startedAt,
    submittedAt,
    timerEnabled,
    timeRemaining,
    warningCount,
    integrityNotice,
    result,
    analysis,
    gmail,
    gmailConsent,
    profileForm,
    profileComplete,
  ]);

  useEffect(() => {
    if (stage !== 'test' || !timerEnabled || timeRemaining <= 0) return;
    const interval = window.setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          handleSubmitConfirm();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timerEnabled, timeRemaining]);

  useEffect(() => {
    if (stage !== 'test') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setWarningCount((value) => value + 1);
        setIntegrityNotice('Tab switching detected. Please stay on the assessment screen.');
      }
    };

    const handleBlur = () => {
      setWarningCount((value) => value + 1);
      setIntegrityNotice('Window focus changed. This is logged as a fairness signal.');
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stage]);

  useEffect(() => {
    if (!certificateId) return;
    const verificationUrl = makeVerificationUrl(certificateId);
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 360,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((value) => setQrDataUrl(value))
      .catch((error) => {
        console.warn('QR generation failed:', error);
        setQrDataUrl(null);
      });
  }, [certificateId]);

  const sampleOptions = useMemo(() => shuffleWithSeed(sampleQuestion.options, 'sample-question'), []);

  const startAssessment = () => {
    setSampleSelection('');
    setSampleFeedback(null);
    const newAttemptId = createAttemptId();
    const shuffled = bucketAndShuffleQuestions(newAttemptId);
    setAttemptId(newAttemptId);
    setCertificateId('');
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setStartedAt(Date.now());
    setSubmittedAt(0);
    setResult(null);
    setAnalysis(null);
    setProfileComplete(false);
    setGmail('');
    setGmailConsent(false);
    setProfileForm({
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      country: '',
    });
    setTimeRemaining(TEST_DURATION_SECONDS);
    setWarningCount(0);
    setIntegrityNotice('Test integrity tools are active.');
    setTimerEnabled(true);
    setStage('test');
  };

  const handleSampleSubmit = () => {
    if (!sampleSelection) return;
    const correctAnswer = sampleQuestion.options[sampleQuestion.correctIndex];
    const isCorrect = sampleSelection === correctAnswer;
    setSampleFeedback({
      correct: isCorrect,
      message: isCorrect
        ? `Correct. ${sampleQuestion.explanation}`
        : `Not quite. ${sampleQuestion.explanation}`,
    });
  };

  const saveAnswer = (option: string) => {
    if (!currentQuestion) return;
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: option }));
    setTestError('');
  };

  const goNext = () => {
    if (!currentQuestion) return;
    if (!answers[currentQuestion.id]) {
      setTestError('Please select an answer before continuing.');
      return;
    }
    setTestError('');

    if (currentIndex === questions.length - 1) {
      handleSubmitConfirm();
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  };

  const goPrevious = () => {
    setTestError('');
    setCurrentIndex((previous) => Math.max(0, previous - 1));
  };

  function handleSubmitConfirm() {
    setShowSubmitModal(false);
    if (!questions.length || !startedAt) return;
    const now = Date.now();
    const scored = summarizeResults(answers, questions, startedAt, now);
    setResult(scored);
    setSubmittedAt(now);
    setStage('result');

    const session = {
      stage: 'result',
      attemptId,
      questions,
      currentIndex,
      answers,
      startedAt,
      submittedAt: now,
      timerEnabled,
      timeRemaining,
      warningCount,
      integrityNotice,
      result: scored,
      analysis: null,
      gmail,
      gmailConsent,
      profileForm,
      profileComplete: false,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  const submitGmail = () => {
    setGmailError('');
    if (!isValidGmail(gmail)) {
      setGmailError('Please enter a valid Gmail address.');
      return;
    }
    if (!gmailConsent) {
      setGmailError('Please confirm consent before continuing.');
      return;
    }
    setGmail(normalizeGmail(gmail));
  };

  const submitProfile = async () => {
    setProfileError('');

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.country.trim()) {
      setProfileError('Please complete all required fields.');
      return;
    }

    const ageValue = Number(profileForm.age);
    if (!Number.isFinite(ageValue) || ageValue < 5 || ageValue > 120) {
      setProfileError('Please enter a valid age.');
      return;
    }

    if (!profileForm.gender.trim()) {
      setProfileError('Please choose a gender option or select Prefer not to say.');
      return;
    }

    if (!result) {
      setProfileError('Result data is missing. Please submit the assessment again.');
      return;
    }

    const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
    const certificate = certificateId || createCertificateId();
    const completedAt = new Date(submittedAt || Date.now()).toISOString();
    const generatedAnalysis = buildPerformanceAnalysis({
      score: result,
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      timerEnabled,
    });

    setCertificateId(certificate);
    setAnalysis(generatedAnalysis);
    setProfileComplete(true);
    setSaveState('saving');

    const record = {
      certificate_id: certificate,
      attempt_id: attemptId,
      full_name: fullName,
      email: gmail,
      age: ageValue,
      gender: profileForm.gender,
      country: profileForm.country.trim(),
      reasoning_score: result.reasoningScore,
      accuracy: result.accuracy,
      correct_count: result.correct,
      incorrect_count: result.incorrect,
      completion_seconds: result.completionSeconds,
      category_accuracy: result.categoryAccuracy,
      difficulty_accuracy: result.difficultyAccuracy,
      analysis: generatedAnalysis,
      completed_at: completedAt,
    };

    try {
      const existing = JSON.parse(window.localStorage.getItem(CERTIFICATE_STORAGE_KEY) || '[]');
      const next = Array.isArray(existing) ? existing.filter((item) => item.certificate_id !== certificate) : [];
      next.unshift(record);
      window.localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Local certificate cache write failed:', error);
    }

    try {
      await supabase.from('zaya_iq_certificates').upsert([record], { onConflict: 'certificate_id' });
      setSaveState('saved');
    } catch (error) {
      console.warn('Remote certificate save failed:', error);
      setSaveState('failed');
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stage: 'result',
        attemptId,
        certificateId: certificate,
        questions,
        currentIndex,
        answers,
        startedAt,
        submittedAt,
        timerEnabled,
        timeRemaining,
        warningCount,
        integrityNotice,
        result,
        analysis: generatedAnalysis,
        gmail,
        gmailConsent,
        profileForm,
        profileComplete: true,
      }),
    );
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    const filename = `ZAYA_IQ_Certificate_${certificateId || 'certificate'}`;
    const ok = await downloadAsPDF({
      element: certificateRef.current,
      filename: `${filename}.pdf`,
      pdfOrientation: 'landscape',
      scale: 2,
    });
    if (!ok) {
      await downloadAsPNG({
        element: certificateRef.current,
        filename: `${filename}.png`,
        scale: 2,
      });
    }
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    const filename = `ZAYA_IQ_Performance_Report_${certificateId || 'report'}`;
    const ok = await downloadAsPDF({
      element: reportRef.current,
      filename: `${filename}.pdf`,
      pdfOrientation: 'portrait',
      scale: 2,
    });
    if (!ok) {
      await downloadAsPNG({
        element: reportRef.current,
        filename: `${filename}.png`,
        scale: 2,
      });
    }
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;
    const filename = `ZAYA_IQ_Performance_Chart_${certificateId || 'chart'}`;
    const ok = await downloadAsPDF({
      element: chartRef.current,
      filename: `${filename}.pdf`,
      pdfOrientation: 'portrait',
      scale: 2,
    });
    if (!ok) {
      await downloadAsPNG({
        element: chartRef.current,
        filename: `${filename}.png`,
        scale: 2,
      });
    }
  };

  const verifiedName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
  const verificationUrl = certificateId ? makeVerificationUrl(certificateId) : '';
  const performanceLabel = result ? getPerformanceLabel(result.reasoningScore) : '';

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08111f]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300">ZAYA</p>
              <h1 className="text-lg font-semibold tracking-tight">ZAYA IQ TEST</h1>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <a href="#how" className="text-sm text-slate-300 hover:text-white">How it works</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white">FAQ</a>
            <Link href="/verify" className="text-sm text-slate-300 hover:text-white">Verify</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {stage === 'landing' && (
            <motion.section
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200">
                  <BadgeCheck className="h-4 w-4" />
                  Educational reasoning assessment
                </div>
                <div className="space-y-5">
                  <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Challenge Your Mind.
                    <span className="block text-amber-300">Measure Your Reasoning.</span>
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                    Test logical reasoning, numerical ability, pattern recognition, verbal reasoning, and problem-solving skills through a carefully structured 30-question experience.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setStage('sample')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5"
                  >
                    Start IQ Test
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="#how"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    How it works
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoCard icon={Shield} title="Integrity aware" text="Tab-switch and refresh warnings improve fairness without claiming perfection." />
                  <InfoCard icon={Trophy} title="Reasoning score" text="Transparent scoring converts raw accuracy into a ZAYA Reasoning Score." />
                  <InfoCard icon={BarChart3} title="Downloadable reports" text="Generate a certificate, chart, and performance report for sharing." />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Sample question</p>
                      <h3 className="mt-1 text-xl font-semibold">Try before you start</h3>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                      Sample
                    </div>
                  </div>

                  <div className="space-y-5 rounded-[28px] border border-white/10 bg-[#0d1727] p-5">
                    <p className="whitespace-pre-line text-lg font-medium leading-8 text-white">{sampleQuestion.question}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sampleOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSampleSelection(option)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            sampleSelection === option
                              ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSampleSubmit}
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        Check Answer
                      </button>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{sampleQuestion.category}</span>
                    </div>

                    {sampleFeedback && (
                      <div className={`rounded-2xl border p-4 text-sm ${sampleFeedback.correct ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-400/30 bg-amber-500/10 text-amber-100'}`}>
                        {sampleFeedback.message}
                      </div>
                    )}

                    <button
                      onClick={startAssessment}
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                    >
                      Start 30-Question Test
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard label="Question count" value="30" />
                  <StatCard label="Assessment label" value="ZAYA Reasoning Score" />
                </div>
              </div>
            </motion.section>
          )}

          {stage === 'sample' && (
            <motion.section
              key="sample"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl py-16"
            >
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Sample question</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">Warm up before the main test</h2>
                  </div>
                  <button onClick={() => { setSampleSelection(''); setSampleFeedback(null); setStage('landing'); }} className="text-sm text-slate-300 hover:text-white">Back</button>
                </div>

                <div className="space-y-5">
                  <p className="whitespace-pre-line text-2xl font-medium leading-10 text-white">{sampleQuestion.question}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sampleOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSampleSelection(option)}
                        className={`rounded-2xl border px-5 py-4 text-left text-sm transition ${
                          sampleSelection === option
                            ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleSampleSubmit} className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950">Check Answer</button>
                    <button onClick={startAssessment} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Start 30-question test</button>
                  </div>
                  {sampleFeedback && (
                    <div className={`rounded-2xl border p-4 text-sm ${sampleFeedback.correct ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-400/30 bg-amber-500/10 text-amber-100'}`}>
                      <p className="font-semibold">{sampleFeedback.correct ? 'Correct answer' : 'Review the reasoning'}</p>
                      <p className="mt-1">{sampleFeedback.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {stage === 'test' && currentQuestion && (
            <motion.section key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">ZAYA IQ Test</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTimerEnabled((value) => !value)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                        timerEnabled ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/5 text-slate-200'
                      }`}
                    >
                      <TimerReset className="h-4 w-4" />
                      Timer {timerEnabled ? 'On' : 'Off'}
                    </button>
                    {timerEnabled && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white">
                        <Clock3 className="mr-2 inline h-4 w-4 text-amber-300" />
                        {formatDuration(timeRemaining)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${completionPercent}%` }} />
                  </div>
                  <p className="text-xs text-slate-400">{completionPercent}% complete</p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-300">
                  <span className={`h-2 w-2 rounded-full ${getCategoryAccent(currentQuestion.category)}`} />
                  {currentQuestion.category}
                  <span className="text-slate-500">|</span>
                  {currentQuestion.difficulty}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#0d1727] p-6">
                  <p className="whitespace-pre-line text-2xl font-medium leading-10 text-white">{currentQuestion.question}</p>
                </div>

                <div className="grid gap-3">
                  {currentQuestion.shuffledOptions.map((option) => {
                    const selected = answers[currentQuestion.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => saveAnswer(option)}
                        className={`rounded-2xl border px-5 py-4 text-left text-sm transition ${
                          selected
                            ? 'border-amber-400 bg-amber-400/15 text-amber-100'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-[10px] font-semibold text-slate-300">
                          {String.fromCharCode(65 + currentQuestion.shuffledOptions.indexOf(option))}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {testError && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    {testError}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={goPrevious}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Review Answers
                    </button>
                    <button
                      onClick={goNext}
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950"
                    >
                      {currentIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Assessment integrity</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                      <p className="text-sm font-semibold text-white">Warnings logged</p>
                      <p className="mt-2 text-3xl font-semibold text-amber-300">{warningCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                      {integrityNotice}
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Question palette</p>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                      const answered = Boolean(answers[question.id]);
                      const current = index === currentIndex;
                      return (
                        <button
                          key={question.id}
                          onClick={() => setCurrentIndex(index)}
                          className={`rounded-xl border px-0 py-2 text-xs font-semibold transition ${
                            current
                              ? 'border-amber-400 bg-amber-400 text-slate-950'
                              : answered
                                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                                : 'border-white/10 bg-white/5 text-slate-300'
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs text-slate-400">
                    You have answered {answeredCount} of {questions.length} questions.
                  </p>
                </div>
              </aside>
            </motion.section>
          )}

          {stage === 'result' && result && (
            <motion.section key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 py-8">
              <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                      Test completed
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Your ZAYA Reasoning Score</p>
                      <h2 className="mt-2 text-5xl font-semibold text-white sm:text-6xl">{result.reasoningScore}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                        {buildPerformanceAnalysis({
                          score: result,
                          firstName: profileForm.firstName || 'Participant',
                          lastName: profileForm.lastName || '',
                          timerEnabled,
                        }).summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:w-[30rem]">
                    <ResultTile label="Correct" value={`${result.correct}/${result.totalQuestions}`} />
                    <ResultTile label="Incorrect" value={`${result.incorrect}`} />
                    <ResultTile label="Accuracy" value={`${result.accuracy}%`} />
                    <ResultTile label="Performance" value={performanceLabel} />
                  </div>
                </div>

                <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300">
                  Assessment notice: ZAYA IQ TEST is an educational reasoning assessment. Unless independently validated and normed, its score should not be interpreted as a clinically validated IQ measurement, psychological diagnosis, or definitive measure of intelligence.
                </div>
              </div>

              {!gmail ? (
                <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <MailCheck className="h-6 w-6 text-amber-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Receive your certificate</p>
                      <h3 className="text-2xl font-semibold text-white">Enter your Gmail address</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <label className="space-y-2">
                      <span className="text-sm text-slate-300">Gmail Address</span>
                      <input
                        value={gmail}
                        onChange={(event) => setGmail(event.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400"
                      />
                    </label>

                    <button
                      onClick={submitGmail}
                      className="h-fit self-end rounded-2xl bg-amber-400 px-6 py-4 text-sm font-semibold text-slate-950"
                    >
                      Continue
                    </button>
                  </div>

                  <label className="mt-4 flex items-start gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={gmailConsent}
                      onChange={(event) => setGmailConsent(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-amber-400"
                    />
                    <span>
                      I agree to receive my ZAYA assessment result and certificate at this email address.
                    </span>
                  </label>

                  {gmailError && <p className="mt-4 text-sm text-amber-300">{gmailError}</p>}
                  <p className="mt-4 text-xs leading-6 text-slate-400">
                    Only the email address is collected here. We do not ask for extra personal details until the certificate step.
                  </p>
                </div>
              ) : !profileComplete ? (
                <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <UserRound className="h-6 w-6 text-amber-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Certificate information</p>
                      <h3 className="text-2xl font-semibold text-white">Enter your details</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="First Name" value={profileForm.firstName} onChange={(value) => setProfileForm((prev) => ({ ...prev, firstName: value }))} />
                    <Field label="Last Name" value={profileForm.lastName} onChange={(value) => setProfileForm((prev) => ({ ...prev, lastName: value }))} />
                    <Field label="Age" value={profileForm.age} onChange={(value) => setProfileForm((prev) => ({ ...prev, age: value }))} />
                    <Field label="Country" value={profileForm.country} onChange={(value) => setProfileForm((prev) => ({ ...prev, country: value }))} />
                    <SelectField
                      label="Gender"
                      value={profileForm.gender}
                      onChange={(value) => setProfileForm((prev) => ({ ...prev, gender: value }))}
                    />
                  </div>

                  {profileError && <p className="mt-4 text-sm text-amber-300">{profileError}</p>}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={submitProfile}
                      className="rounded-2xl bg-amber-400 px-6 py-4 text-sm font-semibold text-slate-950"
                    >
                      Generate Certificate
                    </button>
                    <p className="self-center text-xs text-slate-400">
                      This information is used only for your certificate and verification record.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <div ref={reportRef} className="space-y-6 rounded-[34px] border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">AI performance analysis</p>
                          <h3 className="mt-1 text-2xl font-semibold text-slate-950">Personalized feedback</h3>
                        </div>
                        <div className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700">
                          {performanceLabel}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <InsightPanel title="Summary" items={analysis?.summary ? [analysis.summary] : []} />
                        <InsightPanel title="Strongest skills" items={analysis?.strengths || []} />
                        <InsightPanel title="Areas for improvement" items={analysis?.improvements || []} />
                        <InsightPanel title="Recommended practice" items={analysis?.recommendations || []} />
                      </div>

                      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Verification</p>
                            <h4 className="mt-1 text-lg font-semibold text-slate-950">Certificate ID</h4>
                          </div>
                          <a href={verificationUrl} className="text-sm font-semibold text-amber-700 hover:underline">
                            Open verifier
                          </a>
                        </div>
                        <p className="mt-3 break-all font-mono text-sm text-slate-700">{certificateId}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <PerformanceChart
                        ref={chartRef}
                        name={verifiedName || 'Participant'}
                        reasoningScore={result.reasoningScore}
                        accuracy={result.accuracy}
                        correct={result.correct}
                        incorrect={result.incorrect}
                        completionSeconds={result.completionSeconds}
                        categoryAccuracy={result.categoryAccuracy}
                        difficultyAccuracy={result.difficultyAccuracy}
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <button
                          onClick={downloadCertificate}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-4 text-sm font-semibold text-slate-950"
                        >
                          <Download className="h-4 w-4" />
                          Download Certificate
                        </button>
                        <button
                          onClick={downloadReport}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white"
                        >
                          <Download className="h-4 w-4" />
                          Download Report
                        </button>
                        <button
                          onClick={downloadChart}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Download Chart
                        </button>
                      </div>
                      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                        Status: {saveState === 'saved' ? 'Certificate saved and ready for verification.' : saveState === 'failed' ? 'Certificate generated locally. Remote save was skipped or unavailable.' : 'Generating certificate record...'}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <CertificateCard
                      ref={certificateRef}
                      fullName={verifiedName || 'Participant'}
                      country={profileForm.country}
                      certificateId={certificateId}
                      completedAt={new Date(submittedAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      score={result}
                      verificationUrl={verificationUrl}
                      qrDataUrl={qrDataUrl}
                    />

                    <div className="space-y-6">
                      <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Certificate preview</p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          Your certificate includes the ZAYA branding, completion date, score summary, certificate ID, and a verification QR code.
                        </p>
                        <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300">
                          <p className="font-semibold text-white">Verification page</p>
                          <p className="mt-2 break-all text-xs text-slate-400">{verificationUrl}</p>
                        </div>
                      </div>

                      <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Privacy</p>
                        <ul className="mt-4 space-y-3 text-sm text-slate-300">
                          <li>Only the fields needed for the certificate are collected.</li>
                          <li>Gmail is used to continue the certificate workflow.</li>
                          <li>The verifier does not expose email addresses or extra personal details.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {stage === 'landing' && (
          <section id="how" className="grid gap-6 py-8 md:grid-cols-3">
            <HowCard title="1. Start from the landing page" text="Open the sample question and review how the test behaves before beginning the full 30-question assessment." />
            <HowCard title="2. Take the assessment" text="Work through one question at a time, use Previous/Next navigation, and submit only when you are ready." />
            <HowCard title="3. Download and verify" text="Enter your Gmail and certificate details, then download the certificate, report, and chart." />
          </section>
        )}

        {stage === 'landing' && (
          <section id="faq" className="grid gap-4 py-4 lg:grid-cols-2">
            <FaqCard question="Is this a clinical IQ test?" answer="No. It is an educational reasoning assessment with transparent scoring and a clear disclaimer." />
            <FaqCard question="Can I verify my certificate later?" answer="Yes. The generated certificate ID can be checked on the public verification page." />
            <FaqCard question="Does the timer have to be enabled?" answer="No. The timer is optional. You can turn it off before or during the assessment if you prefer." />
            <FaqCard question="What is stored?" answer="Only the certificate-related details needed for generation and verification are used. The verifier does not reveal email addresses." />
          </section>
        )}
      </main>

      <AnimatePresence>
        {showSubmitModal && stage === 'test' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0d1727] p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center gap-3">
                <TriangleAlert className="h-6 w-6 text-amber-300" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Final confirmation</p>
                  <h3 className="text-2xl font-semibold text-white">Submit the test?</h3>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-300">
                You have answered {answeredCount} of {questions.length} questions. Are you ready to submit?
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                  Review Answers
                </button>
                <button onClick={handleSubmitConfirm} className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950">
                  Submit Test
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <Icon className="h-6 w-6 text-amber-300" />
      <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none focus:border-amber-400"
      >
        <option value="">Select</option>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>
    </label>
  );
}

function InsightPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{title}</p>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
        {items.length ? items.map((item) => <li key={item}>- {item}</li>) : <li>- No data yet.</li>}
      </ul>
    </div>
  );
}

function HowCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{question}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{answer}</p>
    </div>
  );
}
