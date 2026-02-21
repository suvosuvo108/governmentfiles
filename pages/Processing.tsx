
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { ProcessingStatus } from '../types';
import { processPDF, processImage, processLockPDF, formatFileSize } from '../utils/pdfUtils';

const Processing: React.FC = () => {
  const { files, stats, updateFileStatus, updateFilePages, removeFile, resetApp, sessionKey } = useFileContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingDots, setLoadingDots] = useState("");
  
  const customFileName = location.state?.customFileName || "";
  const lockPassword = location.state?.lockPassword || "";
  const processingRef = useRef(false);

  const allCompleted = files.length > 0 && files.every(
    f => f.status === ProcessingStatus.COMPLETED || f.status === ProcessingStatus.ERROR
  );

  const totalPDFs = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalPages = files.reduce((acc, file) => acc + file.totalPages, 0);

  const activeToolId = location.state?.activeTool?.id || 'pdf-to-jpg';

  const getFormatConfig = (toolId: string) => {
      switch (toolId) {
          case 'pdf-to-png': return { mime: 'image/png', ext: '.png', label: 'PNG' };
          case 'pdf-to-jpeg': return { mime: 'image/jpeg', ext: '.jpeg', label: 'JPEG' }; 
          case 'pdf-to-webp': return { mime: 'image/webp', ext: '.webp', label: 'WEBP' };
          case 'pdf-to-ico': return { mime: 'image/png', ext: '.ico', label: 'ICO' }; 
          case 'pdf-to-html': return { mime: 'image/jpeg', ext: '.html', label: 'HTML' }; 
          case 'pdf-to-eps': return { mime: 'image/jpeg', ext: '.eps', label: 'EPS' }; 
          case 'pdf-to-tiff': return { mime: 'image/jpeg', ext: '.tiff', label: 'TIFF' }; 
          case 'pdf-to-xps': return { mime: 'image/jpeg', ext: '.xps', label: 'XPS' }; 
          case 'pdf-to-pdfa': return { mime: 'image/jpeg', ext: '.pdf', label: 'PDF/A' };
          case 'lock-pdf': return { mime: 'application/pdf', ext: '.pdf', label: 'Locked PDF' };
          case 'compress-image': return { mime: 'image/jpeg', ext: '.jpg', label: 'Compressed Image' };
          case 'convert-jpg': return { mime: 'image/jpeg', ext: '.jpg', label: 'JPG' };
          case 'convert-jpeg': return { mime: 'image/jpeg', ext: '.jpeg', label: 'JPEG' };
          case 'convert-png': return { mime: 'image/png', ext: '.png', label: 'PNG' };
          case 'convert-webp': return { mime: 'image/webp', ext: '.webp', label: 'WEBP' };
          case 'convert-tiff': return { mime: 'image/jpeg', ext: '.tiff', label: 'TIFF' };
          case 'convert-ico': return { mime: 'image/png', ext: '.ico', label: 'ICO' };
          case 'convert-xps': return { mime: 'image/jpeg', ext: '.xps', label: 'XPS' };
          case 'convert-eps': return { mime: 'image/jpeg', ext: '.eps', label: 'EPS' };
          default: return { mime: 'image/jpeg', ext: '.jpg', label: 'JPG' };
      }
  };

  const currentConfig = getFormatConfig(activeToolId);
  const isImageTool = activeToolId.startsWith('convert-') || activeToolId === 'compress-image';

  useEffect(() => {
    if (files.length === 0 || !sessionKey) return;

    const isBusy = files.some(f => 
      f.status === ProcessingStatus.READING || 
      f.status === ProcessingStatus.CONVERTING
    );

    if (!isBusy) {
      const nextFile = files.find(f => f.status === ProcessingStatus.PENDING);
      
      if (nextFile && !processingRef.current) {
        processingRef.current = true;

        if (activeToolId === 'lock-pdf') {
            processLockPDF(
                nextFile,
                sessionKey,
                lockPassword,
                (status, progress) => {
                    updateFileStatus(nextFile.id, status, progress);
                    if (status === ProcessingStatus.ERROR) processingRef.current = false;
                },
                (blob: Blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result as string;
                        updateFilePages(nextFile.id, 1, { pageNum: 1, imageData: base64 });
                        processingRef.current = false;
                    };
                    reader.readAsDataURL(blob);
                }
            ).catch(() => { processingRef.current = false; });
        } else {
            const processor = isImageTool ? processImage : processPDF;
            // Use lower quality for compression tool
            const quality = activeToolId === 'compress-image' ? 0.6 : 0.85;
            
            processor(
              nextFile, 
              sessionKey, 
              currentConfig.mime, 
              (status, progress) => {
                 updateFileStatus(nextFile.id, status, progress);
                 if (status === ProcessingStatus.COMPLETED || status === ProcessingStatus.ERROR) {
                     processingRef.current = false;
                 }
              },
              (totalPages, page, compressedSize) => updateFilePages(nextFile.id, totalPages, page, compressedSize),
              quality
            ).catch(() => { processingRef.current = false; });
        }
      }
    }
  }, [files, updateFileStatus, updateFilePages, sessionKey, currentConfig.mime, isImageTool, activeToolId, lockPassword]);

  useEffect(() => {
    if (allCompleted) {
        setLoadingDots(""); 
        return;
    }
    const interval = setInterval(() => {
      setLoadingDots((prev) => prev.length >= 5 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, [allCompleted]);

  const handlePreviewFile = (fileId: string) => {
      navigate('/download', { state: { ...location.state, viewFileId: fileId, customName: customFileName } });
  };
  const handleDeleteAll = () => resetApp();
  const handleDownloadAll = () => navigate('/download', { state: { ...location.state, customName: customFileName } });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 relative">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Processing</div>
      <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
          <div className="bg-green-600 text-white rounded-full p-4 shadow-2xl flex items-center justify-center relative group">
              <i className="fas fa-shield-alt text-3xl"></i>
              <div className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <strong>Secure Local Processing Active</strong>
              </div>
          </div>
      </div>

      <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white garden-text leading-tight">
          {allCompleted ? `Harvest Ready!` : `Cultivating Your Files to ${currentConfig.label}${loadingDots}`}
          </h2>
          <p className="text-gray-900 dark:text-gray-200 mt-2 font-bold text-lg">⚠️Do Not Close Or Refresh This Tab{loadingDots}</p>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-10 overflow-hidden">
         <div className="overflow-x-auto">
            <div className="flex min-w-max p-6 gap-8 divide-x divide-gray-200 dark:divide-gray-600">
                <div className="flex flex-col items-center px-4 min-w-[120px]"><span className="text-gray-500 text-xs font-bold uppercase mb-1">Total Files</span><div className="flex items-center gap-2 text-blue-600"><i className="fas fa-layer-group"></i><span className="text-3xl font-black">{totalPDFs}</span></div></div>
                <div className="flex flex-col items-center px-4 min-w-[120px]"><span className="text-gray-500 text-xs font-bold uppercase mb-1">Deleted</span><div className="flex items-center gap-2 text-red-500"><i className="fas fa-trash-alt"></i><span className="text-3xl font-black">{stats.deleted}</span></div></div>
                <div className="flex flex-col items-center px-4 min-w-[140px]"><span className="text-gray-500 text-xs font-bold uppercase mb-1">Total Size</span><div className="flex items-center gap-2 text-orange-600"><i className="fas fa-hdd"></i><span className="text-2xl font-black">{formatFileSize(totalSize)}</span></div></div>
                <div className="flex flex-col items-center px-4 min-w-[120px]"><span className="text-gray-500 text-xs font-bold uppercase mb-1">Total Items</span><div className="flex items-center gap-2 text-green-600"><i className="fas fa-file-image"></i><span className="text-3xl font-black">{totalPages}</span></div></div>
            </div>
         </div>
         <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
      </div>

      <div className="space-y-6">
        {files.map(file => (
          <div key={file.id} className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-2 transform transition-all duration-300 ${file.status === ProcessingStatus.CONVERTING ? 'border-green-500 scale-[1.02]' : 'border-transparent'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full flex items-center justify-center text-xl overflow-hidden shadow-inner bg-green-100 text-green-600 dark:bg-green-900/30">
                        <i className={`fas ${file.status === ProcessingStatus.COMPLETED ? 'fa-check' : 'fa-leaf'}`}></i>
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate max-w-xs">{file.name}</h3>
                          <div className="flex items-center gap-3 text-sm font-medium text-gray-500 mt-1">
                              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{formatFileSize(file.size)}</span>
                              {file.compressedSize && <span className="text-green-600 font-bold">→ {formatFileSize(file.compressedSize)}</span>}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-4"><span className="text-2xl font-black dark:text-white">{file.progress}%</span><div className="flex gap-2">
                      <button onClick={() => handlePreviewFile(file.id)} disabled={file.status !== ProcessingStatus.COMPLETED} className={`h-10 w-10 flex items-center justify-center rounded-full ${file.status === ProcessingStatus.COMPLETED ? 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-gray-100 text-gray-300'}`}><i className="fas fa-eye"></i></button>
                      <button onClick={() => removeFile(file.id)} className="h-10 w-10 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"><i className="fas fa-trash-alt"></i></button>
                  </div></div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner relative mt-2">
                  <div className={`h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-bold ${file.status === ProcessingStatus.COMPLETED ? 'bg-green-500' : 'bg-pink-500'}`} style={{ width: `${file.progress}%` }}>
                      {file.status === ProcessingStatus.CONVERTING && <span>Cultivating...</span>}
                      {file.status === ProcessingStatus.COMPLETED && <span>Done</span>}
                  </div>
              </div>
          </div>
        ))}
      </div>
      
      {files.length > 0 && (
          <div className="flex flex-col justify-center items-center gap-8 mt-12 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <button onClick={handleDeleteAll} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition">Delete All</button>
                <button onClick={handleDownloadAll} disabled={!allCompleted} className={`px-8 py-3 rounded-xl font-bold shadow-lg transition ${allCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500'}`}>View & Download Results</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Processing;
