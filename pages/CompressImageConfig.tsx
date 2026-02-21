
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { decryptData } from '../utils/security';
import { formatFileSize } from '../utils/pdfUtils';

// --- CONFIG FOR UPLOADERS ---
const GOOGLE_CLIENT_ID = '705204588232-3m2bivi6c0nd41lgpe7j34abim8s0gta.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAs1-yX51Kd5aKl-mB1oHhKXhOwCUDcPUY';
const GOOGLE_APP_ID = '705204588232';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

interface CompressedFile {
  id: string;
  name: string;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  savedPercent: string;
  savedBytes: number;
  status: 'processing' | 'done' | 'error';
}

const CompressImageConfig: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { files, sessionKey, resetApp, addFiles } = useFileContext();
  
  // Compression Modes: 'score' (1-10) or 'percent' (0-100% compression level)
  const [mode, setMode] = useState<'score' | 'percent'>('score');
  
  const [quality, setQuality] = useState(8); // For score mode
  const [compressionPercent, setCompressionPercent] = useState(20); // For percent mode (20% compression approx quality 0.8)

  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Manual Compression State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualFileId, setManualFileId] = useState<string | null>(null);
  const [manualQuality, setManualQuality] = useState(50); // 0-100 scale for manual
  const [manualPreviewUrl, setManualPreviewUrl] = useState<string | null>(null);
  const [manualBlob, setManualBlob] = useState<Blob | null>(null);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deletedIds = useRef<Set<string>>(new Set());

  // --- UPLOAD STATE & LOGIC ---
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);

  // Initialize Upload Scripts (Google/Dropbox)
  useEffect(() => {
    // 1. Dropbox
    if (!window.Dropbox) {
      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.setAttribute('data-app-key', '3l7z1yycs84fbvu');
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }

    // 2. Google
    const loadGoogleScripts = () => {
      if (window.gapi) {
        window.gapi.load('client:picker', async () => {
          try {
            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
            setPickerInited(true);
          } catch (e) { console.error(e); }
        });
      }
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: '', 
        });
        setTokenClient(client);
        setGisInited(true);
      }
    };

    const checkScripts = setInterval(() => {
      if (window.gapi && window.google) {
        loadGoogleScripts();
        clearInterval(checkScripts);
      }
    }, 500);

    return () => clearInterval(checkScripts);
  }, []);

  // --- COMPRESSION EFFECT ---
  useEffect(() => {
    if (files.length === 0 || !sessionKey) return;

    const processFiles = async () => {
      // Filter out files that the user has deleted locally
      const activeFiles = files.filter(f => !deletedIds.current.has(f.id));
      
      // Calculate effective Q value (0.1 to 1.0) based on mode
      let qValue = 0.8;
      if (mode === 'score') {
        qValue = quality / 10;
      } else {
        qValue = Math.max(0.1, 1 - (compressionPercent / 100));
      }

      const initialFiles: CompressedFile[] = activeFiles.map(f => ({
        id: f.id,
        name: f.name,
        originalSize: f.size,
        compressedBlob: null,
        compressedUrl: null,
        savedPercent: '0',
        savedBytes: 0,
        status: 'processing'
      }));
      setCompressedFiles(initialFiles);

      for (const fileItem of activeFiles) {
        try {
          const decryptedBuffer = await decryptData(fileItem.encryptedData, fileItem.iv, sessionKey);
          const blob = new Blob([decryptedBuffer]);
          const url = URL.createObjectURL(blob);

          const img = new Image();
          img.src = url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Image load failed"));
          });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob((cBlob) => {
            if (cBlob) {
              const cUrl = URL.createObjectURL(cBlob);
              const savedB = fileItem.size - cBlob.size;
              const savedP = ((savedB / fileItem.size) * 100).toFixed(1);

              setCompressedFiles(prev => prev.map(cf => 
                cf.id === fileItem.id ? {
                  ...cf,
                  compressedBlob: cBlob,
                  compressedUrl: cUrl,
                  savedPercent: savedP,
                  savedBytes: savedB,
                  status: 'done'
                } : cf
              ));
            }
            URL.revokeObjectURL(url);
          }, 'image/jpeg', qValue);
        } catch (err) {
          console.error("Compression error for file", fileItem.name, err);
          setCompressedFiles(prev => prev.map(cf => cf.id === fileItem.id ? { ...cf, status: 'error' } : cf));
        }
      }
    };

    processFiles();
  }, [files, quality, compressionPercent, mode, sessionKey]);

  // --- SORTING LOGIC ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFiles = useMemo(() => {
    let sortableItems = [...compressedFiles];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof CompressedFile];
        let bValue: any = b[sortConfig.key as keyof CompressedFile];

        // Custom Key Handling
        if (sortConfig.key === 'compressedSize') {
             aValue = a.compressedBlob?.size || 0;
             bValue = b.compressedBlob?.size || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [compressedFiles, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <i className="fas fa-sort text-gray-300 ml-2 opacity-30 group-hover:opacity-100 transition-opacity"></i>;
    
    if (key === 'name') {
        return sortConfig.direction === 'asc' 
            ? <span className="ml-2 text-blue-600 font-black text-[10px] bg-blue-100 px-1 rounded border border-blue-200">A-Z</span> 
            : <span className="ml-2 text-blue-600 font-black text-[10px] bg-blue-100 px-1 rounded border border-blue-200">Z-A</span>;
    }
    
    return sortConfig.direction === 'asc'
        ? <span className="ml-2 text-blue-500">⬆️</span> 
        : <span className="ml-2 text-blue-500">⬇️</span>;
  };


  // --- UPLOAD HANDLERS ---
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = (fileList: File[]) => {
    // Broad acceptance logic
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.eps', '.ico', '.tiff', '.tif', '.bmp', '.xps', '.svg'];
    
    const validFiles = fileList.filter(file => {
        const lowerName = file.name.toLowerCase();
        return file.type.startsWith('image/') || allowedExtensions.some(ext => lowerName.endsWith(ext));
    });

    if (validFiles.length > 0) {
      addFiles(validFiles);
    } else {
      alert("Please select valid image files (JPG, PNG, GIF, WEBP, TIFF, ICO, EPS, etc).");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Google Drive
  const handleGoogleDriveClick = () => {
    if (!tokenClient) return;
    tokenClient.callback = async (response: any) => {
      if (response.error !== undefined) throw response;
      setAccessToken(response.access_token);
      createPicker(response.access_token);
    };
    if (accessToken) createPicker(accessToken);
    else tokenClient.requestAccessToken({ prompt: '' });
  };

  const createPicker = (token: string) => {
    if (!window.google || !window.google.picker) return;
    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    view.setMimeTypes('image/*,application/postscript,application/vnd.ms-xpsdocument'); 
    const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setAppId(GOOGLE_APP_ID)
        .setOAuthToken(token)
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setCallback(pickerCallback)
        .build();
    picker.setVisible(true);
  };

  const pickerCallback = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files: File[] = [];
      for (const doc of data.docs) {
         try {
           const response = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
             headers: { Authorization: `Bearer ${accessToken}` }
           });
           const blob = await response.blob();
           const file = new File([blob], doc.name, { type: blob.type || 'image/jpeg' });
           files.push(file);
         } catch (e) { console.error(e); }
      }
      if (files.length > 0) processSelectedFiles(files);
    }
  };

  // Dropbox
  const handleDropboxClick = () => {
    if (!window.Dropbox) return;
    const options = {
        linkType: "direct", 
        multiselect: true,
        extensions: ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.bmp', '.gif', '.eps', '.ico', '.svg'],
        folderselect: false,
        success: function (files: any[]) {
            const filePromises = files.map(async (f) => {
                let downloadLink = f.link;
                if (downloadLink.includes('?dl=0')) downloadLink = downloadLink.replace('?dl=0', '?raw=1');
                else if (!downloadLink.includes('?raw=1')) downloadLink += (downloadLink.includes('?') ? '&' : '?') + 'raw=1';
                const response = await fetch(downloadLink);
                const blob = await response.blob();
                return new File([blob], f.name, { type: blob.type || 'image/jpeg' });
            });
            Promise.all(filePromises).then(processSelectedFiles);
        }
    };
    window.Dropbox.choose(options);
  };

  // --- MANUAL COMPRESS & ACTIONS ---
  const openManualCompress = async (id: string) => {
    setManualFileId(id);
    setManualQuality(50); 
    setManualModalOpen(true);
    updateManualPreview(id, 50);
  };

  const updateManualPreview = async (id: string, q: number) => {
    if(!sessionKey) return;
    const originalFile = files.find(f => f.id === id);
    if (!originalFile) return;

    try {
        const decryptedBuffer = await decryptData(originalFile.encryptedData, originalFile.iv, sessionKey);
        const blob = new Blob([decryptedBuffer]);
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        
        const qVal = q / 100;

        canvas.toBlob((cBlob) => {
            if (cBlob) {
                if(manualPreviewUrl) URL.revokeObjectURL(manualPreviewUrl);
                const cUrl = URL.createObjectURL(cBlob);
                setManualPreviewUrl(cUrl);
                setManualBlob(cBlob);
            }
            URL.revokeObjectURL(url);
        }, 'image/jpeg', qVal);
    } catch(e) { console.error(e); }
  };

  const handleManualSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      setManualQuality(val);
      if(manualFileId) updateManualPreview(manualFileId, val);
  };

  const downloadManual = () => {
      if(manualBlob && manualFileId) {
          const original = files.find(f => f.id === manualFileId);
          if(original) window.saveAs(manualBlob, `manual-compress-${original.name}`);
      }
  };
  
  const saveManualToList = () => {
       if(manualBlob && manualFileId && manualPreviewUrl) {
          const original = files.find(f => f.id === manualFileId);
          if(original) {
              const savedB = original.size - manualBlob.size;
              const savedP = ((savedB / original.size) * 100).toFixed(1);
              setCompressedFiles(prev => prev.map(cf => 
                cf.id === manualFileId ? {
                  ...cf,
                  compressedBlob: manualBlob,
                  compressedUrl: manualPreviewUrl,
                  savedPercent: savedP,
                  savedBytes: savedB,
                  status: 'done'
                } : cf
              ));
              setManualModalOpen(false);
          }
       }
  };

  const handleDeleteOne = (id: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
        deletedIds.current.add(id);
        setCompressedFiles(prev => {
            const target = prev.find(p => p.id === id);
            if(target && target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
            return prev.filter(p => p.id !== id);
        });
    }
  };

  const downloadAll = async () => {
    if (!window.JSZip || !window.saveAs) return;
    const zip = new window.JSZip();
    compressedFiles.forEach(f => {
      if (f.compressedBlob) zip.file(`min-${f.name}`, f.compressedBlob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    window.saveAs(content, "compressed_garden.zip");
  };

  const handleClear = () => {
    if (confirm("Delete all images?")) {
      resetApp();
      navigate('/');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: CompressImageConfig</div>
      <style>{`
        .tech-font { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        input[type="range"].rgb-slider {
          -webkit-appearance: none; height: 12px; border-radius: 10px;
          background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
          background-size: 400% 400%; animation: rainbow 5s ease infinite;
          outline: none; box-shadow: 0 0 15px rgba(0, 242, 254, 0.3); cursor: pointer;
        }
        input[type="range"].rgb-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%;
          background: #ffffff; border: 3px solid #000; box-shadow: 0 0 15px rgba(255, 255, 255, 1);
          transition: transform 0.2s;
        }
        input[type="range"].rgb-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .checkerboard {
            background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .dark .checkerboard {
            background-image: linear-gradient(45deg, #2d3748 25%, transparent 25%), 
                              linear-gradient(-45deg, #2d3748 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #2d3748 75%), 
                              linear-gradient(-45deg, transparent 75%, #2d3748 75%);
        }
      `}</style>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleLocalFileSelect}
        className="hidden"
        multiple
        accept="image/*, .jpg, .jpeg, .png, .webp, .gif, .bmp, .tiff, .tif, .ico, .eps, .xps, .svg"
      />

      <div className="text-center mb-6">
        <h1 className="text-4xl font-black garden-text text-gray-800 dark:text-white uppercase tracking-tighter">
          ⚡ Bulk Compressor Pro
        </h1>
        <p className="text-gray-500 font-bold italic">Garden-Native Batch Processing</p>
      </div>

      {/* --- INTEGRATED UPLOAD SECTION --- */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button 
                onClick={handleGoogleDriveClick}
                disabled={!pickerInited || !gisInited}
                className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition transform hover:scale-105 text-sm md:text-base ${(!pickerInited || !gisInited) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <i className="fab fa-google-drive text-lg"></i> Google Drive
            </button>
            
            <button 
                onClick={handleDropboxClick}
                className="flex items-center gap-2 bg-[#0061FF] hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition transform hover:scale-105 text-sm md:text-base"
            >
                <i className="fab fa-dropbox text-lg"></i> Dropbox
            </button>
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-[#c53597] hover:bg-[#a31a78] text-white px-5 py-3 rounded-xl font-bold shadow-lg transition transform hover:scale-105 text-sm md:text-base"
            >
                <i className="fas fa-folder-open text-lg"></i> My Device
            </button>
        </div>

        <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-4 border-dashed border-white/50 bg-[#c53597] hover:bg-[#a31a78] rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 group shadow-xl max-w-3xl mx-auto"
        >
            <div className="mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-cloud-upload-alt text-5xl"></i>
            </div>
            <p className="text-white font-bold text-lg">
                Please Note: Only Image Files Are Accepted Here
            </p>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 mb-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* COMPRESSION SETTINGS */}
        <div className="flex-1 w-full space-y-6">
          <div className="flex items-center gap-4 mb-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Mode:</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button 
                      onClick={() => setMode('score')}
                      className={`px-4 py-1 text-xs font-bold rounded-md transition ${mode === 'score' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                      Score (1-10)
                  </button>
                  <button 
                      onClick={() => setMode('percent')}
                      className={`px-4 py-1 text-xs font-bold rounded-md transition ${mode === 'percent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                      Percentage (%)
                  </button>
              </div>
          </div>

          <div className={`transition-opacity duration-300 ${mode === 'score' ? 'opacity-100' : 'opacity-30 pointer-events-none hidden'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">Compress (Score): <span className="text-blue-500 text-xl">{quality}</span></span>
                <span className="text-[10px] font-bold text-gray-400 italic">1 (Low) - 10 (High Quality)</span>
            </div>
            <input 
                type="range" 
                min="1" max="10" step="1" 
                value={quality} 
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full rgb-slider"
            />
          </div>

          <div className={`transition-opacity duration-300 ${mode === 'percent' ? 'opacity-100' : 'opacity-30 pointer-events-none hidden'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">Compress Level: <span className="text-blue-500 text-xl">{compressionPercent}%</span></span>
                <span className="text-[10px] font-bold text-gray-400 italic">Higher % = Smaller Size</span>
            </div>
            <input 
                type="range" 
                min="0" max="95" step="5" 
                value={compressionPercent} 
                onChange={(e) => setCompressionPercent(parseInt(e.target.value))}
                className="w-full rgb-slider"
            />
          </div>
        </div>

        {/* GLOBAL ACTIONS (Removed Add Images button) */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
          <button onClick={() => setIsGalleryOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2 transform active:scale-95">
            <i className="fas fa-th"></i> Preview All
          </button>
          <button onClick={downloadAll} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center gap-2 transform active:scale-95">
            <i className="fas fa-file-archive"></i> Download ZIP
          </button>
          <button onClick={handleClear} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition flex items-center gap-2 transform active:scale-95">
            <i className="fas fa-trash-alt"></i> Delete All
          </button>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th 
                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition group select-none"
                    onClick={() => handleSort('name')}
                >
                    File Name {getSortIcon('name')}
                </th>
                <th 
                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition group select-none"
                    onClick={() => handleSort('originalSize')}
                >
                    Original {getSortIcon('originalSize')}
                </th>
                <th 
                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition group select-none"
                    onClick={() => handleSort('compressedSize')}
                >
                    Now {getSortIcon('compressedSize')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Saved</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedFiles.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{f.name}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-700 dark:text-gray-300 tech-font">{formatFileSize(f.originalSize)}</td>
                  <td className="px-6 py-4 text-sm font-black text-blue-500 tech-font">
                    {f.status === 'processing' ? <i className="fas fa-sync fa-spin"></i> : formatFileSize(f.compressedBlob?.size || 0)}
                  </td>
                  <td className="px-6 py-4 tech-font">
                    {f.status === 'done' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap ${parseFloat(f.savedPercent) >= 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {f.savedPercent}% {parseFloat(f.savedPercent) >= 0 ? '⬇️' : '⬆️'} / {formatFileSize(Math.abs(f.savedBytes))}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openManualCompress(f.id)} className="h-8 w-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center hover:bg-purple-500 hover:text-white transition shadow-sm" title="Manual Compress"><i className="fas fa-sliders-h"></i></button>
                      <button onClick={() => setPreviewImg(f.compressedUrl)} className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition shadow-sm" title="Preview"><i className="fas fa-eye"></i></button>
                      <a href={f.compressedUrl || '#'} download={`min-${f.name}`} className="h-8 w-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition shadow-sm" title="Download"><i className="fas fa-download"></i></a>
                      <button onClick={() => handleDeleteOne(f.id)} className="h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-sm" title="Delete"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE CARD VIEW (Actions Below Name) --- */}
      <div className="md:hidden space-y-4">
        {sortedFiles.map((f) => (
            <div key={f.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
                {/* Top: Name */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-800 dark:text-white truncate pr-2 tech-font text-lg">{f.name}</h3>
                    {f.status === 'processing' && <i className="fas fa-sync fa-spin text-blue-500"></i>}
                </div>
                
                {/* Middle: Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-gray-400 uppercase font-black">Original</div>
                        <div className="font-bold text-gray-700 dark:text-gray-200">{formatFileSize(f.originalSize)}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-blue-400 uppercase font-black">Now</div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                            {f.status === 'done' ? formatFileSize(f.compressedBlob?.size || 0) : '...'}
                        </div>
                    </div>
                </div>
                
                {/* Saved Badge */}
                {f.status === 'done' && (
                    <div className={`text-center text-xs font-black py-1 rounded-md mb-4 ${parseFloat(f.savedPercent) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Saved: {f.savedPercent}% ({formatFileSize(Math.abs(f.savedBytes))})
                    </div>
                )}

                {/* Bottom: Actions (Below content) */}
                <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => openManualCompress(f.id)} className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg font-bold text-xs hover:bg-purple-100 transition">
                        <i className="fas fa-sliders-h mr-1"></i> Tune
                    </button>
                    <button onClick={() => setPreviewImg(f.compressedUrl)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition">
                        <i className="fas fa-eye mr-1"></i> View
                    </button>
                    <a href={f.compressedUrl || '#'} download={`min-${f.name}`} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-bold text-xs hover:bg-green-100 transition text-center flex items-center justify-center">
                        <i className="fas fa-download mr-1"></i> Save
                    </a>
                    <button onClick={() => handleDeleteOne(f.id)} className="w-10 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Manual Compress Modal */}
      {manualModalOpen && (
          <div className="fixed inset-0 z-[600] bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                  <button onClick={() => setManualModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><i className="fas fa-times text-2xl"></i></button>
                  
                  <h3 className="text-xl font-black garden-text text-gray-800 dark:text-white mb-6 uppercase">Manual Tuning</h3>
                  
                  <div className="checkerboard rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-gray-200 h-64 bg-gray-50">
                      {manualPreviewUrl ? (
                          <img src={manualPreviewUrl} className="max-h-full max-w-full object-contain" alt="Preview" />
                      ) : (
                          <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                      )}
                  </div>
                  
                  <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase text-gray-500">Quality Level: <span className="text-blue-500">{manualQuality}%</span></span>
                        {manualBlob && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">New Size: {formatFileSize(manualBlob.size)}</span>}
                      </div>
                      <input 
                        type="range" min="1" max="100" step="1"
                        value={manualQuality}
                        onChange={handleManualSliderChange}
                        className="w-full rgb-slider"
                      />
                  </div>

                  <div className="flex gap-3">
                      <button onClick={downloadManual} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition">
                          <i className="fas fa-download mr-2"></i> Download
                      </button>
                      <button onClick={saveManualToList} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
                          <i className="fas fa-save mr-2"></i> Save to List
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[500] bg-gray-900/98 overflow-y-auto p-4 animate-fade-in flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 bg-gray-900/90 backdrop-blur-md z-10 rounded-t-2xl">
            <h2 className="text-2xl font-black text-white garden-text uppercase"><i className="fas fa-images mr-3"></i> Gallery View</h2>
            <div className="hidden md:flex items-center gap-2 bg-gray-800 p-1 rounded-xl">
              <span className="text-[10px] font-black text-gray-500 uppercase px-2">Grid:</span>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button key={num} onClick={() => setGridCols(num)} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${gridCols === num ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                  {num}x
                </button>
              ))}
            </div>
            <button onClick={() => setIsGalleryOpen(false)} className="text-white hover:text-red-500 transition text-4xl leading-none">&times;</button>
          </div>
          
          <div className="flex-1 py-8 px-4">
            <div 
              className="grid gap-4 sm:gap-6"
              style={{ gridTemplateColumns: `repeat(${window.innerWidth < 768 ? 1 : gridCols}, minmax(0, 1fr))` }}
            >
              {compressedFiles.map(f => (
                <div key={f.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-3 flex flex-col group overflow-hidden shadow-xl hover:border-blue-500/50 transition h-fit">
                  <div className="checkerboard rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-gray-700 min-h-[150px] sm:min-h-[250px]">
                    <img 
                        src={f.compressedUrl || ''} 
                        alt={f.name} 
                        className="max-h-[500px] w-auto object-contain transition duration-300" 
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-black text-gray-300 truncate flex-1 uppercase tracking-tighter tech-font">{f.name}</span>
                    <div className="flex gap-2">
                        <a href={f.compressedUrl || ''} download={`min-${f.name}`} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 h-8 px-3 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition flex items-center">Download</a>
                        <button onClick={() => handleDeleteOne(f.id)} className="bg-red-600/20 text-red-400 border border-red-600/30 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Single Preview Modal */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in">
          <div className="checkerboard rounded-lg p-1">
            <img src={previewImg} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-2 border-blue-500/30 object-contain" alt="Preview" />
          </div>
          <button className="absolute top-6 right-6 text-white text-5xl">&times;</button>
        </div>
      )}
    </div>
  );
};

export default CompressImageConfig;
