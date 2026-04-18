'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Printer, Award } from 'lucide-react';

interface CertificateProps {
  internName: string;
  taskTitle: string;
  completionDate: string;
  durationMonths?: number;
  certificateId?: string;
  hideButtons?: boolean;
}

export default function Certificate({ 
  internName, 
  taskTitle, 
  completionDate, 
  durationMonths = 1,
  certificateId, 
  hideButtons = false 
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  // Calculate dates based on duration
  const end = new Date(completionDate);
  const start = new Date(completionDate);
  start.setMonth(start.getMonth() - durationMonths);

  const dateRange = `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    // High quality scaling for PDF
    const canvas = await html2canvas(certificateRef.current, {
      scale: 4, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`ZAYA_Certificate_${internName.replace(/\s+/g, '_')}.pdf`);
  };

  const formatName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="flex flex-col items-center gap-10 p-4">
      {/* Action Buttons */}
      {!hideButtons && (
        <div className="flex gap-4 no-print">
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-2xl active:scale-95 text-sm uppercase tracking-widest"
          >
            <Download className="h-5 w-5" />
            Download Certificate (PDF)
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all shadow-2xl active:scale-95 text-sm uppercase tracking-widest"
          >
            <Printer className="h-5 w-5" />
            Print
          </button>
        </div>
      )}

      {/* Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative w-[1123px] h-[794px] bg-[#fdfcfbf0] shadow-2xl overflow-hidden border-[1px] border-slate-200 select-none"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {/* Borders and Patterns */}
        <div className="absolute inset-0 border-[24px] border-white z-30 pointer-events-none" />
        <div className="absolute inset-8 border-[1px] border-[#C5A021] z-30 pointer-events-none" />
        <div className="absolute inset-[36px] border-[1px] border-[#C5A021] opacity-30 z-30 pointer-events-none" />

        {/* TOP RIGHT Corner Accent */}
        <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-[#002855] [clip-path:polygon(100%_0,100%_100%,0_0)] z-10" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C5A021] [clip-path:polygon(100%_0,100%_100%,0_0)] z-0" />

        {/* BOTTOM LEFT Corner Accent */}
        <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-[#002855] [clip-path:polygon(0_100%,0_0,100%_100%)] z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C5A021] [clip-path:polygon(0_100%,0_0,100%_100%)] z-0" />

        {/* Main Content Layout - Flex Column to prevent overlaps */}
        <div className="relative z-40 h-full w-full flex flex-col justify-between pt-16 pb-12 px-32 text-center">
          
          {/* Header Section */}
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mb-4 border-[2px] border-[#C5A021] shadow-lg">
                <img src="/logo.png" alt="Zaya Logo" className="h-10 w-10 object-contain" />
             </div>
             <h3 className="text-[10px] font-black text-[#002855] tracking-[6px] uppercase mb-6">Zaya Code Hub</h3>
             <h1 className="text-[64px] font-black text-slate-900 mb-2 uppercase tracking-[8px] leading-none" style={{ fontFamily: "'Cinzel', serif" }}>Certificate</h1>
             <h2 className="text-[20px] font-bold text-[#C5A021] tracking-[10px] uppercase">Of Internship Completion</h2>
          </div>

          {/* Body Section */}
          <div className="flex flex-col items-center justify-center flex-grow py-4">
             <div className="flex items-center gap-6 mb-8 w-full justify-center opacity-80">
                <div className="w-24 h-[1px] bg-slate-400" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[3px]">This acknowledgment is proudly presented to</p>
                <div className="w-24 h-[1px] bg-slate-400" />
             </div>
             
             {/* THE NAME - Title Cased, Italic Playfair Display for immense elegance */}
             <div className="mb-6 flex items-center justify-center">
               <h2 className="text-[68px] text-[#002855] leading-none font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                 {formatName(internName)}
               </h2>
             </div>
             
             <p className="text-[16px] text-slate-700 leading-relaxed max-w-[800px] mx-auto italic">
               For their exceptional performance and dedication during the internship program at <span className="font-bold text-[#002855] not-italic">Zaya Code Hub</span>. They have successfully completed the project <span className="font-bold text-[#C5A021] not-italic">"{taskTitle}"</span> showcasing professional excellence from <span className="font-bold text-slate-900 not-italic">{dateRange}</span>.
             </p>
          </div>

          {/* Footer Section (Signatures & Seal) */}
          <div className="flex justify-between items-end w-full px-10 pb-8 relative">
            
            {/* Left Signature */}
            <div className="flex flex-col items-center w-[220px]">
              <p className="text-[36px] text-[#002855] leading-none mb-[-4px]" style={{ fontFamily: "'Dancing Script', cursive" }}>Rahul Kr Yadav</p>
              <div className="w-full h-[1px] bg-slate-400 mb-2" />
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-[2px]">CEO & Founder</p>
            </div>

            {/* Central Seal - Positioned gracefully without breaking layout */}
            <div className="flex flex-col items-center justify-center transform translate-y-4">
               <div className="w-24 h-24 bg-gradient-to-br from-[#C5A021] to-[#A67C00] rounded-full shadow-[0_10px_30px_rgba(197,160,33,0.4)] flex items-center justify-center border-[4px] border-white z-10 relative">
                  <Award className="h-10 w-10 text-white" />
                  {/* Subtle inner ring */}
                  <div className="absolute inset-1 border-[1px] border-white/30 rounded-full" />
               </div>
            </div>

            {/* Right Signature */}
            <div className="flex flex-col items-center w-[220px]">
              <p className="text-[36px] text-[#002855] leading-none mb-[-4px]" style={{ fontFamily: "'Dancing Script', cursive" }}>Shivshankar Jaysawal</p>
              <div className="w-full h-[1px] bg-slate-400 mb-2" />
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-[2px]">Project Manager</p>
            </div>
            
          </div>

          {/* Validation Footer */}
          {certificateId && (
            <div className="absolute bottom-[24px] left-32 right-32 flex justify-between items-center text-[8px] font-bold uppercase tracking-[2px] text-slate-400 border-t-[1px] border-slate-200 pt-2">
               <p>Credential ID: <span className="text-[#002855] font-black">{certificateId}</span></p>
               <p>Verify Authenticity: <span className="text-blue-600 font-black lowercase tracking-normal">zayacodehub.in/verify</span></p>
            </div>
          )}
        </div>

        {/* Global CSS */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap');
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
