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
        className="relative w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden border-[1px] border-slate-200 select-none"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {/* Borders and Patterns */}
        <div className="absolute inset-0 border-[30px] border-white z-30 pointer-events-none" />
        <div className="absolute inset-8 border-[2px] border-[#C5A021] z-30 pointer-events-none" />

        {/* TOP RIGHT Design */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#003366] [clip-path:polygon(100%_0,100%_100%,40%_0)] z-10" />
        <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-[#C5A021] [clip-path:polygon(100%_0,100%_100%,40%_0)] z-0 mr-[-8px]" />

        {/* BOTTOM LEFT Design */}
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#003366] [clip-path:polygon(0_100%,0_0,60%_100%)] z-10" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-[#C5A021] [clip-path:polygon(0_100%,0_0,60%_100%)] z-0 ml-[-8px]" />

        {/* Logo Section */}
        <div className="relative z-40 h-full w-full flex flex-col items-center pt-20 px-40 text-center">
          <div className="mb-8">
             <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#C5A021]">
                <img src="/logo.png" alt="" className="h-14 w-14 object-contain" />
             </div>
             <h3 className="text-sm font-black text-[#003366] tracking-[8px] uppercase">Zaya Code Hub</h3>
          </div>

          <h1 className="text-[72px] font-black text-slate-900 mb-0 uppercase tracking-[6px] leading-none">Certificate</h1>
          <h2 className="text-[24px] font-bold text-[#C5A021] mb-12 tracking-[12px] uppercase">Of Internship Completion</h2>
          
          <div className="flex items-center gap-6 mb-8">
             <div className="w-16 h-[2px] bg-slate-200" />
             <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[4px]">This acknowledgment is proudly presented to</p>
             <div className="w-16 h-[2px] bg-slate-200" />
          </div>
          
          {/* THE NAME - Fixed Styling */}
          <div className="mb-10 min-h-[120px] flex items-center justify-center">
            <h2 className="text-[78px] font-black text-[#003366] uppercase tracking-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              {internName}
            </h2>
          </div>
          
          <p className="text-[16px] text-slate-600 leading-relaxed max-w-[850px] font-serif mb-16 px-10">
            For their exceptional performance and dedication during the internship program at <span className="font-bold text-slate-900">Zaya Code Hub</span>. They have successfully completed the project <span className="font-bold text-[#C5A021]">"{taskTitle}"</span> showcasing professional excellence from <span className="font-bold text-slate-900">{dateRange}</span>.
          </p>

          {/* Signatures */}
          <div className="w-full flex justify-between items-end mt-4 mb-12 px-10">
            <div className="flex flex-col items-center w-[250px]">
              <p className="text-2xl mb-2 italic text-[#003366]" style={{ fontFamily: "'Dancing Script', cursive" }}>Rahul Kr Yadav</p>
              <div className="w-full h-[1px] bg-slate-300 mb-2" />
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">CEO & Founder</p>
            </div>

            {/* Central Seal */}
            <div className="relative flex flex-col items-center justify-center -mb-4">
               <div className="w-28 h-28 bg-[#C5A021] rounded-full shadow-2xl flex items-center justify-center border-[6px] border-white relative z-10">
                  <Award className="h-14 w-14 text-white" />
               </div>
            </div>

            <div className="flex flex-col items-center w-[250px]">
              <p className="text-2xl mb-2 italic text-[#003366]" style={{ fontFamily: "'Dancing Script', cursive" }}>Shivshankar Jaysawal</p>
              <div className="w-full h-[1px] bg-slate-300 mb-2" />
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Project Manager</p>
            </div>
          </div>

          {/* Footer ID */}
          {certificateId && (
            <div className="absolute bottom-10 w-full px-40 flex justify-between items-end text-[9px] font-bold uppercase tracking-[3px] text-slate-400">
               <p>Credential ID: <span className="text-slate-900 font-black">{certificateId}</span></p>
               <p>Verify Authenticity: <span className="text-blue-600 font-black underline">zayacodehub.com/verify</span></p>
            </div>
          )}
        </div>

        {/* Global CSS */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,900&family=Dancing+Script:wght@700&display=swap');
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

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
