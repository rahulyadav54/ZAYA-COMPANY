'use client';

import React, { forwardRef } from 'react';
import type { ZayaIqScoreBreakdown } from '@/lib/zayaIqTestUtils';

interface CertificateCardProps {
  fullName: string;
  country: string;
  certificateId: string;
  completedAt: string;
  score: ZayaIqScoreBreakdown;
  verificationUrl: string;
  qrDataUrl: string | null;
}

const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(function CertificateCard(
  { fullName, country, certificateId, completedAt, score, verificationUrl, qrDataUrl },
  ref,
) {
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm"
      style={{ width: '1123px', minHeight: '794px' }}
    >
      {/* Border decoration */}
      <div className="absolute inset-4 border-2 border-slate-900 pointer-events-none" />
      <div className="absolute inset-6 border border-slate-300 pointer-events-none" />

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6 h-16 w-16 border-t-2 border-l-2 border-slate-900" />
      <div className="absolute top-6 right-6 h-16 w-16 border-t-2 border-r-2 border-slate-900" />
      <div className="absolute bottom-6 left-6 h-16 w-16 border-b-2 border-l-2 border-slate-900" />
      <div className="absolute bottom-6 right-6 h-16 w-16 border-b-2 border-r-2 border-slate-900" />

      <div className="relative z-10 flex h-full flex-col justify-between px-16 py-14">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-900 text-white">
                <span className="text-sm font-bold">Z</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">ZAYA IQ TEST</p>
                <p className="text-xs text-slate-500">Reasoning Assessment</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Certificate ID</p>
            <p className="mt-1 font-mono text-sm font-medium text-slate-700">{certificateId}</p>
          </div>
        </header>

        {/* Main content */}
        <section className="flex-1 grid place-items-center py-10">
          <div className="text-center max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">This certificate is awarded to</p>
            <h2 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900 font-serif">{fullName}</h2>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-slate-300" />
              <p className="text-sm text-slate-500">{country}</p>
              <div className="h-px w-12 bg-slate-300" />
            </div>
            <p className="mt-8 text-base leading-relaxed text-slate-600">
              for successfully completing the Zaya IQ Test assessment and demonstrating measured reasoning performance across numerical, logical, pattern, verbal, and analytical tasks.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="grid grid-cols-3 gap-8 border-t border-slate-200 pt-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Reasoning Score</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 font-serif">{score.reasoningScore}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Accuracy</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{score.accuracy}%</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Correct Answers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{score.correct}/{score.totalQuestions}</p>
          </div>
        </footer>

        {/* Verification section */}
        <footer className="mt-8 flex items-end justify-between border-t border-slate-200 pt-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Completion Date</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{completedAt}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Verification</p>
              <p className="mt-1 text-xs text-slate-500">{verificationUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR code for verification" className="h-20 w-20" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded border border-slate-200 text-xs text-slate-400">QR</div>
            )}
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">Digital Signature</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">Zaya Assessment Authority</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});

export default CertificateCard;