
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { processCompressPDF, generatePDFPagePreview, formatFileSize } from '../utils/pdfUtils';
import { ProcessingStatus } from '../types';

const CompressPdfConfig: React.FC = () => {
  const navigate = useNavigate();
  const { files, sessionKey, resetApp, updateFileStatus, removeFile } = useFileContext();
  
  // Compression Settings
  // Mode: extreme (Low Q, Low Scale), recommended (Med Q, Med Scale), less (High Q, High Scale)
  const [compressionMode, setCompressionMode] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [completedFiles, setCompletedFiles] = useState<{id: string, blob: Blob, originalSize: number, newSize: number}[]>([]);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{originalUrl: string, compressedUrl: string, originalSize: number, compressedSize: number} | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  // Independent preview settings
  const [previewQuality, setPreviewQuality] = useState(0.7);
  const [previewScale, setPreviewScale] = useState(1.5);
  const [activePreviewFileId, setActivePreviewFileId] = useState<string | null>(null);

  // Note: Removed auto-redirect useEffect to prevent race conditions. 
  // If files are empty, we show a UI message instead.

  const getCompressionSettings = () => {
      switch (compressionMode) {
          case 'extreme': return { quality: 0.4, scale: 1.0, label: 'Extreme (Smallest Size)' };
          case 'less': return { quality: 0.9, scale: 2.0, label: 'Less (High Quality)' };
          default: return { quality: 0.7, scale: 1.5, label: 'Recommended' };
      }
  };

  const updatePreview = async (fileId: string, q: number, s: number) => {
      setPreviewLoading(true);
      const file = files.find(f => f.id === fileId);
      if (file && sessionKey) {
          const result = await generatePDFPagePreview(file, sessionKey, q, s);
          setPreviewData(result);
      }
      setPreviewLoading(false);
  };

  const openPreview = (fileId: string) => {
      const settings = getCompressionSettings();
      // Initialize preview controls with current global settings
      setPreviewQuality(settings.quality);
      setPreviewScale(settings.scale);
      setActivePreviewFileId(fileId);
      
      setIsPreviewOpen(true);
      updatePreview(fileId, settings.quality, settings.scale);
  };

  // When user drags sliders in modal
  const handlePreviewChange = (newQ: number, newS: number) => {
      setPreviewQuality(newQ);
      setPreviewScale(newS);
  };

  useEffect(() => {
      if (activePreviewFileId && isPreviewOpen) {
          const timeout = setTimeout(() => {
              updatePreview(activePreviewFileId, previewQuality, previewScale);
          }, 300); // Debounce slider
          return () => clearTimeout(timeout);
      }
  }, [previewQuality, previewScale, activePreviewFileId, isPreviewOpen]);


  const handleCompressAll = async () => {
      if (!sessionKey || files.length === 0) return;
      setIsProcessing(true);
      setCompletedFiles([]);

      const settings = getCompressionSettings();

      for (let i = 0; i < files.length; i++) {
          setCurrentFileIndex(i);
          const file = files[i];
          try {
              const resultBlob = await processCompressPDF(
                  file, 
                  sessionKey, 
                  settings.quality, 
                  settings.scale,
                  (status, progress) => {
                      updateFileStatus(file.id, status, progress);
                  }
              );
              
              setCompletedFiles(prev => [...prev, {
                  id: file.id,
                  blob: resultBlob,
                  originalSize: file.size,
                  newSize: resultBlob.size
              }]);
          } catch (err) {
              console.error(`Failed to compress ${file.name}`, err);
              updateFileStatus(file.id, ProcessingStatus.ERROR, 0);
          }
      }
      setIsProcessing(false);
  };

  const downloadFile = (fileId: string, originalName: string) => {
      const completed = completedFiles.find(f => f.id === fileId);
      if (completed) {
          const newName = originalName.replace('.pdf', '_compressed.pdf');
          window.saveAs(completed.blob, newName);
      }
  };

  const downloadAll = async () => {
    if (!window.JSZip || !window.saveAs) return;
    const zip = new window.JSZip();
    
    files.forEach(f => {
        const completed = completedFiles.find(c => c.id === f.id);
        if (completed) {
            zip.file(`${f.name.replace('.pdf', '')}_min.pdf`, completed.blob);
        }
    });

    const content = await zip.generateAsync({ type: "blob" });
    window.saveAs(content, "compressed_pdfs.zip");
  };

  const settings = getCompressionSettings();
  const allDone = files.length > 0 && completedFiles.length === files.length;

  if (files.length === 0) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in-up">
              <div className="h-24 w-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg">
                  <i className="fas fa-exclamation"></i>
              </div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2 garden-text">No Files Selected</h2>
              <p className="text-gray-500 mb-8 max-w-md">It seems like no PDF files were uploaded or they were lost during navigation.</p>
              <button 
                  onClick={() => navigate('/upload', { state: { activeTool: { id: 'compress-pdf' } } })}
                  className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-orange-700 transition transform hover:scale-105"
              >
                  Go to Upload
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
       {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: CompressPdfConfig</div>
      
      {/* Styles for sliders */}
      <style>{`
        input[type="range"].rgb-slider {
          -webkit-appearance: none; height: 8px; border-radius: 10px;
          background: #e5e7eb;
          outline: none; cursor: pointer;
        }
        .dark input[type="range"].rgb-slider { background: #4b5563; }
        input[type="range"].rgb-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: #3b82f6; border: 2px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        input[type="range"].rgb-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="h-20 w-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg border-2 border-orange-200">
            <i className="fas fa-compress-arrows-alt"></i>
        </div>
        <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 garden-text uppercase tracking-tight">Compress PDF</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg mx-auto">
            Reduce file size while maintaining quality directly in your browser.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Configuration */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="font-black text-gray-800 dark:text-white mb-4 uppercase text-sm tracking-widest">Compression Level</h3>
                  
                  <div className="space-y-3">
                      <button 
                        onClick={() => setCompressionMode('extreme')}
                        disabled={isProcessing || allDone}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${compressionMode === 'extreme' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-200' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-gray-800 dark:text-white">Extreme</span>
                              {compressionMode === 'extreme' && <i className="fas fa-check-circle text-orange-500"></i>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Low Quality, Max Reduction</p>
                      </button>

                      <button 
                        onClick={() => setCompressionMode('recommended')}
                        disabled={isProcessing || allDone}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${compressionMode === 'recommended' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}`}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-gray-800 dark:text-white">Recommended</span>
                              {compressionMode === 'recommended' && <i className="fas fa-check-circle text-green-500"></i>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Balanced Quality & Size</p>
                      </button>

                      <button 
                        onClick={() => setCompressionMode('less')}
                        disabled={isProcessing || allDone}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${compressionMode === 'less' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-gray-800 dark:text-white">Less</span>
                              {compressionMode === 'less' && <i className="fas fa-check-circle text-blue-500"></i>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">High Quality, Low Reduction</p>
                      </button>
                  </div>

                  <div className="mt-8">
                      {!isProcessing && !allDone && (
                          <button 
                            onClick={handleCompressAll}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                              <i className="fas fa-compress"></i> Compress PDF
                          </button>
                      )}
                      
                      {isProcessing && (
                          <button disabled className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl font-black flex items-center justify-center gap-2 cursor-wait">
                              <i className="fas fa-circle-notch fa-spin"></i> Processing...
                          </button>
                      )}

                      {allDone && (
                         <div className="space-y-3">
                            <button 
                                onClick={downloadAll}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-file-archive"></i> Download All (ZIP)
                            </button>
                            <button 
                                onClick={() => { resetApp(); navigate('/'); }}
                                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition"
                            >
                                Start Over
                            </button>
                         </div>
                      )}
                  </div>
              </div>
          </div>

          {/* RIGHT: File List */}
          <div className="lg:col-span-2 space-y-4">
              {files.map((file, idx) => {
                  const completed = completedFiles.find(c => c.id === file.id);
                  const isCurrent = isProcessing && idx === currentFileIndex;
                  const percentSaved = completed ? Math.round(((completed.originalSize - completed.newSize) / completed.originalSize) * 100) : 0;
                  const isSaved = percentSaved > 0;

                  return (
                    <div key={file.id} className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 transition-all ${isCurrent ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-100 dark:border-gray-700'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {completed ? <i className="fas fa-check"></i> : <i className="fas fa-file-pdf"></i>}
                                </div>
                                <div className="truncate">
                                    <h4 className="font-bold text-gray-800 dark:text-white truncate">{file.name}</h4>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0">
                                {isProcessing && idx === currentFileIndex && (
                                    <span className="text-orange-500 font-bold text-sm animate-pulse">Compressing... {file.progress}%</span>
                                )}
                                
                                {completed && (
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="font-black text-gray-800 dark:text-white">{formatFileSize(completed.newSize)}</p>
                                            <p className={`text-xs font-bold ${isSaved ? 'text-green-500' : 'text-red-500'}`}>
                                                {isSaved ? `-${percentSaved}%` : '+0%'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => downloadFile(file.id, file.name)}
                                            className="h-10 w-10 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition shadow-md"
                                        >
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </div>
                                )}
                                
                                {!isProcessing && !completed && (
                                     <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setActivePreviewFileId(file.id); openPreview(file.id); }}
                                            className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-xs font-black hover:bg-purple-100 transition flex items-center gap-2"
                                        >
                                            <i className="fas fa-eye"></i> Preview / Tune
                                        </button>
                                        <button onClick={() => removeFile(file.id)} className="h-9 w-9 bg-gray-100 text-gray-400 rounded-lg hover:text-red-500 transition flex items-center justify-center">
                                            <i className="fas fa-times"></i>
                                        </button>
                                     </div>
                                )}
                            </div>
                        </div>
                        {isProcessing && idx === currentFileIndex && (
                             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                 <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                             </div>
                        )}
                    </div>
                  );
              })}
          </div>
      </div>

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
          <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                      <div>
                          <h3 className="text-xl font-black garden-text text-gray-800 dark:text-white uppercase">Visual Comparison</h3>
                          <p className="text-xs text-gray-500 font-bold">First page preview</p>
                      </div>
                      <button onClick={() => setIsPreviewOpen(false)} className="h-10 w-10 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center hover:text-red-500 transition">
                          <i className="fas fa-times text-lg"></i>
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                      <div className="grid md:grid-cols-2 gap-8 h-full">
                          
                          {/* ORIGINAL */}
                          <div className="flex flex-col gap-4">
                              <div className="flex justify-between items-end">
                                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Original</span>
                                  {previewData && <span className="text-xs font-bold text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">Est. Page Size: {formatFileSize(previewData.originalSize)}</span>}
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center h-full min-h-[300px]">
                                  {previewData ? (
                                      <img src={previewData.originalUrl} alt="Original" className="max-h-[400px] object-contain shadow-lg" />
                                  ) : (
                                      <i className="fas fa-spinner fa-spin text-4xl text-gray-300"></i>
                                  )}
                              </div>
                          </div>

                          {/* COMPRESSED PREVIEW */}
                          <div className="flex flex-col gap-4">
                              <div className="flex justify-between items-end">
                                  <span className="text-sm font-black text-blue-500 uppercase tracking-widest">Compressed Preview</span>
                                  {previewData ? (
                                      <div className="flex flex-col items-end">
                                         <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded shadow-sm mb-1">Est. Page Size: {formatFileSize(previewData.compressedSize)}</span>
                                         <span className="text-[10px] font-bold text-green-600">Saved: {Math.round((1 - previewData.compressedSize/previewData.originalSize) * 100)}%</span>
                                      </div>
                                  ) : null}
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-inner border-2 border-blue-100 dark:border-blue-900 p-4 flex items-center justify-center h-full min-h-[300px] relative">
                                  {previewLoading && (
                                      <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                          <i className="fas fa-sync fa-spin text-3xl text-blue-600"></i>
                                      </div>
                                  )}
                                  {previewData ? (
                                      <img src={previewData.compressedUrl} alt="Compressed" className="max-h-[400px] object-contain shadow-lg" />
                                  ) : (
                                      <i className="fas fa-spinner fa-spin text-4xl text-gray-300"></i>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Modal Controls */}
                  <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-6">
                              <div>
                                  <div className="flex justify-between mb-2">
                                      <label className="text-xs font-black text-gray-500 uppercase">Image Quality: {Math.round(previewQuality * 100)}%</label>
                                  </div>
                                  <input 
                                      type="range" min="0.1" max="1.0" step="0.05"
                                      value={previewQuality}
                                      onChange={(e) => handlePreviewChange(parseFloat(e.target.value), previewScale)}
                                      className="w-full rgb-slider"
                                  />
                              </div>
                              <div>
                                  <div className="flex justify-between mb-2">
                                      <label className="text-xs font-black text-gray-500 uppercase">Scale/Resolution: {previewScale}x</label>
                                  </div>
                                  <input 
                                      type="range" min="0.5" max="2.0" step="0.1"
                                      value={previewScale}
                                      onChange={(e) => handlePreviewChange(previewQuality, parseFloat(e.target.value))}
                                      className="w-full rgb-slider"
                                  />
                              </div>
                          </div>
                          <div className="flex flex-col justify-center items-center text-center">
                              <p className="text-sm text-gray-500 mb-4">
                                  Adjusting sliders updates the visual preview. <br/>
                                  <span className="font-bold text-gray-800 dark:text-white">These settings are for preview only.</span> 
                                  <br/>To apply custom settings, we recommend sticking to the presets for now.
                              </p>
                              <button onClick={() => setIsPreviewOpen(false)} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition">
                                  Close Preview
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CompressPdfConfig;
