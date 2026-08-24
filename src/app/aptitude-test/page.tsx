'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ArrowRight,
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
  TimerReset,
  Trophy,
  TriangleAlert,
  UserRound,
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
const STORAGE_KEY = 'aptitude-test-session';
const CERTIFICATE_STORAGE_KEY = 'aptitude-test-certificates';

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

export default function AptitudeTestPage() {
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
      console.warn('Unable to restore Aptitude Test session:', error);
    }
  }, []);

  useEffect(() => {
    if (stage === 'landing' || stage === 'sample') {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const session = {
      stage, attemptId, certificateId, questions, currentIndex, answers, startedAt,
      submittedAt, timerEnabled, timeRemaining, warningCount, integrityNotice,
      result, analysis, gmail, gmailConsent, profileForm, profileComplete,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [
    stage, attemptId, certificateId, questions, currentIndex, answers, startedAt, submittedAt,
    timerEnabled, timeRemaining, warningCount, integrityNotice, result, analysis, gmail,
    gmailConsent, profileForm, profileComplete,
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
      color: { dark: '#0f172a', light: '#ffffff' },
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
    setProfileForm({ firstName: '', lastName: '', age: '', gender: '', country: '' });
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
      stage: 'result', attemptId, questions, currentIndex, answers, startedAt,
      submittedAt: now, timerEnabled, timeRemaining, warningCount, integrityNotice,
      result: scored, analysis: null, gmail, gmailConsent, profileForm, profileComplete: false,
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
      certificate_id: certificate, attempt_id: attemptId, full_name: fullName, email: gmail,
      age: ageValue, gender: profileForm.gender, country: profileForm.country.trim(),
      reasoning_score: result.reasoningScore, accuracy: result.accuracy,
      correct_count: result.correct, incorrect_count: result.incorrect,
      completion_seconds: result.completionSeconds, category_accuracy: result.categoryAccuracy,
      difficulty_accuracy: result.difficultyAccuracy, analysis: generatedAnalysis, completed_at: completedAt,
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

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      stage: 'result', attemptId, certificateId: certificate, questions, currentIndex,
      answers, startedAt, submittedAt, timerEnabled, timeRemaining, warningCount,
      integrityNotice, result, analysis: generatedAnalysis, gmail, gmailConsent,
      profileForm, profileComplete: true,
    }));
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    const filename = `Aptitude_Test_Certificate_${certificateId || 'certificate'}`;
    const ok = await downloadAsPDF({ element: certificateRef.current, filename: `${filename}.pdf`, pdfOrientation: 'landscape', scale: 2 });
    if (!ok) {
      await downloadAsPNG({ element: certificateRef.current, filename: `${filename}.png`, scale: 2 });
    }
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    const filename = `Aptitude_Test_Report_${certificateId || 'report'}`;
    const ok = await downloadAsPDF({ element: reportRef.current, filename: `${filename}.pdf`, pdfOrientation: 'portrait', scale: 2 });
    if (!ok) {
      await downloadAsPNG({ element: reportRef.current, filename: `${filename}.png`, scale: 2 });
    }
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;
    const filename = `Aptitude_Test_Chart_${certificateId || 'chart'}`;
    const ok = await downloadAsPDF({ element: chartRef.current, filename: `${filename}.pdf`, pdfOrientation: 'portrait', scale: 2 });
    if (!ok) {
      await downloadAsPNG({ element: chartRef.current, filename: `${filename}.png`, scale: 2 });
    }
  };

  const verifiedName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
  const verificationUrl = certificateId ? makeVerificationUrl(certificateId) : '';
  const performanceLabel = result ? getPerformanceLabel(result.reasoningScore) : '';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <span className="text-sm font-bold">Z</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">APTITUDE TEST</p>
              <p className="text-xs text-slate-500">Reasoning Assessment</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            <Link href="/verify" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Verify</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Landing Stage */}
        {stage === 'landing' && (
          <div className="space-y-16">
            {/* Hero */}
            <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700">
                  <Shield className="h-3.5 w-3.5" />
                  Educational reasoning assessment
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-serif">
                  Challenge Your Mind.
                  <span className="block text-slate-400">Measure Your Reasoning.</span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                  Test logical reasoning, numerical ability, pattern recognition, verbal reasoning, and problem-solving skills through a carefully structured 30-question assessment.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setStage('sample')}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Start IQ Test
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="#how"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    How it works
                  </a>
                </div>
                <div className="flex gap-8 pt-4">
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">30</p>
                    <p className="text-sm text-slate-500">Questions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">20 min</p>
                    <p className="text-sm text-slate-500">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">5</p>
                    <p className="text-sm text-slate-500">Categories</p>
                  </div>
                </div>
              </div>

              {/* Sample Question Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Sample question</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">Try before you start</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Sample</span>
                </div>

                <div className="space-y-4 rounded-lg bg-slate-50 p-5">
                  <p className="text-base font-medium leading-relaxed text-slate-800">{sampleQuestion.question}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {sampleOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSampleSelection(option)}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                          sampleSelection === option
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSampleSubmit}
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Check Answer
                    </button>
                    <span className="text-xs text-slate-400">{sampleQuestion.category}</span>
                  </div>

                  {sampleFeedback && (
                    <div className={`rounded-lg border p-4 text-sm ${sampleFeedback.correct ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {sampleFeedback.message}
                    </div>
                  )}

                  <button
                    onClick={startAssessment}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Start 30-Question Test
                    <Play className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* How it works */}
            <section id="how" className="space-y-8">
              <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <span className="text-sm font-semibold text-slate-600">1</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Start the test</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Begin with a sample question, then proceed to the full 30-question assessment.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <span className="text-sm font-semibold text-slate-600">2</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Answer questions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Work through questions at your own pace with optional timer. Navigate freely between questions.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <span className="text-sm font-semibold text-slate-600">3</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Get certified</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Receive your score, performance analysis, and downloadable certificate.</p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Is this a clinical IQ test?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">No. It is an educational reasoning assessment with transparent scoring and a clear disclaimer.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Can I verify my certificate later?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Yes. The generated certificate ID can be checked on the public verification page.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Does the timer have to be enabled?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">No. The timer is optional. You can turn it off before or during the assessment.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">What is stored?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Only certificate-related details needed for generation and verification. The verifier does not reveal email addresses.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Sample Stage */}
        {stage === 'sample' && (
          <div className="mx-auto max-w-2xl py-8">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Sample question</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Warm up before the main test</h2>
                </div>
                <button onClick={() => { setSampleSelection(''); setSampleFeedback(null); setStage('landing'); }} className="text-sm text-slate-500 hover:text-slate-900">Back</button>
              </div>

              <div className="space-y-5">
                <p className="text-xl font-medium leading-relaxed text-slate-800">{sampleQuestion.question}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sampleOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSampleSelection(option)}
                      className={`rounded-lg border px-5 py-4 text-left text-sm transition ${
                        sampleSelection === option
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSampleSubmit} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Check Answer</button>
                  <button onClick={startAssessment} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">Start 30-question test</button>
                </div>
                {sampleFeedback && (
                  <div className={`rounded-lg border p-4 text-sm ${sampleFeedback.correct ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    <p className="font-medium">{sampleFeedback.correct ? 'Correct answer' : 'Review the reasoning'}</p>
                    <p className="mt-1">{sampleFeedback.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Stage */}
        {stage === 'test' && currentQuestion && (
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">Aptitude Test</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTimerEnabled((value) => !value)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      timerEnabled ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <TimerReset className="h-3.5 w-3.5" />
                    Timer {timerEnabled ? 'On' : 'Off'}
                  </button>
                  {timerEnabled && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      <Clock3 className="mr-1.5 inline h-3.5 w-3.5 text-slate-500" />
                      {formatDuration(timeRemaining)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${completionPercent}%` }} />
                </div>
                <p className="text-xs text-slate-500">{completionPercent}% complete</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${getCategoryAccent(currentQuestion.category)}`} />
                {currentQuestion.category}
                <span className="text-slate-300">|</span>
                {currentQuestion.difficulty}
              </div>

              <div className="rounded-lg bg-slate-50 p-6">
                <p className="text-xl font-medium leading-relaxed text-slate-800">{currentQuestion.question}</p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.shuffledOptions.map((option) => {
                  const selected = answers[currentQuestion.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => saveAnswer(option)}
                      className={`rounded-lg border px-5 py-4 text-left text-sm transition ${
                        selected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded border border-current text-xs font-medium opacity-60">
                        {String.fromCharCode(65 + currentQuestion.shuffledOptions.indexOf(option))}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {testError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {testError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={goPrevious}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    {currentIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Integrity</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">Warnings</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{warningCount}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">{integrityNotice}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Progress</p>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const answered = Boolean(answers[question.id]);
                    const current = index === currentIndex;
                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`rounded-lg border px-0 py-2 text-xs font-medium transition ${
                          current
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : answered
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  You have answered {answeredCount} of {questions.length} questions.
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* Result Stage */}
        {stage === 'result' && result && (
          <div className="space-y-8">
            {/* Score Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Test completed
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Your Aptitude Score</p>
                    <p className="mt-2 text-6xl font-semibold tracking-tight text-slate-900 font-serif">{result.reasoningScore}</p>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
                      {buildPerformanceAnalysis({
                        score: result,
                        firstName: profileForm.firstName || 'Participant',
                        lastName: profileForm.lastName || '',
                        timerEnabled,
                      }).summary}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:w-[28rem]">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium text-slate-500">Correct</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{result.correct}/{result.totalQuestions}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium text-slate-500">Incorrect</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{result.incorrect}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium text-slate-500">Accuracy</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{result.accuracy}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium text-slate-500">Performance</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{performanceLabel}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                Assessment notice: Aptitude Test is an educational reasoning assessment. Unless independently validated and normed, its score should not be interpreted as a clinically validated IQ measurement, psychological diagnosis, or definitive measure of intelligence.
              </div>
            </div>

            {/* Gmail Collection */}
            {!gmail ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <MailCheck className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Receive your certificate</p>
                    <h3 className="text-xl font-semibold text-slate-900">Enter your Gmail address</h3>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Gmail Address</span>
                    <input
                      value={gmail}
                      onChange={(event) => setGmail(event.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-900"
                    />
                  </label>

                  <button
                    onClick={submitGmail}
                    className="h-fit self-end rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white"
                  >
                    Continue
                  </button>
                </div>

                <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={gmailConsent}
                    onChange={(event) => setGmailConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <span>I agree to receive my Aptitude Test result and certificate at this email address.</span>
                </label>

                {gmailError && <p className="mt-4 text-sm text-red-600">{gmailError}</p>}
                <p className="mt-4 text-xs text-slate-500">
                  Only the email address is collected here. We do not ask for extra personal details until the certificate step.
                </p>
              </div>
            ) : !profileComplete ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Certificate information</p>
                    <h3 className="text-xl font-semibold text-slate-900">Enter your details</h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="First Name" value={profileForm.firstName} onChange={(value) => setProfileForm((prev) => ({ ...prev, firstName: value }))} />
                  <Field label="Last Name" value={profileForm.lastName} onChange={(value) => setProfileForm((prev) => ({ ...prev, lastName: value }))} />
                  <Field label="Age" value={profileForm.age} onChange={(value) => setProfileForm((prev) => ({ ...prev, age: value }))} />
                  <Field label="Country" value={profileForm.country} onChange={(value) => setProfileForm((prev) => ({ ...prev, country: value }))} />
                  <SelectField label="Gender" value={profileForm.gender} onChange={(value) => setProfileForm((prev) => ({ ...prev, gender: value }))} />
                </div>

                {profileError && <p className="mt-4 text-sm text-red-600">{profileError}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={submitProfile}
                    className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white"
                  >
                    Generate Certificate
                  </button>
                  <p className="self-center text-xs text-slate-500">
                    This information is used only for your certificate and verification record.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <div ref={reportRef} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">AI performance analysis</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-900">Personalized feedback</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{performanceLabel}</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InsightPanel title="Summary" items={analysis?.summary ? [analysis.summary] : []} />
                      <InsightPanel title="Strongest skills" items={analysis?.strengths || []} />
                      <InsightPanel title="Areas for improvement" items={analysis?.improvements || []} />
                      <InsightPanel title="Recommended practice" items={analysis?.recommendations || []} />
                    </div>

                    <div className="rounded-lg bg-slate-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Verification</p>
                          <h4 className="mt-1 text-base font-semibold text-slate-900">Certificate ID</h4>
                        </div>
                        <a href={verificationUrl} className="text-sm font-medium text-slate-900 hover:underline">Open verifier</a>
                      </div>
                      <p className="mt-2 break-all font-mono text-sm text-slate-600">{certificateId}</p>
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
                      <button onClick={downloadCertificate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                        <Download className="h-4 w-4" />
                        Certificate
                      </button>
                      <button onClick={downloadReport} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                        <Download className="h-4 w-4" />
                        Report
                      </button>
                      <button onClick={downloadChart} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                        <Eye className="h-4 w-4" />
                        Chart
                      </button>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                      {saveState === 'saved' ? 'Certificate saved and ready for verification.' : saveState === 'failed' ? 'Certificate generated locally. Remote save was skipped.' : 'Generating certificate record...'}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <CertificateCard
                    ref={certificateRef}
                    fullName={verifiedName || 'Participant'}
                    country={profileForm.country}
                    certificateId={certificateId}
                    completedAt={new Date(submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    score={result}
                    verificationUrl={verificationUrl}
                    qrDataUrl={qrDataUrl}
                  />

                  <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Certificate preview</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                         Your certificate includes the Aptitude Test branding, completion date, score summary, certificate ID, and a verification QR code.
                      </p>
                      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">Verification page</p>
                        <p className="mt-1 break-all text-xs text-slate-500">{verificationUrl}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Privacy</p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        <li>Only the fields needed for the certificate are collected.</li>
                        <li>Gmail is used to continue the certificate workflow.</li>
                        <li>The verifier does not expose email addresses or extra personal details.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {showSubmitModal && stage === 'test' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <TriangleAlert className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Final confirmation</p>
                <h3 className="text-xl font-semibold text-slate-900">Submit the test?</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              You have answered {answeredCount} of {questions.length} questions. Are you ready to submit?
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
                Review Answers
              </button>
              <button onClick={handleSubmitConfirm} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900"
      />
    </label>
  );
}

function SelectField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
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
    <div className="rounded-lg bg-slate-50 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
        {items.length ? items.map((item) => <li key={item}>- {item}</li>) : <li>- No data yet.</li>}
      </ul>
    </div>
  );
}