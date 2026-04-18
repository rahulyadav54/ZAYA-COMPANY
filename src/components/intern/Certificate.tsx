'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Printer, Award } from 'lucide-react';

interface CertificateProps {
  internName: string;
  taskTitle: string;
  completionDate: string;
}

export default function Certificate({ internName, taskTitle, completionDate }: CertificateProps) {
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

      {/* Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden border-[2px] border-slate-100 select-none"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {/* Background Decorative Elements */}
        {/* Top Right Corner */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#002B5B] [clip-path:polygon(100%_0,100%_100%,0_0)] z-0" />
        <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-[#C5A021] [clip-path:polygon(100%_0,100%_100%,0_0)] z-0 mr-4 mt-[-4px]" />
        
        {/* Bottom Left Corner */}
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#002B5B] [clip-path:polygon(0_0,0_100%,100%_100%)] z-0" />
        <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-[#C5A021] [clip-path:polygon(0_0,0_100%,100%_100%)] z-0 ml-4 mb-[-4px]" />

        {/* Content Area */}
        <div className="relative z-10 h-full w-full flex flex-col items-center pt-20 px-32 text-center">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <img src="/logo.png" alt="ZAYA CODE HUB" className="h-24 w-auto drop-shadow-md" />
            <h3 className="text-2xl font-black text-[#002B5B] tracking-[8px] uppercase">Zaya Code Hub</h3>
          </div>

          <h1 className="text-[72px] font-black tracking-[12px] text-slate-900 mb-2 uppercase leading-none">Certificate</h1>
          <h2 className="text-[24px] font-bold tracking-[6px] text-[#C5A021] mb-12 uppercase italic">Of Internship</h2>
          
          <p className="text-[14px] font-bold text-slate-400 uppercase tracking-[4px] mb-8">This certificate is proudly awarded to</p>
          
          <p className="text-[88px] text-[#002B5B] leading-none mb-4 py-4" style={{ fontFamily: "'Dancing Script', cursive" }}>
            {internName}
          </p>
          
          <div className="w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#C5A021] to-transparent mb-10" />
          
          <p className="text-[18px] text-slate-600 leading-relaxed max-w-[850px] font-medium font-serif italic mb-16">
            For outstanding completion of the internship program at <span className="font-bold text-[#002B5B] not-italic">ZAYA CODE HUB</span> for the project <span className="font-bold text-slate-800 not-italic">"{taskTitle}"</span>. Your dedication and technical proficiency throughout this program have been exceptional.
          </p>

          {/* Footer Grid for Signatures and Seal */}
          <div className="w-full mt-auto mb-20 flex justify-between items-center">
            {/* CEO Signature */}
            <div className="flex flex-col items-center w-[300px]">
              <p className="text-[32px] text-slate-800 mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>Rahul Kr Yadav</p>
              <div className="w-full h-[1px] bg-slate-300 mb-3" />
              <p className="text-sm font-black text-[#002B5B] uppercase tracking-widest">Rahul Kr Yadav</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px]">CEO & Founder</p>
            </div>

            {/* Central Seal */}
            <div className="relative flex flex-col items-center justify-center">
               <div className="w-28 h-28 bg-[#C5A021] rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#A67C00] relative z-10">
                  <Award className="h-14 w-14 text-white drop-shadow-lg" />
               </div>
               {/* Ribbons */}
               <div className="absolute top-[70%] left-[20%] w-10 h-16 bg-[#A67C00] [clip-path:polygon(0_0,100%_0,50%_100%)] rotate-[20deg] z-0" />
               <div className="absolute top-[70%] right-[20%] w-10 h-16 bg-[#A67C00] [clip-path:polygon(0_0,100%_0,50%_100%)] rotate-[-20deg] z-0" />
               <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dated: {new Date(completionDate).toLocaleDateString()}</p>
            </div>

            {/* Manager Signature */}
            <div className="flex flex-col items-center w-[300px]">
              <p className="text-[32px] text-slate-800 mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>Shivshankar Jaysawal</p>
              <div className="w-full h-[1px] bg-slate-300 mb-3" />
              <p className="text-sm font-black text-[#002B5B] uppercase tracking-widest">Shivshankar Jaysawal</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px]">Project Manager</p>
            </div>
          </div>
        </div>

        {/* Global CSS for Fonts */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Dancing+Script:wght@400;700&display=swap');
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; background: white; }
          }
        `}</style>
      </div>
    </div>
  );
}
