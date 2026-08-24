'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, QrCode, Smartphone } from 'lucide-react';

const UPI_ID = 'zayacodehub@okhdfcbank';
const UPI_URL = `upi://pay?${new URLSearchParams({
  pa: UPI_ID,
  pn: 'ZAYA CODE HUB',
  am: '199',
  cu: 'INR',
  tn: 'ZAYA CODE HUB Placement Preparation Bundle',
}).toString()}`;

export default function UpiQrPayment() {
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(UPI_URL, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#071127', light: '#ffffff' },
    }).then(setQrCode).catch(() => setQrCode(''));
  }, []);

  async function copyUpiId() {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-6 rounded-lg border border-blue-400/20 bg-blue-500/5 p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-100">
        <QrCode className="h-4 w-4 text-blue-300" />
        Pay with any UPI app
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">Scan the QR or open your installed UPI app to pay ₹199.</p>

      {qrCode ? (
        <img src={qrCode} alt="UPI QR code for ZAYA CODE HUB placement bundle payment" className="mx-auto mt-3 h-44 w-44 rounded-lg bg-white p-2" />
      ) : (
        <div className="mx-auto mt-3 h-44 w-44 animate-pulse rounded-lg bg-slate-800" />
      )}

      <div className="mt-3 flex items-center justify-center gap-2">
        <code className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-200">{UPI_ID}</code>
        <button type="button" onClick={copyUpiId} className="rounded p-1.5 text-blue-300 hover:bg-white/10" aria-label="Copy UPI ID">
          <Copy className="h-4 w-4" />
        </button>
      </div>
      {copied && <p className="mt-1 text-xs font-medium text-emerald-300">UPI ID copied</p>}

      <a href={UPI_URL} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-500/20">
        <Smartphone className="h-4 w-4" />
        Open UPI App
      </a>
      <p className="mt-3 text-[11px] leading-5 text-amber-200/80">UPI QR payments require payment confirmation before access is activated. Use Razorpay above for instant verified access.</p>
    </div>
  );
}
