
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// --- DATA DEFINITIONS ---

interface ToolItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  link?: string;
  active?: boolean;
}

// ==========================================
// 1. PDF TOOLS CONFIGURATION
// ==========================================

const PDF_GROUPS: ToolItem[] = [
  { id: 'organize', name: 'Organize PDF', icon: 'fa-sort-amount-down', desc: 'Merge, split, scan, and organize pages.' },
  { id: 'optimize', name: 'Optimize PDF', icon: 'fa-compress-arrows-alt', desc: 'Compress, repair, and OCR documents.' },
  { id: 'convert', name: 'Convert PDF', icon: 'fa-exchange-alt', desc: 'Convert PDF to JPG, PNG, and other formats.' },
  { id: 'edit', name: 'Edit PDF', icon: 'fa-edit', desc: 'Edit text, watermark, rotate, and crop.' },
  { id: 'security', name: 'PDF Security', icon: 'fa-shield-alt', desc: 'Sign, compare, and redact PDFs.' },
  { id: 'all-pdf', name: 'All Tools', icon: 'fa-layer-group', desc: 'View all PDF tools in one place.' },
];

const PDF_SUB_TOOLS: Record<string, ToolItem[]> = {
  'organize': [
     { id: 'merge-pdf', name: 'Merge PDF', icon: 'fa-object-group', desc: 'Combine multiple PDFs into one file.', active: true, link: '/upload' },
     { id: 'split-pdf', name: 'Split PDF', icon: 'fa-cut', desc: 'Separate one PDF into multiple files.', active: false },
     { id: 'organize-pdf-tool', name: 'Organize PDF', icon: 'fa-sort', desc: 'Sort, reorder, and delete pages.', active: false },
     { id: 'scan-pdf', name: 'Scan to PDF', icon: 'fa-camera', desc: 'Capture paper documents to PDF.', active: false },
     { id: 'create-pdf', name: 'Create PDF Files', icon: 'fa-plus-square', desc: 'Build new PDF documents from scratch.', active: false },
  ],
  'optimize': [
     { id: 'compress-pdf', name: 'Compress PDF', icon: 'fa-compress', link: '/upload', active: true, desc: 'Reduce file size efficiently.' },
     { id: 'repair-pdf', name: 'Repair PDF', icon: 'fa-tools', desc: 'Recover data from corrupted files.', active: false },
     { id: 'ocr-pdf', name: 'OCR PDF', icon: 'fa-eye', desc: 'Make scanned text searchable.', active: false },
     { id: 'pdf-summarizer', name: 'PDF Summarizer', icon: 'fa-robot', desc: 'AI-powered summary of your document.', active: false },
     { id: 'grayscale-pdf', name: 'Grayscale PDF', icon: 'fa-adjust', desc: 'Convert colored PDFs to black and white.', active: false },
  ],
  'convert': [
     { id: 'pdf-to-jpg', name: 'PDF To JPG', icon: 'fa-image', link: '/upload', active: true, desc: 'Convert PDF pages to JPG images.' },
     { id: 'pdf-to-png', name: 'PDF To PNG', icon: 'fa-image', link: '/upload', active: true, desc: 'Convert PDF pages to PNG images.' },
     { id: 'pdf-to-jpeg', name: 'PDF To JPEG', icon: 'fa-image', link: '/upload', active: true, desc: 'Convert PDF pages to JPEG images.' },
     { id: 'pdf-to-webp', name: 'PDF To WEBP', icon: 'fa-file-image', link: '/upload', active: true, desc: 'Convert PDF to WebP format.' },
     { id: 'pdf-to-xps', name: 'PDF To XPS', icon: 'fa-file-code', link: '/upload', active: true, desc: 'Convert PDF to Microsoft XPS.' },
     { id: 'pdf-to-eps', name: 'PDF To EPS', icon: 'fa-bezier-curve', link: '/upload', active: true, desc: 'Convert PDF to EPS vector.' },
     { id: 'pdf-to-ico', name: 'PDF To ICO', icon: 'fa-icons', link: '/upload', active: true, desc: 'Create icons from PDF pages.' },
     { id: 'pdf-to-tiff', name: 'PDF To TIFF', icon: 'fa-photo-video', link: '/upload', active: true, desc: 'Convert to high-quality TIFF.' },
     { id: 'pdf-to-html', name: 'PDF To HTML', icon: 'fa-code', link: '/upload', active: true, desc: 'Convert PDF to HTML5 web page.' },
     { id: 'pdf-to-pdfa', name: 'PDF To PDF/A', icon: 'fa-archive', link: '/upload', active: true, desc: 'Convert to ISO-standard PDF/A.' },
     { id: 'translate-pdf', name: 'Translate PDF', icon: 'fa-language', desc: 'Translate your PDF into multiple languages.', active: false },
  ],
  'edit': [
     { id: 'edit-pdf-tool', name: 'Edit PDF', icon: 'fa-pen', desc: 'Add text, shapes, and images.', active: false },
     { id: 'watermark-add', name: 'WaterMark ADD', icon: 'fa-stamp', desc: 'Stamp text or image watermarks.', active: false },
     { id: 'rotate-pdf', name: 'Rotate PDF', icon: 'fa-sync-alt', desc: 'Rotate pages 90, 180, or 270 degrees.', active: false },
     { id: 'page-number-add', name: 'Page Number ADD', icon: 'fa-list-ol', desc: 'Add page numbers to your document.', active: false },
     { id: 'crop-pdf', name: 'Crop PDF', icon: 'fa-crop-alt', desc: 'Trim margins and crop pages.', active: false },
  ],
  'security': [
      { id: 'lock-pdf', name: 'Lock PDF', icon: 'fa-lock', desc: 'Password protect your documents.', active: true, link: '/upload' },
      { id: 'sign-pdf', name: 'Sign PDF', icon: 'fa-file-signature', desc: 'Add your digital signature.', active: false },
      { id: 'compare-pdf', name: 'Compare PDF', icon: 'fa-not-equal', desc: 'Compare two PDF files side-by-side.', active: false },
      { id: 'redact-pdf', name: 'Redact PDF', icon: 'fa-user-secret', desc: 'Permanently remove sensitive info.', active: false },
  ]
};

// ==========================================
// 2. IMAGE TOOLS CONFIGURATION
// ==========================================

const IMAGE_GROUPS: ToolItem[] = [
  { id: 'optimize-image', name: 'Optimize Image', icon: 'fa-compress', desc: 'Compress, upscale, and remove backgrounds.' },
  { id: 'create-image', name: 'Create Image', icon: 'fa-paint-brush', desc: 'Design photos and generate memes.' },
  { id: 'edit-image', name: 'Edit Image', icon: 'fa-crop-alt', desc: 'Resize, crop, and rotate images.' },
  { id: 'convert-image', name: 'Convert Image', icon: 'fa-exchange-alt', desc: 'Convert between various image formats.' },
  { id: 'secured-image', name: 'Secured Image', icon: 'fa-lock', desc: 'Watermark, blur faces, and sign images.' },
  { id: 'all-image', name: 'All Tools', icon: 'fa-layer-group', desc: 'View all Image tools in one place.' },
];

const IMAGE_SUB_TOOLS: Record<string, ToolItem[]> = {
  'optimize-image': [
      { id: 'compress-image', name: 'Compress Image', icon: 'fa-compress', desc: 'Reduce image file size efficiently.', active: true, link: '/upload' },
      { id: 'upscale-image', name: 'Upscale Image', icon: 'fa-expand-arrows-alt', desc: 'Increase image resolution.', active: false },
      { id: 'remove-bg', name: 'Remove Background', icon: 'fa-eraser', desc: 'Automatically clear backgrounds.', active: false },
      { id: 'translate-image-text', name: 'Translate Page Text', icon: 'fa-language', desc: 'Extract and translate text from images.', active: false },
      { id: 'grayscale-image', name: 'Grayscale Image', icon: 'fa-tint-slash', desc: 'Convert your photos to black and white.', active: false },
      { id: 'image-summarizer', name: 'Image Summarizer', icon: 'fa-brain', desc: 'AI description and summary of images.', active: false },
  ],
  'create-image': [
      { id: 'photo-editor', name: 'Photo Editor', icon: 'fa-magic', desc: 'Enhance and adjust photos.', active: false },
      { id: 'meme-generator', name: 'Meme Generator', icon: 'fa-grin-squint', desc: 'Create viral memes.', active: false },
  ],
  'edit-image': [
      { id: 'resize-image', name: 'Resize Image', icon: 'fa-expand', desc: 'Change dimensions of images.', active: false },
      { id: 'crop-image', name: 'Crop Image', icon: 'fa-crop', desc: 'Cut out specific areas.', active: false },
      { id: 'rotate-image', name: 'Rotate Image', icon: 'fa-sync', desc: 'Rotate and flip images.', active: false },
      { id: 'object-remover', name: 'Object Remover', icon: 'fa-magic', desc: 'Remove unwanted objects from photos.', active: false },
      { id: 'grayscale-to-color', name: 'Grayscale To Colour', icon: 'fa-palette', desc: 'AI-powered colorization for old photos.', active: false },
  ],
  'convert-image': [
      { id: 'convert-jpg', name: 'Convert To JPG', icon: 'fa-file-image', link: '/upload', active: true, desc: 'Save as JPEG format.' },
      { id: 'convert-png', name: 'Convert To PNG', icon: 'fa-file-image', link: '/upload', active: true, desc: 'Save as PNG format.' },
      { id: 'convert-webp', name: 'Convert To WEBP', icon: 'fa-file-code', link: '/upload', active: true, desc: 'Save as WebP format.' },
      { id: 'convert-eps', name: 'Convert To EPS', icon: 'fa-bezier-curve', link: '/upload', active: true, desc: 'Save as EPS vector.' },
      { id: 'convert-xps', name: 'Convert To XPS', icon: 'fa-print', link: '/upload', active: true, desc: 'Save as XPS document.' },
      { id: 'convert-jpeg', name: 'Convert To JPEG', icon: 'fa-image', link: '/upload', active: true, desc: 'Save as JPEG format.' },
      { id: 'convert-tiff', name: 'Convert To TIFF', icon: 'fa-photo-video', link: '/upload', active: true, desc: 'Save as TIFF format.' },
      { id: 'convert-ico', name: 'Convert To ICO', icon: 'fa-icons', link: '/upload', active: true, desc: 'Create favicons/icons.' },
  ],
  'secured-image': [
      { id: 'watermark-image', name: 'WaterMark ADD', icon: 'fa-stamp', desc: 'Add ownership text/logos.', active: false },
      { id: 'blur-face', name: 'Blur Face', icon: 'fa-user-secret', desc: 'Anonymize faces in photos.', active: false },
      { id: 'sign-image', name: 'Sign Image', icon: 'fa-signature', desc: 'Digitally sign images.', active: false },
  ]
};

// Flatten all tools for search
const ALL_TOOLS_FLATTENED: ToolItem[] = [
    ...Object.values(PDF_SUB_TOOLS).flat(),
    ...Object.values(IMAGE_SUB_TOOLS).flat(),
];

const Tools: React.FC = () => {
  const { category, subCategory } = useParams<{ category: string; subCategory?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const [gridCols, setGridCols] = useState(2);
  const [isGridDropdownOpen, setIsGridDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 1024) setGridCols(4);
        else if (window.innerWidth >= 768) setGridCols(3);
        else setGridCols(2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsGridDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let displayedTools: ToolItem[] = [];
  let pageTitle = "";
  let pageDesc = "";
  let colorClass = "text-gray-800 dark:text-white";
  let isGroupView = false;

  if (category === 'pdf') {
      colorClass = "text-red-600";
      if (subCategory === 'all-pdf') {
          displayedTools = Object.values(PDF_SUB_TOOLS).flat();
          pageTitle = "All PDF Tools";
          pageDesc = "Browse our complete collection of PDF tools.";
      } else if (subCategory && PDF_SUB_TOOLS[subCategory]) {
          displayedTools = PDF_SUB_TOOLS[subCategory];
          const groupName = PDF_GROUPS.find(g => g.id === subCategory)?.name || subCategory;
          pageTitle = groupName;
          pageDesc = `Select a specific tool from the ${groupName} collection.`;
      } else {
          displayedTools = PDF_GROUPS;
          pageTitle = "PDF Tools";
          pageDesc = "Categorized tools to manage your PDF documents efficiently.";
          isGroupView = true;
      }
  } else if (category === 'image') {
      colorClass = "text-blue-600";
      if (subCategory === 'all-image') {
          displayedTools = Object.values(IMAGE_SUB_TOOLS).flat();
          pageTitle = "All Image Tools";
          pageDesc = "Browse our complete collection of Image tools.";
      } else if (subCategory && IMAGE_SUB_TOOLS[subCategory]) {
          displayedTools = IMAGE_SUB_TOOLS[subCategory];
          const groupName = IMAGE_GROUPS.find(g => g.id === subCategory)?.name || subCategory;
          pageTitle = groupName;
          pageDesc = `Select a specific tool from the ${groupName} collection.`;
      } else {
          displayedTools = IMAGE_GROUPS;
          pageTitle = "Image Tools";
          pageDesc = "Everything you need to create, edit, and convert images.";
          isGroupView = true;
      }
  } else {
      pageTitle = "All Garden Tools";
      pageDesc = "Explore our complete collection of PDF and Image utilities.";
      if (searchTerm.trim()) {
           displayedTools = ALL_TOOLS_FLATTENED.filter(tool => 
               tool.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
           );
      } else {
           displayedTools = ALL_TOOLS_FLATTENED;
      }
  }

  const handleToolClick = (tool: ToolItem) => {
      const isPDFGroup = PDF_GROUPS.some(g => g.id === tool.id);
      const isImageGroup = IMAGE_GROUPS.some(g => g.id === tool.id);
      if (isGroupView && (isPDFGroup || isImageGroup)) {
          if (isPDFGroup) navigate(`/tools/pdf/${tool.id}`);
          else navigate(`/tools/image/${tool.id}`);
      } else if (tool.active && tool.link) {
          navigate(tool.link, { state: { fromCategory: category, activeTool: tool } });
      }
  };

  const handleGridChange = (num: number) => {
    if (num > 4 && window.innerWidth < 1024) {
        alert("aee option ta use korar jonno desktop mood on korun");
        return;
    }
    setGridCols(num);
    setIsGridDropdownOpen(false);
  };

  const showSearch = category === 'all' || category === undefined;

  return (
    <div className="w-full mx-auto py-4 px-2 min-h-[70vh]">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Tools</div>
      <style>{`
        @keyframes rainbow { 
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
        }
        .rgb-animate {
            background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3);
            background-size: 1800% 1800%;
            animation: rainbow 6s ease infinite;
        }
      `}</style>

      <div className="text-center mb-6">
         <h1 className={`text-3xl md:text-5xl font-bold mb-3 garden-text ${colorClass}`}>
            {pageTitle}
         </h1>
         <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            {pageDesc}
         </p>
         {showSearch && (
             <div className="max-w-2xl mx-auto relative animate-fade-in-down mb-4">
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder={t('tools.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition text-base shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white dark:border-gray-600"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                        <i className="fas fa-search"></i>
                    </div>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500">
                            <i className="fas fa-times-circle"></i>
                        </button>
                    )}
                 </div>
             </div>
         )}
         {!searchTerm.trim() && (
             <div className="flex justify-center sm:justify-end w-full mx-auto px-2">
                <div className="relative z-50" ref={dropdownRef}>
                    <button onClick={() => setIsGridDropdownOpen(!isGridDropdownOpen)} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl font-bold shadow-md transition transform hover:scale-105">
                        <i className="fas fa-th"></i> {t('tools.grid')} *{gridCols} <i className={`fas fa-chevron-down ml-1 transition-transform ${isGridDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                     {isGridDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-down">
                            {[3, 4, 5, 6].map(num => (
                                <button key={num} onClick={() => handleGridChange(num)} className={`w-full text-left px-4 py-3 text-sm font-bold flex justify-between items-center hover:bg-pink-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 ${gridCols === num ? 'text-pink-600 bg-pink-50 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200'}`}>
                                    <span>{t('tools.grid')} *{num}</span>
                                    {gridCols === num && <i className="fas fa-check"></i>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
             </div>
         )}
      </div>

      {displayedTools.length > 0 ? (
          <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
            {displayedTools.map((tool) => {
                const isPDFGroup = PDF_GROUPS.some(g => g.id === tool.id);
                const isImageGroup = IMAGE_GROUPS.some(g => g.id === tool.id);
                const isFolder = isGroupView && (isPDFGroup || isImageGroup);
                const isActive = isFolder || tool.active;
                let themeColorText = (category === 'pdf' || isPDFGroup || tool.id.includes('pdf')) ? 'text-red-600' : (category === 'image' || isImageGroup || tool.id.includes('image')) ? 'text-blue-600' : 'text-purple-600';
                return (
                    <div key={tool.id} onClick={() => handleToolClick(tool)} className={`group relative p-[2px] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 aspect-square cursor-pointer overflow-hidden ${isActive ? '' : 'opacity-70 grayscale-[0.8] hover:grayscale-0'}`}>
                        <div className={`absolute inset-0 rgb-animate ${isActive ? 'opacity-100' : 'opacity-40'}`}></div>
                        <div className="relative h-full w-full bg-white dark:bg-gray-800 rounded-[calc(0.75rem-2px)] overflow-hidden flex flex-col justify-center items-center z-10 text-center p-4">
                            <i className={`fas ${tool.icon} text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4 ${themeColorText} group-hover:scale-110 transition-transform block`}></i>
                            <h3 className="text-sm sm:text-lg md:text-2xl font-black text-gray-800 dark:text-white font-sans leading-tight break-words w-full px-1">{tool.name}</h3>
                             {!isActive && <div className="absolute top-0 right-0 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-bl-lg z-20">{t('tools.soon')}</div>}
                        </div>
                    </div>
                );
            })}
          </div>
      ) : (
          <div className="text-center py-20 animate-fade-in-up">
              <div className="h-24 w-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
                  <i className="fas fa-search-minus"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('tools.no_result')}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">You might have typed incorrectly.</p>
              <p className="text-md text-gray-500 dark:text-gray-400 mb-8">You can manually select your required tool from the list below by clearing the search.</p>
              <button onClick={() => setSearchTerm('')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">{t('tools.clear')}</button>
          </div>
      )}
    </div>
  );
};

export default Tools;
