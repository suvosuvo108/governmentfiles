
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Updated Slides with 16:9 Aspect Ratio (1600x900)
const SLIDES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=1600&h=900&auto=format&fit=crop",
    text: "100% Client-Side Privacy Protection"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1600&h=900&auto=format&fit=crop",
    text: "Bank-Grade Data Security"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=1600&h=900&auto=format&fit=crop", 
    text: "Zero Server Uploads Guaranteed"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&h=900&auto=format&fit=crop", 
    text: "1000% Free Forever"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&h=900&auto=format&fit=crop",
    text: "Open Source Platform"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1600&h=900&auto=format&fit=crop", 
    text: "Advance Next-Gen PDF Tools 100% Free Access"
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1600&h=900&auto=format&fit=crop", 
    text: "Next-Gen Powerful iMage Tools 100% Free"
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- SWIPE LOGIC STATE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Only auto-slide if not currently being dragged
      if (!isDragging) {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [isDragging]);

  const navigateToTools = (category: string) => {
    navigate(`/tools/${category}`);
  };

  // --- SWIPE HANDLERS ---
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
        setIsDragging(false);
        return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swiped Left -> Next Slide
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }
    if (isRightSwipe) {
      // Swiped Right -> Previous Slide
      setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }
    setIsDragging(false);
  };

  // Mouse Handlers for Desktop Dragging
  const onMouseDown = (e: React.MouseEvent) => {
      setTouchEnd(null);
      setTouchStart(e.clientX);
      setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          setTouchEnd(e.clientX);
      }
  };

  const onMouseUp = () => {
      if (isDragging) {
          onTouchEnd(); // Reuse logic
      }
      setIsDragging(false);
  };

  const onMouseLeave = () => {
     if (isDragging) {
         setIsDragging(false);
     }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] pb-8 overflow-x-hidden w-full transition-colors duration-300">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Home</div>

      {/* Custom Styles for Animations */}
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
        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-scroll {
            animation: scroll 20s linear infinite;
        }
        @keyframes stamp-fade {
            0%, 100% { opacity: 1; transform: rotate(-12deg) scale(1); }
            50% { opacity: 0; transform: rotate(-12deg) scale(0.95); }
        }
        .animate-stamp {
            animation: stamp-fade 3s ease-in-out infinite;
        }
        @keyframes donate-fade {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0; transform: scale(0.95); }
        }
        .animate-donate-fade {
            animation: donate-fade 4s ease-in-out infinite;
        }
        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }
      `}</style>

      {/* NEW PROFESSIONAL HEADER SECTION (FIXED) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b-2 border-green-100 dark:border-gray-700 shadow-md transition-all duration-300 py-1">
          <div className="w-full px-4 md:px-8 flex justify-between items-center h-16 md:h-20">
              {/* Left: Logo Area */}
              <div className="flex items-center gap-0 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  {/* Normal Logo, no extra padding, tight spacing */}
                  <i className="fas fa-leaf text-green-600 text-2xl md:text-3xl mr-1"></i>
                  <span className="text-xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 tracking-tight garden-text leading-none">
                      PDF Garden
                  </span>
              </div>

              {/* Right: Theme Toggle */}
              <button 
                  onClick={toggleTheme}
                  className="p-[2px] rounded-lg overflow-hidden relative group hover:scale-105 transition-transform duration-300 shadow-xl h-fit shrink-0"
                  aria-label="Toggle Dark Mode"
              >
                  <div className="absolute inset-0 rgb-animate opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white dark:bg-gray-900 text-gray-800 dark:text-white h-8 w-8 md:h-10 md:w-10 rounded-md font-bold flex items-center justify-center z-10">
                      {theme === 'light' ? (
                          <i className="fas fa-moon text-blue-600 text-lg md:text-xl"></i> 
                      ) : (
                          <i className="fas fa-sun text-yellow-400 text-lg md:text-xl"></i>
                      )}
                  </div>
              </button>
          </div>
      </nav>

      {/* Spacer for Fixed Header - Reduced Height */}
      <div className="h-20 md:h-24 w-full"></div>

      {/* SYNCHRONIZED MARQUEE SECTION (Full Width Feel) - Compact */}
      <div className="w-[98%] max-w-[1920px] mx-auto mb-3 p-1 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-xl">
          <div className="overflow-hidden bg-white/95 dark:bg-gray-900/95 rounded-lg py-1.5 backdrop-blur-sm transition-colors duration-300">
              <div className="flex whitespace-nowrap animate-scroll">
                  {/* Repeat items 10 times to ensure smooth infinite scroll without gaps */}
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center mx-2">
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-0.5 rounded-md text-sm md:text-base font-black shadow-md border border-white dark:border-gray-800 uppercase inline-flex items-center leading-none tracking-wide">
                          <i className="fas fa-code-branch mr-1.5 text-xs"></i>OPEN SOURCE PLATFORM
                        </span>
                    </div>
                  ))}
              </div>
          </div>
      </div>

      {/* HERO SECTION - Compact */}
      <div className="relative w-full max-w-[95%] mx-auto flex flex-col items-center justify-center mb-3 animate-fade-in-down">
        <div className="text-center z-10 mx-auto px-2">
            <h1 className="font-black garden-text leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-800 dark:text-white drop-shadow-sm flex flex-col md:flex-row items-center justify-center gap-0 md:gap-3">
                {/* Mobile: Line 1, Desktop: Part 1 */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 whitespace-nowrap mb-1 md:mb-0">
                    {t('home.welcome')}
                </span>
                
                {/* Mobile: Line 2, Desktop: Part 2 */}
                <span className="text-gray-800 dark:text-white flex items-center justify-center whitespace-nowrap">
                    {/* Logo Icon inline with NO SPACE */}
                    <span className="text-green-600 inline-flex items-center gap-0">
                        <i className="fas fa-leaf mr-0 md:mr-0 text-3xl md:text-6xl"></i>
                    </span>
                    <span>PDF Garden</span>
                </span>
            </h1>
        </div>
      </div>
        
      {/* Subtitle - Compact */}
      <div className="max-w-4xl mx-auto text-center mb-6 px-4" style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>
          <p className="text-base md:text-xl font-black text-gray-800 dark:text-gray-200 mb-1 drop-shadow-sm leading-snug">
            {t('home.subtitle')}
          </p>
          <p className="text-sm md:text-lg font-black text-green-700 dark:text-green-400 tracking-wide mt-1">
            {t('home.features')}
          </p>
      </div>

      {/* Slider Container - 16:9 Forced Aspect Ratio (Compact Width 4XL) */}
      <div className="w-[95%] max-w-4xl mx-auto mb-8 px-2">
        <div className="relative p-[3px] rounded-[1.5rem] rgb-animate shadow-xl">
          <div 
            ref={sliderRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{ aspectRatio: '16/9' }}
            className="relative w-full aspect-video bg-white dark:bg-gray-900 rounded-[calc(1.5rem-3px)] overflow-hidden group select-none cursor-grab active:cursor-grabbing"
          >
            {SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={slide.url} 
                  alt="Slide" 
                  className="w-full h-full object-cover transform transition-transform duration-[20s] scale-100 group-hover:scale-110 pointer-events-none"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-center pt-10">
                  <h2 className="text-white text-lg md:text-2xl lg:text-3xl font-bold drop-shadow-lg px-6 text-center garden-text max-w-4xl leading-tight">
                    {slide.text}
                  </h2>
                </div>
              </div>
            ))}

            {/* Visual Swipe Indicators */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <i className="fas fa-chevron-left text-white text-3xl drop-shadow-md"></i>
            </div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <i className="fas fa-chevron-right text-white text-3xl drop-shadow-md"></i>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-30">
                {SLIDES.map((_, idx) => (
                <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-md ${
                    currentSlide === idx ? 'bg-green-500 w-6 border border-white' : 'bg-white/50 w-1.5 hover:bg-white'
                    }`}
                />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOOL NAVIGATION BUTTONS - Reduced Max Width (4XL) to match Slider */}
      <div className="w-[95%] max-w-4xl px-2 md:px-4 mb-8 mx-auto">
          <div className="grid grid-cols-3 gap-3 md:gap-5 lg:gap-6">
              {/* PDFs Tools */}
              <div 
                onClick={() => navigateToTools('pdf')}
                className="group relative p-[3px] md:p-[4px] rounded-2xl md:rounded-[1.5rem] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 aspect-square cursor-pointer overflow-hidden"
              >
                  <div className="absolute inset-0 rgb-animate opacity-100"></div>
                  <div className="relative h-full w-full bg-white dark:bg-gray-800 rounded-[calc(1rem-3px)] md:rounded-[calc(1.5rem-4px)] overflow-hidden p-2 md:p-3 flex flex-col justify-between z-10">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-12 h-12 md:-mt-6 md:-mr-6 md:w-20 md:h-20 bg-red-100 dark:bg-red-900/30 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                        <i className="fas fa-file text-xl sm:text-3xl md:text-4xl lg:text-5xl text-red-600 mb-1 md:mb-2 group-hover:scale-110 transition-transform block"></i>
                        <h3 className="text-[10px] sm:text-base md:text-xl lg:text-2xl font-black text-gray-800 dark:text-white font-sans leading-tight">PDF<br/>TooLs</h3>
                        
                        <span className="inline-block mt-1 md:mt-2 text-red-600 font-bold group-hover:translate-x-1 transition-transform text-[8px] sm:text-[10px] md:text-xs leading-tight">
                            {t('tools.explore')}<span className="hidden sm:inline"> Tools</span> <i className="fas fa-arrow-right ml-1"></i>
                        </span>
                      </div>
                  </div>
              </div>

              {/* Images Tools */}
              <div 
                onClick={() => navigateToTools('image')}
                className="group relative p-[3px] md:p-[4px] rounded-2xl md:rounded-[1.5rem] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 aspect-square cursor-pointer overflow-hidden"
              >
                  <div className="absolute inset-0 rgb-animate opacity-100"></div>
                  <div className="relative h-full w-full bg-white dark:bg-gray-800 rounded-[calc(1rem-3px)] md:rounded-[calc(1.5rem-4px)] overflow-hidden p-2 md:p-3 flex flex-col justify-between z-10">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-12 h-12 md:-mt-6 md:-mr-6 md:w-20 md:h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                        <i className="fas fa-image text-xl sm:text-3xl md:text-4xl lg:text-5xl text-blue-600 mb-1 md:mb-2 group-hover:scale-110 transition-transform block"></i>
                        <h3 className="text-[10px] sm:text-base md:text-xl lg:text-2xl font-black text-gray-800 dark:text-white font-sans leading-tight">iMAGE<br/>TooLs</h3>
                        
                        <span className="inline-block mt-1 md:mt-2 text-blue-600 font-bold group-hover:translate-x-1 transition-transform text-[8px] sm:text-[10px] md:text-xs leading-tight">
                            {t('tools.explore')}<span className="hidden sm:inline"> Tools</span> <i className="fas fa-arrow-right ml-1"></i>
                        </span>
                      </div>
                  </div>
              </div>

              {/* All Tools */}
              <div 
                onClick={() => navigateToTools('all')}
                className="group relative p-[3px] md:p-[4px] rounded-2xl md:rounded-[1.5rem] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 aspect-square cursor-pointer overflow-hidden"
              >
                  <div className="absolute inset-0 rgb-animate opacity-100"></div>
                  <div className="relative h-full w-full bg-white dark:bg-gray-800 rounded-[calc(1rem-3px)] md:rounded-[calc(1.5rem-4px)] overflow-hidden p-2 md:p-3 flex flex-col justify-between z-10">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-12 h-12 md:-mt-6 md:-mr-6 md:w-20 md:h-20 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                        <i className="fas fa-layer-group text-xl sm:text-3xl md:text-4xl lg:text-5xl text-fuchsia-600 mb-1 md:mb-2 group-hover:scale-110 transition-transform block"></i>
                        <h3 className="text-[10px] sm:text-base md:text-xl lg:text-2xl font-black text-gray-800 dark:text-white font-sans leading-tight">ALL<br/>TooLs</h3>
                        
                        <span className="inline-block mt-1 md:mt-2 text-fuchsia-600 font-bold group-hover:translate-x-1 transition-transform text-[8px] sm:text-[10px] md:text-xs leading-tight">
                            {t('tools.explore')}<span className="hidden sm:inline"> Tools</span> <i className="fas fa-arrow-right ml-1"></i>
                        </span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* SUGGEST SECTION - Compact (Max Width 3XL) */}
      <div className="w-[95%] max-w-3xl px-4 mb-10 mx-auto">
          <Link to="/suggest" className="block transform hover:scale-[1.01] transition-transform duration-300">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-1 shadow-xl">
              <div className="bg-white dark:bg-gray-800 rounded-[calc(1rem-2px)] px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600 text-2xl animate-bounce hidden sm:block">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-white uppercase tracking-wider mb-0.5">
                      SUGGEST A FEATURE
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      Help us grow the garden!
                    </p>
                  </div>
                </div>
                <div className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-full font-bold text-base shadow-md whitespace-nowrap transition-colors">
                  Submit <i className="fas fa-arrow-right ml-1"></i>
                </div>
              </div>
            </div>
          </Link>
      </div>
      
    </div>
  );
};

export default Home;
