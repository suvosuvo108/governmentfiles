
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { downloadSingleZip, downloadAllZip, downloadSinglePage, formatFileSize } from '../utils/pdfUtils';
import { PDFFile } from '../types';

const Download: React.FC = () => {
  const { files, removeFile } = useFileContext();
  const navigate = useNavigate();
  const location = useLocation();

  // State for Grid Columns (Default 4)
  const [gridCols, setGridCols] = useState(4);
  const [isGridDropdownOpen, setIsGridDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<'single' | 'all'>('all');
  const [targetFile, setTargetFile] = useState<PDFFile | null>(null);
  
  // Custom Name Logic
  const [downloadMode, setDownloadMode] = useState<'initial' | 'custom_input' | 'ready_custom'>('initial');
  const [customName, setCustomName] = useState(location.state?.customName || '');
  const [nameError, setNameError] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsGridDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Retrieve the specific file ID and active tool info
  const viewFileId = location.state?.viewFileId;
  const activeTool = location.state?.activeTool;

  // Helpers to get format
  const getTargetFormatLabel = (): string | null => {
      if (!activeTool || !activeTool.name) return null;
      if (activeTool.id.startsWith('convert-')) {
          const suffix = activeTool.id.split('-')[1];
          return suffix.toUpperCase();
      }
      const match = activeTool.name.match(/(?:To|to)\s+([A-Z0-9\/]+)/i);
      if (match && match[1]) {
          return match[1].toUpperCase();
      }
      return null;
  };

  const getFormatExtension = (): string => {
      const id = activeTool?.id;
      if (id === 'pdf-to-png') return 'png';
      if (id === 'pdf-to-jpeg') return 'jpeg';
      if (id === 'pdf-to-webp') return 'webp';
      if (id === 'pdf-to-html') return 'html';
      if (id === 'pdf-to-eps') return 'eps';
      if (id === 'pdf-to-ico') return 'ico';
      if (id === 'pdf-to-tiff') return 'tiff';
      if (id === 'pdf-to-xps') return 'xps';
      if (id === 'pdf-to-pdfa') return 'pdf';
      if (id === 'convert-jpg') return 'jpg';
      if (id === 'convert-jpeg') return 'jpeg';
      if (id === 'convert-png') return 'png';
      if (id === 'convert-webp') return 'webp';
      if (id === 'convert-tiff') return 'tiff';
      if (id === 'convert-ico') return 'ico';
      if (id === 'convert-xps') return 'xps';
      if (id === 'convert-eps') return 'eps';
      return 'jpg';
  };

  const targetFormat = getTargetFormatLabel();
  const currentExtension = getFormatExtension();

  // Filter files
  const displayedFiles = viewFileId 
    ? files.filter(f => f.id === viewFileId)
    : files;

  const totalSize = displayedFiles.reduce((acc, curr) => acc + curr.size, 0);
  const totalPagesCount = displayedFiles.reduce((acc, curr) => acc + curr.totalPages, 0);

  // --- MODAL HANDLERS ---
  
  const openDownloadModal = (type: 'single' | 'all', file?: PDFFile) => {
    setDownloadTarget(type);
    setTargetFile(file || null);
    
    if (customName) {
        setDownloadMode('ready_custom');
    } else {
        setDownloadMode('initial');
    }
    
    setNameError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length > 250) {
          setNameError('⚠️ Maximum 250 characters allowed.');
      } else {
          setNameError('');
          setCustomName(val);
      }
  };

  const handleCustomDone = () => {
      if (!customName.trim()) {
          setNameError('Please enter a name.');
          return;
      }
      setDownloadMode('ready_custom');
  };

  const executeDownload = (useCustom: boolean) => {
      const finalName = useCustom ? customName : undefined;
      if (downloadTarget === 'single' && targetFile) {
          downloadSingleZip(targetFile, finalName, currentExtension);
      } else {
          downloadAllZip(displayedFiles, finalName, currentExtension);
      }
      closeModal();
  };

  // --- GRID CHANGE HANDLER ---
  const handleGridChange = (num: number) => {
    if (num > 4 && window.innerWidth < 1024) {
        alert("aee option ta use korar jonno desktop mood on korun");
        return;
    }
    setGridCols(num);
    setIsGridDropdownOpen(false);
  };

  if (files.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-700">No Harvest found</h2>
        <button 
            onClick={() => navigate('/upload')} 
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
        >
            Plant Seeds (Upload)
        </button>
      </div>
    );
  }

  const getItemWidthStyle = (isSingleItem: boolean) => {
      if (isSingleItem) return {}; 
      return {
          '--desktop-width': `calc(100% / ${gridCols} - 1.5rem)`,
          '--mobile-width': `calc(50% - 0.75rem)`
      } as React.CSSProperties;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Download</div>
      <style>{`
         .gallery-item { width: var(--mobile-width); }
         @media (min-width: 768px) { .gallery-item { width: var(--desktop-width); } }
         .gallery-item-single { width: 100%; max-width: 500px; }
      `}</style>

      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 gap-6 transition-colors">
        <div className="text-center xl:text-left">
           <div className="flex items-center justify-center xl:justify-start gap-4 flex-wrap">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white garden-text">
                  {viewFileId ? 'Your Harvest' : 'Harvest Your Results'}
              </h2>
              {targetFormat && (
                  <div className="bg-pink-100 border-2 border-pink-500 text-pink-700 px-4 py-1 rounded-lg font-bold text-xl shadow-sm animate-pulse">
                      {targetFormat}
                  </div>
              )}
           </div>
           
           <p className="text-gray-800 dark:text-gray-300 mt-2 font-black text-lg">
             Total Size: {formatFileSize(totalSize)} &nbsp;|&nbsp; Files: {displayedFiles.length} &nbsp;|&nbsp; Total Pages: {totalPagesCount}
           </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center items-center z-10">
           {viewFileId && (
              <button 
                onClick={() => navigate('/download', { state: { activeTool } })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 font-bold transition flex items-center gap-2"
              >
                <i className="fas fa-list"></i> View All
              </button>
           )}

           <button 
             onClick={() => navigate('/processing', { state: location.state })}
             className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 font-bold transition flex items-center gap-2"
           >
             <i className="fas fa-arrow-left"></i> Back to List
           </button>
           
           <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsGridDropdownOpen(!isGridDropdownOpen)}
                    className="flex items-center justify-between bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-5 py-2 shadow-md transition font-bold gap-3 min-w-[130px]"
                >
                    <div className="flex items-center gap-2">
                        <i className="fas fa-th"></i>
                        <span className="font-mono text-lg">*{gridCols}</span>
                    </div>
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${isGridDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {isGridDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-down origin-top z-50">
                        {[3, 4, 5, 6].map(num => (
                            <button
                                key={num}
                                onClick={() => handleGridChange(num)}
                                className={`w-full text-left px-4 py-3 font-bold flex items-center justify-between hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${gridCols === num ? 'text-pink-600 bg-pink-50 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200'}`}
                            >
                                <span className="font-mono text-lg">*{num}</span>
                                {gridCols === num && <i className="fas fa-check text-pink-600 text-xs"></i>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

           <button 
             onClick={() => openDownloadModal('all')}
             className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 font-bold transition flex items-center gap-2"
           >
             <i className="fas fa-file-archive"></i> Download {viewFileId ? 'This' : 'All'} (ZIP)
           </button>
        </div>
      </div>

      <div className="space-y-12">
        {displayedFiles.map((file) => (
          <div key={file.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
             <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                     <i className="fas fa-file-pdf text-xl"></i>
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{file.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{file.totalPages} Pages • {formatFileSize(file.size)}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                    <button 
                      onClick={() => openDownloadModal('single', file)}
                      className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-pink-700 transition flex items-center gap-2 shadow-sm"
                    >
                       <i className="fas fa-download"></i> Download Zip
                    </button>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-sm"
                    >
                       <i className="fas fa-trash"></i> Delete
                    </button>
                </div>
             </div>

             <div className="p-6 flex flex-wrap justify-center gap-6 bg-slate-50 dark:bg-gray-900/20">
                {file.convertedPages && file.convertedPages.length > 0 ? (
                  file.convertedPages.map((page) => {
                     const isSingle = file.convertedPages.length === 1;
                     return (
                       <div 
                          key={page.pageNum} 
                          className={`flex flex-col group ${isSingle ? 'gallery-item-single' : 'gallery-item'}`}
                          style={getItemWidthStyle(isSingle)}
                       >
                          <div className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 aspect-[1/1.4] flex items-center justify-center">
                            <img 
                                src={page.imageData} 
                                alt={`Page ${page.pageNum}`} 
                                className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between px-1">
                            <div className="text-lg font-black text-gray-800 dark:text-white">
                                {file.totalPages > 1 ? `${page.pageNum}/${file.totalPages}` : 'Preview'}
                            </div>
                            <button 
                                onClick={() => downloadSinglePage(page, file.name, currentExtension)}
                                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-md"
                            >
                                <i className="fas fa-download"></i> Image
                            </button>
                          </div>
                       </div>
                     );
                  })
                ) : (
                  <div className="w-full py-10 text-center">
                    <i className="fas fa-exclamation-circle text-gray-300 text-4xl mb-4"></i>
                    <p className="text-gray-400 font-bold">No pages were generated for this file.</p>
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border-2 border-indigo-100 dark:border-gray-700 transform transition-all scale-100">
                  <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <i className="fas fa-times text-xl"></i>
                  </button>

                  <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 text-center garden-text">
                      Download Options
                  </h3>

                  {downloadMode === 'initial' && (
                      <div className="space-y-4">
                          <button 
                              onClick={() => setDownloadMode('custom_input')}
                              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white p-4 rounded-xl font-bold shadow-md flex items-center justify-between group"
                          >
                              <span className="flex items-center gap-3">
                                  <i className="fas fa-pen-nib"></i> 1. Enter Custom Name
                              </span>
                              <i className="fas fa-chevron-right opacity-50 group-hover:opacity-100 transition"></i>
                          </button>
                          <button 
                              onClick={() => executeDownload(false)}
                              className="w-full bg-white dark:bg-gray-700 border-2 border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-600 p-4 rounded-xl font-bold shadow-md flex items-center justify-between group"
                          >
                              <span className="flex items-center gap-3">
                                  <i className="fas fa-robot"></i> 2. Use System Default
                              </span>
                              <i className="fas fa-download opacity-50 group-hover:opacity-100 transition"></i>
                          </button>
                      </div>
                  )}

                  {downloadMode === 'custom_input' && (
                      <div className="animate-fade-in-up">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Enter Name (Max 250 Chars)
                          </label>
                          <div className="relative">
                            <input 
                                type="text"
                                value={customName}
                                onChange={handleCustomNameChange}
                                maxLength={250}
                                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition text-lg font-bold dark:bg-gray-700 dark:text-white"
                                autoFocus
                            />
                            <div className="absolute right-3 top-4 text-xs font-bold text-gray-400">
                                {customName.length}/250
                            </div>
                          </div>
                          
                          {nameError && (
                              <p className="text-red-500 text-sm font-bold mt-2 animate-pulse">
                                  {nameError}
                              </p>
                          )}

                          <div className="flex gap-3 mt-6">
                              <button 
                                onClick={() => setDownloadMode('initial')}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition"
                              >
                                  Back
                              </button>
                              <button 
                                onClick={handleCustomDone}
                                className="flex-1 bg-black dark:bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
                              >
                                  Done
                              </button>
                          </div>
                      </div>
                  )}

                  {downloadMode === 'ready_custom' && (
                      <div className="text-center animate-fade-in-up">
                          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                              <i className="fas fa-check"></i>
                          </div>
                          <p className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-6">
                              Ready! Filename: <br/>
                              <span className="text-purple-600 dark:text-purple-400 break-all font-mono">"{customName}.zip"</span>
                          </p>
                          
                          <button 
                            onClick={() => executeDownload(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-black text-xl shadow-xl hover:scale-105 transition transform flex items-center justify-center gap-3"
                          >
                              <i className="fas fa-file-archive"></i> Download
                          </button>

                          <button 
                            onClick={() => setDownloadMode('custom_input')}
                            className="mt-4 text-sm text-gray-400 font-bold hover:text-green-600 underline block"
                          >
                              Edit Name
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Download;
