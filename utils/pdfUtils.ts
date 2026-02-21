
import { PDFFile, PDFPage, ProcessingStatus } from '../types';
import { decryptData } from './security';

declare global {
  interface Window {
    jspdf: any;
    PDFLib: any;
    forge: any;
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const processImage = async (
    fileItem: PDFFile,
    sessionKey: CryptoKey | null,
    targetMimeType: string = 'image/jpeg',
    updateStatus: (status: ProcessingStatus, progress: number) => void,
    addPage: (totalPages: number, page: PDFPage | undefined, compressedSize?: number) => void,
    quality: number = 0.9
) => {
    try {
        if (!sessionKey) throw new Error("Security Key Missing");
        updateStatus(ProcessingStatus.READING, 10);
        const decryptedBuffer = await decryptData(fileItem.encryptedData, fileItem.iv, sessionKey);
        
        // Fix: Use 'decryptedBuffer' instead of 'decryptedArrayBuffer'
        if (!decryptedBuffer || decryptedBuffer.byteLength === 0) {
            throw new Error("The image file is empty.");
        }

        const blob = new Blob([decryptedBuffer]);
        const url = URL.createObjectURL(blob);
        updateStatus(ProcessingStatus.READING, 50);
        const img = new Image();
        img.src = url;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        updateStatus(ProcessingStatus.CONVERTING, 20);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context failed");
        ctx.drawImage(img, 0, 0);
        
        let imageData = canvas.toDataURL(targetMimeType, quality);
        
        // Calculate binary size from data URL
        const base64Len = imageData.length - (imageData.indexOf(',') + 1);
        const binarySize = Math.round((base64Len * 3) / 4);
        
        URL.revokeObjectURL(url);
        updateStatus(ProcessingStatus.CONVERTING, 80);
        
        // Add the page first
        addPage(1, { pageNum: 1, imageData }, undefined);
        // Then finish with the size info
        addPage(1, undefined, binarySize);
        
        updateStatus(ProcessingStatus.COMPLETED, 100);
    } catch (error) {
        console.error("Error processing image:", error);
        updateStatus(ProcessingStatus.ERROR, 0);
    }
};

export const processPDF = async (
  pdfFileItem: PDFFile,
  sessionKey: CryptoKey | null,
  targetMimeType: string = 'image/jpeg',
  updateStatus: (status: ProcessingStatus, progress: number) => void,
  addPage: (totalPages: number, page: PDFPage | undefined, compressedSize?: number) => void,
  quality: number = 0.85
) => {
  try {
    if (!sessionKey) throw new Error("Security Key Missing");
    updateStatus(ProcessingStatus.READING, 10);
    const decryptedArrayBuffer = await decryptData(pdfFileItem.encryptedData, pdfFileItem.iv, sessionKey);
    
    if (!decryptedArrayBuffer || decryptedArrayBuffer.byteLength === 0) {
        throw new Error("The PDF file is empty, i.e. its size is zero bytes.");
    }

    updateStatus(ProcessingStatus.READING, 50);
    const pdf = await window.pdfjsLib.getDocument({ data: decryptedArrayBuffer }).promise;
    const totalPages = pdf.numPages;
    updateStatus(ProcessingStatus.CONVERTING, 0);
    let totalCompressedSize = 0;
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = Math.floor(viewport.height);
      canvas.width = Math.floor(viewport.width);
      if (context) {
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        let imageData = canvas.toDataURL(targetMimeType, quality);
        const base64Len = imageData.length - (imageData.indexOf(',') + 1);
        totalCompressedSize += (base64Len * 3) / 4; 
        addPage(totalPages, { pageNum, imageData }, undefined);
      }
      updateStatus(ProcessingStatus.CONVERTING, Math.round((pageNum / totalPages) * 100));
    }
    addPage(totalPages, undefined, Math.round(totalCompressedSize));
    updateStatus(ProcessingStatus.COMPLETED, 100);
  } catch (error) {
    console.error("Error processing PDF:", error);
    updateStatus(ProcessingStatus.ERROR, 0);
  }
};

/**
 * UPDATED LOCK PDF LOGIC WITH USER'S WORKING METHOD
 */
export const processLockPDF = async (
    pdfFileItem: PDFFile,
    sessionKey: CryptoKey | null,
    password: string,
    updateStatus: (status: ProcessingStatus, progress: number) => void,
    onComplete: (blob: Blob) => void
) => {
    try {
        if (!sessionKey) throw new Error("Security Key Missing");
        updateStatus(ProcessingStatus.READING, 10);
        
        // 1. Decrypt raw buffer
        const decryptedBuffer = await decryptData(pdfFileItem.encryptedData, pdfFileItem.iv, sessionKey);
        
        if (!decryptedBuffer || decryptedBuffer.byteLength === 0) {
            throw new Error("The PDF file is empty.");
        }

        updateStatus(ProcessingStatus.READING, 30);
        
        // 2. Load PDF with pdf.js
        const pdf = await window.pdfjsLib.getDocument({ data: decryptedBuffer }).promise;
        const totalPages = pdf.numPages;
        
        const { jsPDF } = window.jspdf;
        if (!jsPDF) throw new Error("jsPDF library not initialized");
        
        // 3. Create new PDF instance WITH ENCRYPTION IN CONSTRUCTOR (User's working method)
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'px',
            encryption: {
                userPassword: password,
                ownerPassword: password,
                userPermissions: ["print", "modify", "copy", "annot-forms"]
            }
        });

        updateStatus(ProcessingStatus.CONVERTING, 0);

        // 4. Process each page by converting to Image (Secure Method)
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // User's preferred scale

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = Math.floor(viewport.height);
            canvas.width = Math.floor(viewport.width);

            if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imgData = canvas.toDataURL('image/jpeg', 0.8);

                if (i > 1) {
                    doc.addPage([viewport.width, viewport.height]);
                } else {
                    // Set dimensions for the first page exactly as in user code
                    doc.internal.pageSize.width = viewport.width;
                    doc.internal.pageSize.height = viewport.height;
                }
                
                doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
            }
            updateStatus(ProcessingStatus.CONVERTING, Math.round((i / totalPages) * 100));
        }

        // 5. Finalize and return blob
        const pdfBlob = doc.output('blob');
        updateStatus(ProcessingStatus.COMPLETED, 100);
        onComplete(pdfBlob);
    } catch (err) {
        console.error("Locking failed:", err);
        updateStatus(ProcessingStatus.ERROR, 0);
    }
};

/**
 * COMPRESS PDF LOGIC
 * Rasterizes pages to images with controlled quality to reduce size
 */
export const processCompressPDF = async (
    pdfFileItem: PDFFile,
    sessionKey: CryptoKey | null,
    compressionLevel: number, // 0 - 1 (e.g., 0.5)
    scale: number, // 1.0 - 2.0
    updateStatus: (status: ProcessingStatus, progress: number) => void
): Promise<Blob> => {
    if (!sessionKey) throw new Error("Security Key Missing");
    updateStatus(ProcessingStatus.READING, 10);
    
    // Decrypt
    const decryptedBuffer = await decryptData(pdfFileItem.encryptedData, pdfFileItem.iv, sessionKey);
    if (!decryptedBuffer || decryptedBuffer.byteLength === 0) throw new Error("Empty PDF");

    updateStatus(ProcessingStatus.READING, 30);

    const pdf = await window.pdfjsLib.getDocument({ data: decryptedBuffer }).promise;
    const totalPages = pdf.numPages;
    const { jsPDF } = window.jspdf;
    
    // Create Doc
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        hotfixes: ["px_scaling"]
    });
    
    updateStatus(ProcessingStatus.CONVERTING, 0);

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        // Ensure integer dimensions
        canvas.height = Math.floor(viewport.height);
        canvas.width = Math.floor(viewport.width);

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            // Compress to JPEG
            const imgData = canvas.toDataURL('image/jpeg', compressionLevel);
            
            if (i > 1) {
                doc.addPage([viewport.width, viewport.height]);
            } else {
                // Resize the first page (created by default)
                doc.internal.pageSize.width = viewport.width;
                doc.internal.pageSize.height = viewport.height;
            }
            // Use defaults for compression in addImage to ensure compatibility
            doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
        }
        updateStatus(ProcessingStatus.CONVERTING, Math.round((i / totalPages) * 100));
    }

    const blob = doc.output('blob');
    updateStatus(ProcessingStatus.COMPLETED, 100);
    return blob;
};

/**
 * GENERATE PDF PAGE PREVIEW
 * Returns original vs compressed image data for the first page
 */
export const generatePDFPagePreview = async (
    pdfFileItem: PDFFile,
    sessionKey: CryptoKey | null,
    quality: number,
    scale: number
): Promise<{ originalUrl: string, compressedUrl: string, originalSize: number, compressedSize: number } | null> => {
    try {
        if (!sessionKey) return null;

        const decryptedBuffer = await decryptData(pdfFileItem.encryptedData, pdfFileItem.iv, sessionKey);
        if (!decryptedBuffer || decryptedBuffer.byteLength === 0) return null;

        const pdf = await window.pdfjsLib.getDocument({ data: decryptedBuffer }).promise;
        const page = await pdf.getPage(1); // Get first page

        // 1. Render Original (High Quality Reference)
        // Using scale 1.5 for clear view on screens
        const viewportOrig = page.getViewport({ scale: 1.5 });
        const canvasOrig = document.createElement('canvas');
        const ctxOrig = canvasOrig.getContext('2d');
        canvasOrig.width = Math.floor(viewportOrig.width);
        canvasOrig.height = Math.floor(viewportOrig.height);
        
        await page.render({ canvasContext: ctxOrig, viewport: viewportOrig }).promise;
        const originalUrl = canvasOrig.toDataURL('image/jpeg', 0.95);
        
        // Calculate approx size
        const head = 'data:image/jpeg;base64,';
        const origSize = Math.round((originalUrl.length - head.length) * 3 / 4);

        // 2. Render Compressed
        const viewportComp = page.getViewport({ scale: scale });
        const canvasComp = document.createElement('canvas');
        const ctxComp = canvasComp.getContext('2d');
        canvasComp.width = Math.floor(viewportComp.width);
        canvasComp.height = Math.floor(viewportComp.height);

        await page.render({ canvasContext: ctxComp, viewport: viewportComp }).promise;
        const compressedUrl = canvasComp.toDataURL('image/jpeg', quality);
        
        const compSize = Math.round((compressedUrl.length - head.length) * 3 / 4);

        return {
            originalUrl,
            compressedUrl,
            originalSize: origSize,
            compressedSize: compSize
        };
    } catch (e) {
        console.error("Preview Generation Failed", e);
        return null;
    }
};

/**
 * MERGE PDF LOGIC
 */
export const processMergePDF = async (
  filesToMerge: PDFFile[],
  sessionKey: CryptoKey | null,
  updateStatus: (status: ProcessingStatus, progress: number) => void
): Promise<Blob | null> => {
  if (!sessionKey || !window.PDFLib) {
      console.error("Deps missing for merge");
      return null;
  }
  
  try {
      updateStatus(ProcessingStatus.READING, 5);
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      let processedCount = 0;
      const totalFiles = filesToMerge.length;

      for (const fileItem of filesToMerge) {
          // Decrypt
          const decryptedBuffer = await decryptData(fileItem.encryptedData, fileItem.iv, sessionKey);
          
          if (!decryptedBuffer || decryptedBuffer.byteLength === 0) {
              console.warn(`Skipping empty file in merge: ${fileItem.name}`);
              continue;
          }

          // Load
          const pdf = await PDFDocument.load(decryptedBuffer);
          
          // Copy Pages
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page: any) => mergedPdf.addPage(page));

          processedCount++;
          updateStatus(ProcessingStatus.CONVERTING, Math.round((processedCount / totalFiles) * 100));
      }
      
      const mergedBytes = await mergedPdf.save();
      updateStatus(ProcessingStatus.COMPLETED, 100);
      return new Blob([mergedBytes], { type: 'application/pdf' });
  } catch (err) {
      console.error("Merge error:", err);
      updateStatus(ProcessingStatus.ERROR, 0);
      return null;
  }
};


const getBaseName = (originalName: string, customName?: string): string => {
  if (customName && customName.trim().length > 0) return customName.trim();
  const cleanOriginal = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  return `Converted_${cleanOriginal}`;
};

const createBlobForFormat = (dataUrl: string, extension: string): Blob => {
    const base64Data = dataUrl.split(',')[1];
    const binary = atob(base64Data);
    const array = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    const mime = dataUrl.split(':')[1].split(';')[0];
    return new Blob([array], { type: mime });
};

export const downloadSingleZip = async (pdfFile: PDFFile, customName?: string, formatHint?: string) => {
  if (!window.JSZip || !window.saveAs || !pdfFile.convertedPages || pdfFile.convertedPages.length === 0) {
      console.error("Download failed.");
      return;
  }
  
  const baseName = getBaseName(pdfFile.name, customName);
  let ext = formatHint || 'jpg';
  const page = pdfFile.convertedPages[0];
  
  if (ext === 'pdf' || (page.imageData && page.imageData.startsWith('data:application/pdf'))) {
      const blob = createBlobForFormat(page.imageData, 'pdf');
      window.saveAs(blob, `${baseName}.pdf`);
  } else {
      const zip = new window.JSZip();
      if (pdfFile.convertedPages.length === 1) {
          window.saveAs(createBlobForFormat(page.imageData, ext), `${baseName}.${ext}`);
      } else {
          const folder = zip.folder(baseName);
          pdfFile.convertedPages.forEach(p => {
              folder.file(`${baseName}_p${p.pageNum}.${ext}`, createBlobForFormat(p.imageData, ext));
          });
          const content = await zip.generateAsync({ type: "blob" });
          window.saveAs(content, `${baseName}.zip`);
      }
  }
};

export const downloadAllZip = async (files: PDFFile[], customName?: string, formatHint?: string) => {
  const zip = new window.JSZip();
  const zipName = customName || "PDFGarden_Harvest";
  let addedAny = false;

  for (const f of files) {
      if (f.status === ProcessingStatus.COMPLETED && f.convertedPages && f.convertedPages.length > 0) {
          addedAny = true;
          const baseName = getBaseName(f.name);
          const page = f.convertedPages[0];
          if (page.imageData && page.imageData.startsWith('data:application/pdf')) {
              zip.file(`${baseName}.pdf`, createBlobForFormat(page.imageData, 'pdf'));
          } else {
              f.convertedPages.forEach(p => {
                  zip.file(`${baseName}/page_${p.pageNum}.${formatHint || 'jpg'}`, createBlobForFormat(p.imageData, formatHint || 'jpg'));
              });
          }
      }
  }

  if (addedAny) {
      const content = await zip.generateAsync({ type: "blob" });
      window.saveAs(content, `${zipName}.zip`);
  }
};

export const downloadSinglePage = (page: PDFPage, originalName: string, formatHint?: string) => {
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const ext = formatHint || 'jpg';
    const blob = createBlobForFormat(page.imageData, ext);
    window.saveAs(blob, `${baseName}_page_${page.pageNum}.${ext}`);
};
