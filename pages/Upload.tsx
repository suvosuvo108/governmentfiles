
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';

// Configuration from provided vanilla code
const GOOGLE_CLIENT_ID = '705204588232-3m2bivi6c0nd41lgpe7j34abim8s0gta.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAs1-yX51Kd5aKl-mB1oHhKXhOwCUDcPUY';
const GOOGLE_APP_ID = '705204588232';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addFiles } = useFileContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detect Active Tool Type
  const activeTool = location.state?.activeTool;
  const isImageTool = (activeTool?.id?.startsWith('convert-') || activeTool?.id === 'compress-image') && activeTool?.id !== 'convert-pdf';
  // Common Image Extensions
  const imageAccept = "image/png, image/jpeg, image/jpg, image/webp, image/tiff, image/bmp";
  const acceptedType = isImageTool ? imageAccept : "application/pdf";
  
  // Google Auth State
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);

  useEffect(() => {
    // 1. Ensure Dropbox Script is Loaded
    if (!window.Dropbox) {
      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.setAttribute('data-app-key', '3l7z1yycs84fbvu');
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }

    // 2. Load Google API
    const loadGoogleScripts = () => {
      if (window.gapi) {
        window.gapi.load('client:picker', async () => {
          try {
            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
            setPickerInited(true);
          } catch (e) {
            console.error("Error loading GAPI client", e);
          }
        });
      }
      
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined at request time
        });
        setTokenClient(client);
        setGisInited(true);
      }
    };

    // Check if scripts are loaded, if not wait a bit
    const checkScripts = setInterval(() => {
      if (window.gapi && window.google) {
        loadGoogleScripts();
        clearInterval(checkScripts);
      }
    }, 500);

    return () => clearInterval(checkScripts);
  }, []);

  // --- Handlers ---

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = (fileList: File[]) => {
    let validFiles: File[] = [];

    if (isImageTool) {
        // Accept images
        validFiles = fileList.filter(file => file.type.startsWith('image/'));
    } else {
        // Accept PDF
        validFiles = fileList.filter(file => 
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );
    }

    if (validFiles.length > 0) {
      addFiles(validFiles).then(() => {
          // Pass the existing state (containing activeTool) to the next page
          if (activeTool?.id === 'lock-pdf') {
              navigate('/lock-config', { state: location.state });
          } else if (activeTool?.id === 'compress-image') {
              navigate('/compress-image', { state: location.state });
          } else if (activeTool?.id === 'merge-pdf') {
              navigate('/merge-config', { state: location.state });
          } else if (activeTool?.id === 'compress-pdf') {
              navigate('/compress-pdf', { state: location.state });
          } else {
              navigate('/processing', { state: location.state });
          }
      });
    } else {
      alert(isImageTool ? "Please select Image files." : "Please select PDF files only.");
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

  // --- Google Drive Logic ---
  const handleGoogleDriveClick = () => {
    if (!tokenClient) return;

    tokenClient.callback = async (response: any) => {
      if (response.error !== undefined) throw response;
      setAccessToken(response.access_token);
      createPicker(response.access_token);
    };

    if (accessToken) {
      createPicker(accessToken);
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  const createPicker = (token: string) => {
    if (!window.google || !window.google.picker) return;

    const viewId = isImageTool ? window.google.picker.ViewId.PHOTOS : window.google.picker.ViewId.DOCS;
    const mimeTypes = isImageTool ? 'image/png,image/jpeg,image/jpg,image/webp' : 'application/pdf';

    const view = new window.google.picker.View(viewId);
    view.setMimeTypes(mimeTypes);
    
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
           
           // Use mime type from drive or fallback based on mode
           const type = isImageTool ? (blob.type || 'image/jpeg') : 'application/pdf';
           
           const file = new File([blob], doc.name, { type });
           files.push(file);
         } catch (e) {
           console.error("Error fetching file from Drive", e);
         }
      }
      if (files.length > 0) {
        processSelectedFiles(files);
      }
    }
  };

  // --- Dropbox Logic ---
  const handleDropboxClick = () => {
    if (!window.Dropbox) {
        alert("Dropbox SDK is loading. Please try again in a moment.");
        // Try to reload script if missing
        const script = document.createElement('script');
        script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
        script.id = 'dropboxjs';
        script.setAttribute('data-app-key', '3l7z1yycs84fbvu');
        script.type = 'text/javascript';
        document.body.appendChild(script);
        return;
    }
    
    const extensions = isImageTool ? ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'] : ['.pdf'];

    const options = {
        linkType: "direct", 
        multiselect: true,
        extensions: extensions,
        folderselect: false,
        success: function (files: any[]) {
            const filePromises = files.map(async (f) => {
                try {
                    let downloadLink = f.link;
                    if (downloadLink.includes('?dl=0')) {
                        downloadLink = downloadLink.replace('?dl=0', '?raw=1');
                    } else if (!downloadLink.includes('?raw=1')) {
                         downloadLink += (downloadLink.includes('?') ? '&' : '?') + 'raw=1';
                    }

                    const response = await fetch(downloadLink);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    
                    const type = isImageTool ? (blob.type || 'image/jpeg') : 'application/pdf';

                    return new File([blob], f.name, { type });
                } catch (err) {
                    console.error("Error downloading file from Dropbox:", err);
                    return null;
                }
            });
            
            Promise.all(filePromises).then((loadedFiles) => {
                const validFiles = loadedFiles.filter((f): f is File => f !== null);
                if (validFiles.length > 0) {
                    processSelectedFiles(validFiles);
                } else {
                    alert("Failed to download selected files from Dropbox.");
                }
            });
        },
        cancel: function () {
            // User cancelled, do nothing
        }
    };

    window.Dropbox.choose(options);
  };


  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Upload</div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-3 garden-text">
            {isImageTool ? "Upload Images to Advance Compress" : "Upload Your Files To The Garden"}
        </h2>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-10">
        <button 
          onClick={handleGoogleDriveClick}
          disabled={!pickerInited || !gisInited}
          className={`flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105 ${(!pickerInited || !gisInited) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fab fa-google-drive text-xl"></i> Google Drive
        </button>
        
        <button 
          onClick={handleDropboxClick}
          className="flex items-center gap-3 bg-[#0061FF] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105"
        >
          <i className="fab fa-dropbox text-xl"></i> Dropbox
        </button>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 bg-[#c53597] hover:bg-[#a31a78] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105"
        >
          <i className="fas fa-folder-open text-xl"></i> My Device
        </button>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-4 border-dashed border-white/50 bg-[#c53597] hover:bg-[#a31a78] rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 group shadow-xl"
      >
        <div className="mb-6 text-white group-hover:scale-110 transition-transform duration-300">
           <i className="fas fa-cloud-upload-alt text-7xl text-white"></i>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 garden-text">
            {isImageTool ? "Drag & Drop Your Images Here" : "Drag & Drop Your PDF Files Here"}
        </h3>
        <p className="text-white font-bold opacity-100">
            {isImageTool ? "Please Note: Only Image Files Are Accepted Here" : "Only PDF files are accepted"}
        </p>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleLocalFileSelect}
        accept={acceptedType}
        multiple
        className="hidden"
      />
    </div>
  );
};

export default Upload;
