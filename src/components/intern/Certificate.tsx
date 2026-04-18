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
      scale: 3, // High quality
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
    <div className="flex flex-col items-center gap-8 p-4">
      {/* Action Buttons */}
      <div className="flex gap-4 no-print">
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Download className="h-5 w-5" />
          Download PDF
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Printer className="h-5 w-5" />
          Print
        </button>
      </div>

      {/* Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden border-[20px] border-white select-none"
        style={{ fontFamily: "'Times New Roman', serif" }}
      >
        {/* Background Accents (Geometric Corners) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#002B5B] [clip-path:polygon(100%_0,100%_100%,0_0)] z-0" />
        <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-[#C5A021] [clip-path:polygon(100%_0,100%_100%,0_0)] z-0 mr-4 mt-[-4px]" />
        
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#002B5B] [clip-path:polygon(0_0,0_100%,100%_100%)] z-0" />
        <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-[#C5A021] [clip-path:polygon(0_0,0_100%,100%_100%)] z-0 ml-4 mb-[-4px]" />

        {/* Decorative Borders (Gold Corner Ornaments) */}
        <div className="absolute top-10 left-10 w-40 h-40 border-l-4 border-t-4 border-[#C5A021] z-10 opacity-60" />
        <div className="absolute bottom-10 right-10 w-40 h-40 border-r-4 border-b-4 border-[#C5A021] z-10 opacity-60" />

        {/* Content Area */}
        <div className="relative z-20 h-full w-full flex flex-col items-center pt-16 px-20 text-center">
          {/* Logo and Company Name */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <img src="/logo.png" alt="ZAYA CODE HUB" className="h-24 w-auto object-contain" />
            <h3 className="text-2xl font-black text-[#002B5B] tracking-[4px] uppercase">Zaya Code Hub</h3>
          </div>

          <h1 className="text-[64px] font-serif tracking-[10px] text-[#0f172a] mb-2 uppercase">Certificate</h1>
          <h2 className="text-[28px] font-serif tracking-[4px] text-[#1e293b] mb-10 uppercase italic">Of Internship</h2>
          
          <div className="w-[60%] h-[1px] bg-slate-300 mb-8" />
          
          <p className="text-[16px] font-medium text-slate-500 uppercase tracking-[2px] mb-8">This Internship Program Certificate is proudly awarded to</p>
          
          <p className="text-[72px] text-[#002B5B] mb-6" style={{ fontFamily: "'Great Vibes', cursive" }}>
            {internName}
          </p>
          
          <div className="w-[70%] h-[2px] bg-[#C5A021] mb-8" />
          
          <p className="text-[18px] text-slate-600 leading-relaxed max-w-[800px] font-medium">
            This certificate is given to <span className="font-bold text-slate-800">{internName}</span> for his/her outstanding completion of the internship program at <span className="font-bold text-slate-800 text-[#002B5B]">ZAYA CODE HUB</span> for the project <span className="italic text-[#002B5B]">"{taskTitle}"</span> completed on {new Date(completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>

          {/* Footer Section (Signatures) */}
          <div className="absolute bottom-20 w-full px-32 flex justify-between items-end">
            <div className="text-center w-[250px]">
              <p className="text-3xl mb-1 text-slate-800" style={{ fontFamily: "'Great Vibes', cursive" }}>Rahul Kr Yadav</p>
              <div className="w-full h-[1px] bg-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Rahul Kr Yadav</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CEO & Founder</p>
            </div>

            {/* Gold Seal */}
            <div className="relative flex items-center justify-center">
               <div className="w-24 h-24 bg-[#C5A021] rounded-full shadow-lg flex items-center justify-center border-4 border-[#A67C00]">
                  <Award className="h-12 w-12 text-white" />
               </div>
               {/* Ribbons */}
               <div className="absolute top-[80%] left-[20%] w-8 h-12 bg-[#C5A021] [clip-path:polygon(0_0,100%_0,50%_100%)] rotate-[15deg] z-[-1]" />
               <div className="absolute top-[80%] right-[20%] w-8 h-12 bg-[#C5A021] [clip-path:polygon(0_0,100%_0,50%_100%)] rotate-[-15deg] z-[-1]" />
            </div>

            <div className="text-center w-[300px]">
              <p className="text-3xl mb-1 text-slate-800" style={{ fontFamily: "'Great Vibes', cursive" }}>Shivshankar Jaysawal</p>
              <div className="w-full h-[1px] bg-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Shivshankar Jaysawal</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Project Manager</p>
            </div>
          </div>
        </div>

        {/* Global CSS for Fonts */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; background: white; }
          }
        `}</style>
      </div>
    </div>
  );
}
