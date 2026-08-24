import type { ZayaIqDifficulty, ZayaIqQuestion } from './zayaIqTestData';

export type ShuffledQuestion = ZayaIqQuestion & {
  optionOrder: number[];
  shuffledOptions: string[];
};

export type AnswerMap = Record<string, string>;

export interface ZayaIqScoreBreakdown {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  reasoningScore: number;
  categoryAccuracy: Record<string, number>;
  difficultyAccuracy: Record<ZayaIqDifficulty, number>;
  strongestCategory: string;
  weakestCategory: string;
  completionSeconds: number;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function seededHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function seededRandomFactory(seed: string) {
  let state = seededHash(seed);
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  const rand = seededRandomFactory(seed);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createAttemptId() {
  const now = new Date();
  const prefix = `ZAYA-${now.getFullYear()}`;
  let suffix = '';
  for (let i = 0; i < 8; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${suffix}`;
}

export function createCertificateId() {
  return createAttemptId();
}

export function buildShuffledQuestions(questions: ZayaIqQuestion[], seed: string): ShuffledQuestion[] {
  return questions.map((question) => {
    const indexedOptions = question.options.map((option, index) => ({ option, index }));
    const shuffled = shuffleWithSeed(indexedOptions, `${seed}-${question.id}`);
    return {
      ...question,
      optionOrder: shuffled.map((item) => item.index),
      shuffledOptions: shuffled.map((item) => item.option),
    };
  });
}

export function getPerformanceLabel(score: number) {
  if (score >= 132) return 'Exceptional';
  if (score >= 120) return 'Strong';
  if (score >= 108) return 'Above Average';
  if (score >= 96) return 'Solid';
  if (score >= 84) return 'Developing';
  return 'Building';
}

export function getScoreNarrative(score: number, accuracy: number) {
  if (accuracy >= 90) {
    return 'Excellent performance across multiple reasoning areas. Your consistency is a clear strength.';
  }
  if (accuracy >= 75) {
    return 'Strong reasoning performance with a good balance of speed and accuracy. A little more practice could lift your advanced questions.';
  }
  if (accuracy >= 60) {
    return 'A solid foundation with room to grow. Focusing on harder sequences and multi-step logic should help improve stability.';
  }
  return 'This result shows an emerging reasoning profile. Regular practice with patterns, logic, and multi-step arithmetic should help build confidence.';
}

export function buildReasoningScore(accuracy: number, categoryAccuracy: Record<string, number>, difficultyAccuracy: Record<ZayaIqDifficulty, number>) {
  const categoryValues = Object.values(categoryAccuracy);
  const difficultyValues = Object.values(difficultyAccuracy);
  const categoryAverage = categoryValues.length ? categoryValues.reduce((sum, value) => sum + value, 0) / categoryValues.length : accuracy;
  const difficultyAverage = difficultyValues.length ? difficultyValues.reduce((sum, value) => sum + value, 0) / difficultyValues.length : accuracy;
  const blended = accuracy * 0.7 + categoryAverage * 0.2 + difficultyAverage * 0.1;
  return Math.round(68 + blended * 0.55);
}

export function summarizeResults(
  answers: AnswerMap,
  questions: ShuffledQuestion[],
  startedAt: number,
  completedAt: number,
): ZayaIqScoreBreakdown {
  const statsByCategory: Record<string, { correct: number; total: number }> = {};
  const statsByDifficulty: Record<ZayaIqDifficulty, { correct: number; total: number }> = {
    Easy: { correct: 0, total: 0 },
    Moderate: { correct: 0, total: 0 },
    Difficult: { correct: 0, total: 0 },
    Advanced: { correct: 0, total: 0 },
  };

  let correct = 0;

  questions.forEach((question) => {
    const selected = answers[question.id];
    const isCorrect = selected === question.options[question.correctIndex];

    if (!statsByCategory[question.category]) {
      statsByCategory[question.category] = { correct: 0, total: 0 };
    }

    statsByCategory[question.category].total += 1;
    statsByDifficulty[question.difficulty].total += 1;

    if (isCorrect) {
      correct += 1;
      statsByCategory[question.category].correct += 1;
      statsByDifficulty[question.difficulty].correct += 1;
    }
  });

  const categoryAccuracy = Object.fromEntries(
    Object.entries(statsByCategory).map(([category, stat]) => [
      category,
      stat.total ? Math.round((stat.correct / stat.total) * 100) : 0,
    ]),
  );

  const difficultyAccuracy = Object.fromEntries(
    Object.entries(statsByDifficulty).map(([difficulty, stat]) => [
      difficulty,
      stat.total ? Math.round((stat.correct / stat.total) * 100) : 0,
    ]),
  ) as Record<ZayaIqDifficulty, number>;

  const weakestCategory = Object.entries(categoryAccuracy).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';
  const strongestCategory = Object.entries(categoryAccuracy).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const totalQuestions = questions.length;
  const accuracy = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;
  const reasoningScore = buildReasoningScore(accuracy, categoryAccuracy, difficultyAccuracy);

  return {
    totalQuestions,
    correct,
    incorrect: totalQuestions - correct,
    accuracy,
    reasoningScore,
    categoryAccuracy,
    difficultyAccuracy,
    strongestCategory,
    weakestCategory,
    completionSeconds: Math.max(0, Math.round((completedAt - startedAt) / 1000)),
  };
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

export function formatTimeLabel(seconds: number) {
  if (seconds <= 0) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${remaining}s`;
  if (remaining === 0) return `${minutes}m`;
  return `${minutes}m ${remaining}s`;
}

export function buildRecommendationSummary(categoryAccuracy: Record<string, number>) {
  const ordered = Object.entries(categoryAccuracy).sort((a, b) => a[1] - b[1]);
  const weakest = ordered[0];
  const strongest = ordered[ordered.length - 1];
  return {
    strongest: strongest ? strongest[0] : 'N/A',
    weakest: weakest ? weakest[0] : 'N/A',
    practiceFocus: weakest ? `Spend more time on ${weakest[0].toLowerCase()} questions.` : 'Practice a broad mix of reasoning questions.',
  };
}

export function buildPerformanceAnalysis(params: {
  score: ZayaIqScoreBreakdown;
  firstName: string;
  lastName: string;
  timerEnabled: boolean;
}) {
  const { score, firstName, lastName, timerEnabled } = params;
  const recommendations = buildRecommendationSummary(score.categoryAccuracy);
  const fullName = `${firstName} ${lastName}`.trim();
  const scoreLabel = getPerformanceLabel(score.reasoningScore);

  return {
    summary: `${fullName ? `${fullName}, ` : ''}your ZAYA Reasoning Score of ${score.reasoningScore} suggests a ${scoreLabel.toLowerCase()} reasoning profile. ${getScoreNarrative(score.reasoningScore, score.accuracy)}`,
    strengths: [
      `Strongest category: ${score.strongestCategory}`,
      `${Object.entries(score.difficultyAccuracy).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Easy'} questions were your most successful level`,
      `Overall accuracy: ${score.accuracy}%`,
    ],
    improvements: [
      `Focus area: ${score.weakestCategory}`,
      recommendations.practiceFocus,
      timerEnabled ? 'Practice faster decision-making under timed conditions.' : 'Consider practicing with a timer to improve pace awareness.',
    ],
    recommendations: [
      'Work through mixed reasoning drills with increasing difficulty.',
      'Review explanations for every missed question to spot patterns.',
      'Retake a shorter timed practice set after two or three focused study sessions.',
    ],
  };
}

export function makeVerificationUrl(certificateId: string) {
  if (typeof window === 'undefined') {
    return `https://zayacodehub.in/verify/${certificateId}`;
  }
  return `${window.location.origin}/verify/${certificateId}`;
}
