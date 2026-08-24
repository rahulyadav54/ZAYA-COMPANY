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
    <div ref={ref} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">ZAYA IQ TEST</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Performance Report</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Candidate</p>
            <p className="text-sm font-medium text-slate-900">{name}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Reasoning Score" value={reasoningScore} />
          <MetricCard label="Accuracy" value={`${accuracy}%`} />
          <MetricCard label="Correct" value={correct} />
          <MetricCard label="Incorrect" value={incorrect} />
        </div>

        {/* Difficulty Performance */}
        <div className="rounded-lg bg-slate-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Difficulty Performance</p>
              <h4 className="text-sm font-semibold text-slate-900">How you handled each level</h4>
            </div>
            <p className="text-xs text-slate-500">Time: {formatDuration(completionSeconds)}</p>
          </div>

          <div className="space-y-3">
            {(['Easy', 'Moderate', 'Difficult', 'Advanced'] as ZayaIqDifficulty[]).map((difficulty) => (
              <div key={difficulty} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{difficulty}</span>
                  <span className="font-semibold text-slate-900">{difficultyAccuracy[difficulty] || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: getBarWidth(difficultyAccuracy[difficulty] || 0) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Radar */}
        <div className="rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Category Radar</p>
              <h4 className="text-sm font-semibold text-slate-900">Strength profile</h4>
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
            <polygon points={points} fill="rgba(15, 23, 42, 0.1)" stroke="#0f172a" strokeWidth="2" />
            {radarPoints.map((item) => {
              const distance = radius * (item.value / 100);
              const radians = (item.angle * Math.PI) / 180;
              const x = centerX + Math.cos(radians) * distance;
              const y = centerY + Math.sin(radians) * distance;
              const labelX = centerX + Math.cos(radians) * (radius + 18);
              const labelY = centerY + Math.sin(radians) * (radius + 18);
              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="4" fill="#0f172a" stroke="#fff" strokeWidth="2" />
                  <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#64748b">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Insights */}
        <div className="rounded-lg bg-slate-900 p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Insights</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Strongest area: <span className="font-medium text-white">{strongestCategory(categoryAccuracy)}</span></li>
            <li>Improvement focus: <span className="font-medium text-white">{weakestCategory(categoryAccuracy)}</span></li>
            <li>Completion time: <span className="font-medium text-white">{formatDuration(completionSeconds)}</span></li>
          </ul>
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

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default PerformanceChart;