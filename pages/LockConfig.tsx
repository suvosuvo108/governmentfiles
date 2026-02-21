
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { processLockPDF } from '../utils/pdfUtils';
import { ProcessingStatus } from '../types';

const LockConfig: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { files, sessionKey, resetApp } = useFileContext();
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentProcessingFile, setCurrentProcessingFile] = useState("");
    
    // Password States
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordSet, setIsPasswordSet] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generator Config
    const [genConfig, setGenConfig] = useState({
        length: 16,
        useLetters: true,
        useNumbers: true,
        useSymbols: true,
        useSpecial: false,
        useUnicode: false
    });

    // Password Strength Logic
    const strengthInfo = useMemo(() => {
        if (!password) return { label: 'Empty', color: 'bg-gray-200', score: 0 };
        let score = 0;
        if (password.length > 8) score++;
        if (password.length > 14) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { label: 'Super Easy', color: 'bg-red-500', score: 25 };
        if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', score: 50 };
        if (score === 4) return { label: 'Strong', color: 'bg-blue-500', score: 75 };
        return { label: 'Super Strong', color: 'bg-green-500', score: 100 };
    }, [password]);

    const handleManualChange = (val: string) => {
        // Strict emoji block: removes non-printable or non-standard ASCII/Unicode symbol ranges common in emojis
        const noEmoji = val.replace(/[\u1F600-\u1F64F]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u2600-\u26FF]|[\u2700-\u27BF]/g, "");
        if (noEmoji.length <= 256) {
            setPassword(noEmoji);
        }
    };

    const generateSecurePassword = () => {
        const charsetLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const charsetNumbers = "0123456789";
        const charsetSymbols = "!@#$%^&*()";
        const charsetSpecial = "-_=+[{]}\|;:'\",.<>/?";
        const charsetUnicode = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω∫∬∭∮∯∰";

        let pool = "";
        if (genConfig.useLetters) pool += charsetLetters;
        if (genConfig.useNumbers) pool += charsetNumbers;
        if (genConfig.useSymbols) pool += charsetSymbols;
        if (genConfig.useSpecial) pool += charsetSpecial;
        if (genConfig.useUnicode) pool += charsetUnicode;

        if (!pool) pool = charsetLetters; // Fallback

        let result = "";
        const bytes = new Uint32Array(genConfig.length);
        window.crypto.getRandomValues(bytes);
        for (let i = 0; i < genConfig.length; i++) {
            result += pool[bytes[i] % pool.length];
        }
        setPassword(result);
        setConfirmPassword('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmSet = () => {
        if (!password.trim()) {
            alert("Please provide a password.");
            return;
        }
        if (activeTab === 'auto' && password !== confirmPassword) {
            alert("Please confirm the generated password by pasting it in the confirmation box.");
            return;
        }
        setIsPasswordSet(true);
        setIsModalOpen(false);
    };

    const handleDownloadAndFinish = async () => {
        if (!isPasswordSet || files.length === 0 || !sessionKey) return;
        setIsProcessing(true);
        try {
            for (const file of files) {
                setCurrentProcessingFile(file.name);
                await new Promise<void>((resolve, reject) => {
                    processLockPDF(file, sessionKey, password, (status) => {
                        if (status === ProcessingStatus.ERROR) reject(new Error("Locking failed"));
                    }, (blob: Blob) => {
                        const fileName = file.name.toLowerCase().endsWith('.pdf') 
                            ? file.name.replace('.pdf', '_locked.pdf') 
                            : `${file.name}_locked.pdf`;
                        window.saveAs(blob, fileName);
                        resolve();
                    });
                });
            }
            setTimeout(() => { resetApp(); navigate('/'); }, 1500);
        } catch (err) {
            console.error("Encryption error:", err);
            alert("Encryption failed. Verify password compatibility.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-16 px-4 flex flex-col items-center">
            {/* Unique Page Identifier */}
            <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: LockConfig</div>
            {isProcessing && (
                <div className="fixed inset-0 z-[300] bg-white/90 dark:bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <div className="h-32 w-32 rounded-full border-8 border-t-green-500 border-r-blue-500 border-b-purple-500 border-l-pink-500 animate-spin flex items-center justify-center relative z-10 mb-10">
                         <i className="fas fa-lock text-4xl text-gray-800 dark:text-white"></i>
                    </div>
                    <h2 className="text-3xl font-black garden-text text-gray-800 dark:text-white mb-2 uppercase">Encrypting Your Garden</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mb-6 italic">Securing: {currentProcessingFile}</p>
                    <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 animate-[progress_2s_infinite]"></div>
                    </div>
                </div>
            )}

            <div className="text-center mb-12 animate-fade-in-down">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg border-2 border-green-200">
                    <i className="fas fa-shield-alt"></i>
                </div>
                <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-4 garden-text uppercase tracking-tight">Lock Your Document</h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg mx-auto">
                    AES-Standard Encryption. Once locked, the file will be impenetrable without your secret key.
                </p>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block text-center">Step 1: Identity & Key</label>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 border-4 ${isPasswordSet ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/10' : 'border-dashed border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500'}`}
                    >
                        <i className={`fas ${isPasswordSet ? 'fa-check-circle' : 'fa-key'}`}></i>
                        {isPasswordSet ? 'Password Secure' : 'Configure Password'}
                    </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block text-center">Step 2: Harvesting</label>
                    <button 
                        disabled={!isPasswordSet}
                        onClick={handleDownloadAndFinish}
                        className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${isPasswordSet ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <i className="fas fa-file-lock"></i> Lock & Download
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="bg-gray-900 p-6 text-white text-center relative">
                            <h3 className="text-2xl font-black garden-text uppercase tracking-widest">Security Configuration</h3>
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="flex bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                            <button 
                                onClick={() => { setActiveTab('manual'); setPassword(''); }}
                                className={`flex-1 py-4 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <i className="fas fa-keyboard mr-2"></i> Manual
                            </button>
                            <button 
                                onClick={() => { setActiveTab('auto'); setPassword(''); }}
                                className={`flex-1 py-4 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'auto' ? 'bg-white dark:bg-gray-800 text-purple-600 border-b-4 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <i className="fas fa-magic mr-2"></i> System Generate
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {activeTab === 'manual' ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black text-gray-400 uppercase">Input Secret Key (1-256 Chars)</label>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">No Emojis Allowed</span>
                                    </div>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => handleManualChange(e.target.value)}
                                        placeholder="Secret Password..."
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 font-bold"
                                    />
                                    
                                    {password && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-xs font-black uppercase text-gray-400">Strength: {strengthInfo.label}</span>
                                                <span className="text-xs font-black text-gray-400">{password.length}/256</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-500 ${strengthInfo.color}`} style={{ width: `${strengthInfo.score}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleConfirmSet} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-colors">
                                        SET PASSWORD
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-black text-gray-400 uppercase">Password Length: {genConfig.length}</label>
                                            </div>
                                            <input 
                                                type="range" min="1" max="256" 
                                                value={genConfig.length}
                                                onChange={(e) => setGenConfig({...genConfig, length: parseInt(e.target.value)})}
                                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                            <input 
                                                type="number" min="1" max="256"
                                                value={genConfig.length}
                                                onChange={(e) => setGenConfig({...genConfig, length: Math.min(256, Math.max(1, parseInt(e.target.value) || 1))})}
                                                className="w-full p-2 text-center bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg font-bold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { key: 'useLetters', label: 'Letters (A-z)' },
                                                { key: 'useNumbers', label: 'Numbers (0-9)' },
                                                { key: 'useSymbols', label: 'Symbols (@#$)' },
                                                { key: 'useSpecial', label: 'Special (-_.)' },
                                                { key: 'useUnicode', label: 'Unicode (Intl)' }
                                            ].map(item => (
                                                <button 
                                                    key={item.key}
                                                    onClick={() => setGenConfig(prev => ({...prev, [item.key]: !prev[item.key as keyof typeof genConfig]}))}
                                                    className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${genConfig[item.key as keyof typeof genConfig] ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'border-gray-100 dark:border-gray-700 text-gray-400'}`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex flex-col justify-center">
                                        <button onClick={generateSecurePassword} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-purple-700 transition transform active:scale-95">
                                            <i className="fas fa-sync-alt mr-2"></i> GENERATE KEY
                                        </button>

                                        {password && (
                                            <div className="space-y-4 animate-fade-in-up">
                                                <div className="p-4 bg-gray-900 rounded-2xl border-4 border-gray-800 text-center relative overflow-hidden">
                                                    <div className="text-white font-mono text-xs break-all h-20 overflow-y-auto custom-scrollbar">{password}</div>
                                                    <button onClick={handleCopy} className={`absolute top-1 right-1 px-3 py-1 rounded-lg text-[10px] font-black transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                                        {copied ? 'COPIED' : 'COPY'}
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase">Paste to Confirm</label>
                                                    <input 
                                                        type="text"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Confirm generated key..."
                                                        className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:border-green-500 font-bold"
                                                    />
                                                    <button onClick={handleConfirmSet} className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-green-700 mt-2">
                                                        CONFIRM & PROCEED
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LockConfig;
