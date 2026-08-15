import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DownloadOptions {
  element: HTMLElement;
  filename: string;
  pdfOrientation?: 'portrait' | 'landscape';
  scale?: number;
}

export async function downloadAsPDF({
  element,
  filename,
  pdfOrientation = 'portrait',
  scale = 2
}: DownloadOptions): Promise<boolean> {
  try {
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 10000,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: pdfOrientation === 'landscape' ? 'l' : 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    if (pdfOrientation === 'landscape') {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } else {
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const yOffset = imgHeight > pdfHeight ? 0 : (pdfHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight, undefined, 'FAST');
    }

    const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalName);
    return true;
  } catch (err: any) {
    console.warn('PDF Generation Engine Warning, falling back to PNG engine:', err);
    return false;
  }
}

export async function downloadAsPNG({
  element,
  filename,
  scale = 2
}: DownloadOptions): Promise<boolean> {
  try {
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 10000,
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err: any) {
    console.error('PNG Download Engine Error:', err);
    return false;
  }
}
