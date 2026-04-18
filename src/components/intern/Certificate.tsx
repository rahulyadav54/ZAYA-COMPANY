'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Printer, Award } from 'lucide-react';

interface CertificateProps {
  internName: string;
  taskTitle: string;
  completionDate: string;
  certificateId?: string;
  hideButtons?: boolean;
}

export default function Certificate({ internName, taskTitle, completionDate, certificateId, hideButtons = false }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificate_${internName.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="flex flex-col items-center gap-10 p-4">
      {/* Action Buttons */}
      {!hideButtons && (
        <div className="flex gap-4 no-print">
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95"
          >
            <Download className="h-5 w-5" />
            Download Certificate (PDF)
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95"
          >
            <Printer className="h-5 w-5" />
            Print
          </button>
        </div>
      )}

      {/* Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden border-[1px] border-slate-200 select-none"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {/* TOP RIGHT: Blue & Gold Angled Corners */}
        <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-[#003366] [clip-path:polygon(100%_0,100%_100%,30%_0)] z-10" />
        <div className="absolute top-0 right-0 w-[310px] h-[310px] bg-[#C5A021] [clip-path:polygon(100%_0,100%_100%,30%_0)] z-0 mr-[-5px]" />

        {/* BOTTOM LEFT: Blue & Gold Angled Corners */}
        <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-[#003366] [clip-path:polygon(0_100%,0_0,70%_100%)] z-10" />
        <div className="absolute bottom-0 left-0 w-[310px] h-[310px] bg-[#C5A021] [clip-path:polygon(0_100%,0_0,70%_100%)] z-0 ml-[-5px]" />

        {/* ORNAMENTS: Top Left and Bottom Right Floral */}
        <div className="absolute top-8 left-8 text-[#C5A021] opacity-80 scale-150">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10C30 10 50 30 50 50M10 10C10 30 30 50 50 50M10 10V40M10 10H40M25 10C25 20 35 30 45 30M10 25C20 25 30 35 30 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="10" cy="10" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute bottom-8 right-8 text-[#C5A021] opacity-80 scale-150 rotate-180">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10C30 10 50 30 50 50M10 10C10 30 30 50 50 50M10 10V40M10 10H40M25 10C25 20 35 30 45 30M10 25C20 25 30 35 30 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="10" cy="10" r="3" fill="currentColor"/>
          </svg>
        </div>

        {/* Content Area */}
        <div className="relative z-20 h-full w-full flex flex-col items-center pt-16 px-40 text-center">
          
          {/* Logo & Brand */}
          <div className="mb-10">
            <img src="/logo.png" alt="ZAYA CODE HUB" className="h-20 w-auto mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-[#003366] tracking-[6px] uppercase">Zaya Code Hub</h3>
          </div>

          <h1 className="text-[64px] font-bold text-slate-800 mb-0 uppercase tracking-[4px]">Certificate</h1>
          <h2 className="text-[28px] font-bold text-[#003366] mb-10 tracking-[10px] uppercase">Of Internship</h2>
          
          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-[1px] bg-[#C5A021]" />
             <p className="text-[14px] font-bold text-slate-500 uppercase tracking-[3px]">This internship program certificate is proudly awarded to</p>
             <div className="w-12 h-[1px] bg-[#C5A021]" />
          </div>
          
          <p className="text-[82px] text-[#1a4731] leading-none mb-8 py-4" style={{ fontFamily: "'Great Vibes', cursive" }}>
            {internName}
          </p>
          
          <p className="text-[16px] text-slate-700 leading-relaxed max-w-[800px] font-serif italic mb-16 px-10">
            This certificate is given to <span className="font-bold text-[#003366] not-italic">{internName}</span> for his outstanding completion of the internship program at <span className="font-bold text-[#003366] not-italic">Zaya Code Hub</span> for the project <span className="font-bold text-slate-900 not-italic">"{taskTitle}"</span> from {new Date(new Date(completionDate).getTime() - 30*24*60*60*1000).toLocaleDateString('en-US', { month: 'long' })} to {new Date(completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
          </p>

          {/* Signatures */}
          <div className="w-full flex justify-between items-end mt-4 mb-10">
            <div className="flex flex-col items-center w-[250px]">
              <div className="w-full h-[1px] bg-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Rahul Kr Yadav</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CEO & Founder</p>
            </div>

            {/* Central Seal */}
            <div className="relative flex flex-col items-center justify-center">
               <div className="w-24 h-24 bg-gradient-to-br from-[#C5A021] to-[#A67C00] rounded-full shadow-xl flex items-center justify-center border-[4px] border-white relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.1)_100%)]" />
                  <Award className="h-12 w-12 text-white drop-shadow-lg relative z-20" />
               </div>
               <div className="absolute top-[80%] left-[25%] w-8 h-12 bg-[#A67C00] [clip-path:polygon(0_0,100%_0,50%_100%)] rotate-[15deg] z-0" />
               <div className="absolute top-[80%] right-[25%] w-8 h-12 bg-[#A67C00] [clip-path:polygon(0_0,100%_0,50%_100%)] rotate-[-15deg] z-0" />
            </div>

            <div className="flex flex-col items-center w-[250px]">
              <div className="w-full h-[1px] bg-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Shivshankar Jaysawal</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Project Manager</p>
            </div>
          </div>

          {/* Verification Info */}
          {certificateId && (
            <div className="absolute bottom-6 w-full px-40 flex justify-between items-end text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
               <p>Credential ID: <span className="text-[#003366]">{certificateId}</span></p>
               <p>Verify at: <span className="text-blue-600 lowercase tracking-normal">zayacodehub.com/verify</span></p>
            </div>
          )}
        </div>

        {/* Global CSS */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Great+Vibes&display=swap');
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; background: white; }
          }
        `}</style>
      </div>
    </div>
  );
}
