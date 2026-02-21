
import React, { useState, useEffect } from 'react';

const SuggestFeature: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    profession: '',
    suggestion: ''
  });

  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Validation Regex
  const textOnlyRegex = /^[a-zA-Z\s\-\.]+$/; // Letters, spaces, hyphens, dots
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.[a-zA-Z]{2,}\/?)/i;

  const MAX_WORDS = 1080;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear specific error when user types
    setErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    
    // Check Word Count
    const words = text.trim().split(/\s+/);
    const count = text.trim() === '' ? 0 : words.length;

    // Word Limit Logic
    if (count > MAX_WORDS) {
      // Allow deletion (if length is decreasing), otherwise block
      if (text.length >= formData.suggestion.length) {
         setErrors(prev => ({ ...prev, suggestion: `⚠️ Limit reached! You cannot exceed ${MAX_WORDS} words.` }));
         return; // Block update
      }
    }

    setWordCount(count);
    setErrors(prev => ({ ...prev, suggestion: '' }));
    setFormData(prev => ({ ...prev, suggestion: text }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    // 1. Validate Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    } else if (!textOnlyRegex.test(formData.name)) {
      newErrors.name = "Invalid Name. Use letters only (no numbers/symbols).";
      isValid = false;
    }

    // 2. Validate Profession
    if (!formData.profession.trim()) {
      newErrors.profession = "Profession is required.";
      isValid = false;
    } else if (!textOnlyRegex.test(formData.profession)) {
      newErrors.profession = "Invalid Profession. Use letters only.";
      isValid = false;
    }

    // 3. Validate Country
    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
      isValid = false;
    } else if (!textOnlyRegex.test(formData.country)) {
      newErrors.country = "Invalid Country. Use letters only.";
      isValid = false;
    }

    // 4. Validate Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid Email address.";
      isValid = false;
    }

    // 5. Validate Suggestion
    if (!formData.suggestion.trim()) {
      newErrors.suggestion = "Please enter a suggestion.";
      isValid = false;
    } else if (urlRegex.test(formData.suggestion)) {
      newErrors.suggestion = "Text only allowed. No links or URLs.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Success
      setSuccess(true);
      setFormData({ name: '', email: '', country: '', profession: '', suggestion: '' });
      setWordCount(0);
    } else {
        // Scroll to top or show general alert
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: SuggestFeature</div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 garden-text">
          <i className="fas fa-lightbulb text-yellow-500 mr-3"></i>
          Suggest a Feature
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Help us cultivate a better platform. We listen to every idea!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INFO */}
        <div className="lg:col-span-1 space-y-8">
            {/* Why Share Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl text-white">
                <h3 className="text-2xl font-bold mb-6">Why Share?</h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <i className="fas fa-check-circle mt-1 text-green-300"></i>
                        <span className="text-indigo-100">Shape the future roadmap.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <i className="fas fa-check-circle mt-1 text-green-300"></i>
                        <span className="text-indigo-100">Request specific tools.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <i className="fas fa-check-circle mt-1 text-green-300"></i>
                        <span className="text-indigo-100">Grow open source.</span>
                    </li>
                </ul>
                <div className="mt-8 text-center opacity-80">
                    <i className="fas fa-comments text-6xl"></i>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-5xl mb-6 animate-bounce">
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Thank You!</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Your suggestion has been planted in our garden of ideas.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg"
              >
                Submit Another Idea
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-200 outline-none transition bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-600'}`}
                    placeholder="Your Name"
                  />
                  {errors.name && <p className="text-red-500 text-xs font-bold mt-1"><i className="fas fa-exclamation-triangle"></i> {errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Profession <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-200 outline-none transition bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.profession ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-600'}`}
                    placeholder="e.g. Designer, Developer"
                  />
                  {errors.profession && <p className="text-red-500 text-xs font-bold mt-1"><i className="fas fa-exclamation-triangle"></i> {errors.profession}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-200 outline-none transition bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-600'}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-bold mt-1"><i className="fas fa-exclamation-triangle"></i> {errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Country <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-200 outline-none transition bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.country ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-600'}`}
                    placeholder="Your Country"
                  />
                  {errors.country && <p className="text-red-500 text-xs font-bold mt-1"><i className="fas fa-exclamation-triangle"></i> {errors.country}</p>}
                </div>
              </div>

              {/* Suggestion Box */}
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">
                        Your Suggestion <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs font-bold ${wordCount > MAX_WORDS ? 'text-red-600' : 'text-gray-500'}`}>
                        {wordCount} / {MAX_WORDS} Words
                    </span>
                </div>
                <textarea 
                  name="suggestion"
                  rows={6}
                  value={formData.suggestion}
                  onChange={handleSuggestionChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-200 outline-none transition resize-none bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.suggestion ? 'border-red-500 bg-red-50' : 'border-gray-200 dark:border-gray-600'}`}
                  placeholder="Describe your feature idea here (Text Only)..."
                ></textarea>
                {errors.suggestion ? (
                    <p className="text-red-600 text-sm mt-2 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                        <i className="fas fa-ban mr-2"></i> {errors.suggestion}
                    </p>
                ) : (
                    <p className="text-gray-400 text-xs mt-2 text-right">No URLs, Links or Files allowed.</p>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-xl transform active:scale-95 transition-all text-lg"
              >
                Submit Suggestion
              </button>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestFeature;
