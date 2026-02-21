
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetApp } = useFileContext();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isHome = location.pathname === '/';

  // Language Dropdown State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
            setIsLangOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBackToGarden = (e: React.MouseEvent) => {
    e.preventDefault();
    // Instant reset and navigation without confirmation
    resetApp(); 
    navigate('/');
  };

  const handleBackToPrevious = () => {
      // Smart Navigation Logic
      if (location.pathname === '/processing') {
          // Pass state back to upload to keep context
          navigate('/upload', { state: location.state });
      } else if (location.pathname === '/download') {
          // Pass state back to processing to keep activeTool context
          navigate('/processing', { state: location.state });
      } else if (location.pathname === '/upload') {
          // Check if we have state indicating which tool category we came from
          const fromCategory = location.state?.fromCategory;
          if (fromCategory) {
              navigate(`/tools/${fromCategory}`);
          } else {
              // Default fallback if no state (direct access)
              navigate('/tools/all');
          }
      } else if (location.pathname.startsWith('/tools/')) {
          // Handle nested tools navigation (e.g. /tools/pdf/organize -> /tools/pdf)
          const parts = location.pathname.split('/').filter(Boolean); // ['', 'tools', 'category', 'subcategory']
          // parts[0] = tools, parts[1] = category, parts[2] = subCategory
          
          if (parts.length > 2) {
              // If deep inside a subcategory, go back to the main category
              navigate(`/tools/${parts[1]}`);
          } else {
              // If at category level, go home
              navigate('/');
          }
      } else {
          // Fallback for other pages (legal, contact, etc.)
          navigate(-1);
      }
  };

  // Logic to show "Back to Previous" on specific pages only
  // Only show on Tools flow: Tools Selection -> Upload -> Processing -> Download
  const showPreviousBtn = 
    location.pathname.startsWith('/tools/') || 
    location.pathname === '/upload' || 
    location.pathname === '/processing' || 
    location.pathname === '/download';

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Global Animation Styles for RGB effect */}
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

      {!isHome && (
        <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-[100] border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900/95 transition-colors duration-300 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center relative">
              
              {/* Left: Logo (STATIC - NON CLICKABLE) */}
              <div className="flex items-center gap-3 z-20 shrink-0 cursor-default select-none">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <i className="fas fa-leaf text-green-600 text-2xl sm:text-3xl"></i>
                </div>
                {/* Hide text on small mobile screens if back button is present to prevent overlap */}
                <span className={`text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight garden-text ${showPreviousBtn ? 'hidden sm:block' : 'block'}`}>
                    PDF Garden
                </span>
              </div>

              {/* Center: Back to Previous (Responsive Positioning) */}
              {showPreviousBtn && (
                <div className={`
                    z-[200] w-auto flex justify-center pointer-events-auto
                    /* Mobile: Static/Relative in Flex Flow */
                    relative
                    /* Desktop: Absolute Centered */
                    md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2
                `}>
                   <button 
                     type="button"
                     onClick={handleBackToPrevious}
                     className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold text-white shadow-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:opacity-90 active:scale-95 transition-all transform hover:scale-105 text-xs sm:text-base whitespace-nowrap cursor-pointer border border-white/20"
                   >
                     <i className="fas fa-arrow-left"></i> 
                     <span className="sm:hidden">Back</span>
                     <span className="hidden sm:inline">{t('nav.back')}</span>
                   </button>
                </div>
              )}

              {/* Right: Back to Garden & Theme Toggle */}
              <div className="flex items-center gap-3 sm:gap-4 z-20 shrink-0">
                 <button 
                   onClick={handleBackToGarden}
                   className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-red-500 via-green-500 to-blue-600 hover:opacity-90 transition transform hover:scale-105 text-xs sm:text-base"
                 >
                   <i className="fas fa-home"></i> <span className="hidden sm:inline">{t('nav.garden')}</span>
                 </button>

                 {/* Theme Toggle Button */}
                 <button 
                    onClick={toggleTheme}
                    className="p-[2px] rounded-lg overflow-hidden relative group hover:scale-105 transition-transform duration-300 shadow-xl h-fit shrink-0"
                    aria-label="Toggle Dark Mode"
                >
                    <div className="absolute inset-0 rgb-animate opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-white dark:bg-gray-800 text-gray-800 dark:text-white h-9 w-9 sm:h-11 sm:w-11 rounded-md font-bold flex items-center justify-center z-10">
                        {theme === 'light' ? (
                            <i className="fas fa-moon text-blue-600 text-lg sm:text-xl"></i> 
                        ) : (
                            <i className="fas fa-sun text-yellow-400 text-lg sm:text-xl"></i>
                        )}
                    </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      {/* Use w-full and small padding for full screen feel */}
      <main className="flex-grow w-full px-2 py-4">
        {children}
      </main>
      
      {/* --- NEW FOOTER IMPLEMENTATION --- */}
      <footer className="bg-[#1f2937] text-white pt-16 pb-8 mt-20 border-t-4 border-green-500">
        <div className="w-full px-6 md:px-12">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* PRODUCT */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-green-400 border-b border-gray-700 pb-2 inline-block">{t('footer.product')}</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.home')}</Link></li>
                <li><Link to="/tools/all" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.features')}</Link></li>
                <li><Link to="/tools/all" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.pricing')}</Link></li>
                <li><Link to="/about" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.faq')}</Link></li>
              </ul>
            </div>

            {/* RESOURCES */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-green-400 border-b border-gray-700 pb-2 inline-block">{t('footer.resources')}</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link to="/tools/all" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.pdf_tools')}</Link></li>
                <li><Link to="/tools/image" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.image_tools')}</Link></li>
                <li><Link to="/suggest" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.suggest')}</Link></li>
              </ul>
            </div>

            {/* COMPANY */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-green-400 border-b border-gray-700 pb-2 inline-block">{t('footer.company')}</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link to="/about" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.about')}</Link></li>
                <li><Link to="/contact" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.contact')}</Link></li>
                <li><Link to="/blog" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.blog')}</Link></li>
                <li><Link to="/press" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.press')}</Link></li>
              </ul>
            </div>

            {/* LEGAL */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-green-400 border-b border-gray-700 pb-2 inline-block">{t('footer.legal')}</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link to="/privacy" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.terms')}</Link></li>
                <li><Link to="/cookies" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.cookies')}</Link></li>
                <li><Link to="/security" className="hover:text-white hover:translate-x-1 transition-transform inline-block">{t('link.security')}</Link></li>
              </ul>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
             
             {/* Language Dropdown (Working) */}
             <div className="relative group" ref={langDropdownRef}>
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-bold border border-gray-600 rounded px-3 py-1.5 hover:border-green-500 bg-gray-800"
                >
                   <span className="text-lg">{currentLang.flag}</span> {currentLang.name} <i className={`fas fa-chevron-down text-xs ml-1 transition-transform ${isLangOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isLangOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden animate-fade-in-up z-50">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0 ${language === lang.code ? 'text-green-400 bg-gray-700' : 'text-gray-300'}`}
                      >
                         <span className="text-lg">{lang.flag}</span>
                         <span className="font-bold">{lang.name}</span>
                         {language === lang.code && <i className="fas fa-check ml-auto"></i>}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             {/* Copyright & Socials */}
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex gap-6 text-gray-400">
                   <a href="#" className="hover:text-green-400 transition text-xl transform hover:scale-110"><i className="fab fa-twitter"></i></a>
                   <a href="#" className="hover:text-green-400 transition text-xl transform hover:scale-110"><i className="fab fa-facebook"></i></a>
                   <a href="#" className="hover:text-green-400 transition text-xl transform hover:scale-110"><i className="fab fa-linkedin"></i></a>
                   <a href="#" className="hover:text-green-400 transition text-xl transform hover:scale-110"><i className="fab fa-instagram"></i></a>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                   © PDF Garden {new Date().getFullYear()} ®
                </div>
             </div>

          </div>

        </div>
      </footer>
    </div>
  );
};
