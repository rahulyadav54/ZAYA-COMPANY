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
      className="relative overflow-hidden rounded-[34px] border border-amber-200 bg-[#fdfbf7] text-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.16)]"
      style={{ width: '1123px', minHeight: '794px' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.14),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.08),_transparent_42%)]" />
      <div className="absolute inset-0 border-[18px] border-white/70 pointer-events-none" />
      <div className="absolute inset-6 border border-amber-300/60 pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col justify-between px-14 py-12">
        <header className="flex items-start justify-between gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-slate-500">ZAYA IQ TEST</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-950">Certificate of Completion</h1>
            <p className="mt-2 text-sm text-slate-500">Professional reasoning assessment record</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-white px-5 py-4 text-right shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Verification ID</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{certificateId}</p>
          </div>
        </header>

        <section className="grid flex-1 place-items-center py-8">
          <div className="max-w-4xl text-center">
            <p className="text-[11px] uppercase tracking-[0.45em] text-slate-500">This certificate is awarded to</p>
            <h2 className="mt-5 text-6xl font-semibold tracking-tight text-slate-950">{fullName}</h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              for successfully completing the ZAYA IQ TEST assessment and demonstrating measured reasoning performance across numerical, logical, pattern, verbal, and analytical tasks.
            </p>
          </div>
        </section>

        <footer className="grid grid-cols-[1.4fr_0.9fr_0.9fr] gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Assessment Summary</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <SummaryItem label="Reasoning Score" value={score.reasoningScore} />
              <SummaryItem label="Accuracy" value={`${score.accuracy}%`} />
              <SummaryItem label="Correct" value={`${score.correct}/${score.totalQuestions}`} />
              <SummaryItem label="Country" value={country || 'Not specified'} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Completion Date</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{completedAt}</p>
            <p className="mt-4 text-sm text-slate-600">Digital signature and verification are available at the public certificate page.</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300">Verify Online</p>
            <div className="mt-4 flex items-end gap-4">
              <div className="rounded-2xl bg-white p-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR code for verification" className="h-24 w-24" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center text-[10px] text-slate-400">QR</div>
                )}
              </div>
              <div className="text-sm text-slate-200">
                <p className="font-semibold text-white">Scan to verify</p>
                <p className="mt-2 break-all text-xs text-slate-400">{verificationUrl}</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default CertificateCard;
