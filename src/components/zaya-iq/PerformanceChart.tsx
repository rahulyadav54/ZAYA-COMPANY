'use client';

import React, { forwardRef, useMemo } from 'react';
import type { ZayaIqDifficulty } from '@/lib/zayaIqTestData';
import { formatDuration } from '@/lib/zayaIqTestUtils';

interface PerformanceChartProps {
  name: string;
  reasoningScore: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  completionSeconds: number;
  categoryAccuracy: Record<string, number>;
  difficultyAccuracy: Record<ZayaIqDifficulty, number>;
}

function getBarWidth(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

interface RadarPoint {
  label: string;
  value: number;
  angle: number;
}

function buildRadarPoints(categoryAccuracy: Record<string, number>): RadarPoint[] {
  const categories = [
    { label: 'Numerical', key: 'Numerical reasoning' },
    { label: 'Logical', key: 'Logical reasoning' },
    { label: 'Pattern', key: 'Pattern recognition' },
    { label: 'Verbal', key: 'Verbal reasoning' },
    { label: 'Analytical', key: 'Analytical reasoning' },
  ];
  const count = categories.length;
  return categories.map((category, index) => ({
    label: category.label,
    value: categoryAccuracy[category.key] || 0,
    angle: -90 + (360 / count) * index,
  }));
}

const PerformanceChart = forwardRef<HTMLDivElement, PerformanceChartProps>(function PerformanceChart(
  {
    name,
    reasoningScore,
    accuracy,
    correct,
    incorrect,
    completionSeconds,
    categoryAccuracy,
    difficultyAccuracy,
  },
  ref,
) {
  const radarPoints = useMemo(() => buildRadarPoints(categoryAccuracy), [categoryAccuracy]);

  const centerX = 150;
  const centerY = 150;
  const radius = 110;

  const points = useMemo(() => radarPoints.map((item) => {
    const distance = radius * (item.value / 100);
    const radians = (item.angle * Math.PI) / 180;
    return `${centerX + Math.cos(radians) * distance},${centerY + Math.sin(radians) * distance}`;
  }).join(' '), [radarPoints]);

  return (
    <div ref={ref} className="rounded-[32px] border border-amber-200/60 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden">
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-8 py-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-amber-300">ZAYA IQ TEST</p>
            <h3 className="text-2xl font-semibold mt-1">Performance Report</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Candidate</p>
            <p className="text-lg font-semibold">{name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Reasoning Score" value={reasoningScore} accent="from-amber-500 to-orange-500" />
            <MetricCard label="Accuracy" value={`${accuracy}%`} accent="from-slate-950 to-slate-700" />
            <MetricCard label="Correct" value={correct} accent="from-emerald-500 to-teal-500" />
            <MetricCard label="Incorrect" value={incorrect} accent="from-rose-500 to-red-500" />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Difficulty Performance</p>
                <h4 className="text-lg font-semibold text-slate-900">How you handled each level</h4>
              </div>
              <p className="text-sm text-slate-500">Time: {formatDuration(completionSeconds)}</p>
            </div>

            <div className="space-y-4">
              {(['Easy', 'Moderate', 'Difficult', 'Advanced'] as ZayaIqDifficulty[]).map((difficulty) => (
                <div key={difficulty} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{difficulty}</span>
                    <span className="font-semibold text-slate-900">{difficultyAccuracy[difficulty] || 0}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-slate-950 via-amber-500 to-amber-300 transition-all" style={{ width: getBarWidth(difficultyAccuracy[difficulty] || 0) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Category Radar</p>
                <h4 className="text-lg font-semibold text-slate-900">Strength profile</h4>
              </div>
            </div>

            <svg viewBox="0 0 300 300" className="w-full h-auto">
              {[20, 40, 60, 80, 100].map((ring) => (
                <circle key={ring} cx={centerX} cy={centerY} r={(radius * ring) / 100} fill="none" stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {radarPoints.map((item) => {
                const radians = (item.angle * Math.PI) / 180;
                const endX = centerX + Math.cos(radians) * radius;
                const endY = centerY + Math.sin(radians) * radius;
                return (
                  <line key={item.label} x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="#e2e8f0" strokeWidth="1" />
                );
              })}
              <polygon points={points} fill="rgba(212, 163, 26, 0.18)" stroke="#d97706" strokeWidth="3" />
              {radarPoints.map((item) => {
                const distance = radius * (item.value / 100);
                const radians = (item.angle * Math.PI) / 180;
                const x = centerX + Math.cos(radians) * distance;
                const y = centerY + Math.sin(radians) * distance;
                const labelX = centerX + Math.cos(radians) * (radius + 18);
                const labelY = centerY + Math.sin(radians) * (radius + 18);
                return (
                  <g key={item.label}>
                    <circle cx={x} cy={y} r="4.5" fill="#d97706" stroke="#fff" strokeWidth="2" />
                    <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#475569">
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300">Insights</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>Strongest area: <span className="font-semibold text-white">{strongestCategory(categoryAccuracy)}</span></li>
              <li>Improvement focus: <span className="font-semibold text-white">{weakestCategory(categoryAccuracy)}</span></li>
              <li>Completion time: <span className="font-semibold text-white">{formatDuration(completionSeconds)}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

function strongestCategory(categoryAccuracy: Record<string, number>) {
  const entries = Object.entries(categoryAccuracy);
  if (!entries.length) return 'N/A';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function weakestCategory(categoryAccuracy: Record<string, number>) {
  const entries = Object.entries(categoryAccuracy);
  if (!entries.length) return 'N/A';
  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`inline-flex rounded-full bg-gradient-to-r ${accent} px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white`}>
        {label}
      </div>
      <div className="mt-4 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export default PerformanceChart;
