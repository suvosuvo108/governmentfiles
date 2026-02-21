
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { processMergePDF, formatFileSize } from '../utils/pdfUtils';
import { decryptData, encryptData } from '../utils/security';
import { PDFFile, ProcessingStatus } from '../types';

const MergeConfig: React.FC = () => {
    const { files, sessionKey, resetApp, removeFile, updateFileLockedState } = useFileContext();
    const navigate = useNavigate();
    
    // Local state for reordering and UI control
    const [orderedFiles, setOrderedFiles] = useState<PDFFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Locked File Handling State
    const [showLockedWarning, setShowLockedWarning] = useState(false);
    const [unlockModalFile, setUnlockModalFile] = useState<PDFFile | null>(null);
    const [password, setPassword] = useState("");
    const [unlockError, setUnlockError] = useState("");

    useEffect(() => {
        if (files.length > 0) {
            setOrderedFiles([...files]);
        } else {
            navigate('/upload');
        }
    }, [files, navigate]);

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...orderedFiles];
        if (direction === 'up' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        } else if (direction === 'down' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        }
        setOrderedFiles(newFiles);
    };

    const handleMergeClick = () => {
        const lockedFiles = orderedFiles.filter(f => f.isLocked);
        if (lockedFiles.length > 0) {
            setShowLockedWarning(true);
        } else {
            executeMerge(orderedFiles);
        }
    };

    const executeMerge = async (filesToMerge: PDFFile[]) => {
        if (!sessionKey || filesToMerge.length < 2) return;
        setIsProcessing(true);
        
        const mergedBlob = await processMergePDF(filesToMerge, sessionKey, (status) => {
            console.log(status); 
        });

        if (mergedBlob) {
            if (window.saveAs) {
                window.saveAs(mergedBlob, 'merged_garden_document.pdf');
            } else {
                const url = URL.createObjectURL(mergedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'merged_garden_document.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
            
            setTimeout(() => {
                resetApp();
                navigate('/');
            }, 1000);
        } else {
            alert("Merge failed. Please try again.");
            setIsProcessing(false);
        }
    };

    const handleUnlock = async () => {
        if (!unlockModalFile || !sessionKey || !password) return;
        setUnlockError("");

        try {
            // 1. Decrypt from session memory
            const encryptedBuffer = await decryptData(unlockModalFile.encryptedData, unlockModalFile.iv, sessionKey);
            
            // 2. Attempt unlock with user password using PDF-Lib
            try {
                const pdfDoc = await window.PDFLib.PDFDocument.load(encryptedBuffer, { password });
                const unlockedBytes = await pdfDoc.save();
                
                // 3. Re-encrypt the now-unlocked bytes for session storage
                const { encryptedBuffer: newEnc, iv: newIv } = await encryptData(unlockedBytes, sessionKey);
                
                // 4. Update global state
                updateFileLockedState(unlockModalFile.id, false, newEnc, newIv);
                
                // 5. Cleanup
                setUnlockModalFile(null);
                setPassword("");
            } catch (err: any) {
                setUnlockError("Incorrect password. Please try again.");
            }
        } catch (err) {
            setUnlockError("Decryption failed. File may be corrupted.");
        }
    };

    const removeLockedAndProceed = () => {
        const unlockedOnly = orderedFiles.filter(f => !f.isLocked);
        setShowLockedWarning(false);
        if (unlockedOnly.length < 2) {
            alert("At least 2 unlocked files are required to proceed.");
            return;
        }
        executeMerge(unlockedOnly);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 relative">
            <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: MergeConfig</div>

            {/* PROCESSING OVERLAY */}
            {isProcessing && (
                <div className="fixed inset-0 z-[300] bg-white/90 dark:bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <div className="h-32 w-32 rounded-full border-8 border-t-green-500 border-r-blue-500 border-b-purple-500 border-l-pink-500 animate-spin flex items-center justify-center relative z-10 mb-10">
                         <i className="fas fa-object-group text-4xl text-gray-800 dark:text-white"></i>
                    </div>
                    <h2 className="text-3xl font-black garden-text text-gray-800 dark:text-white mb-2 uppercase">Merging Garden</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mb-6 italic">Combining your documents securely...</p>
                </div>
            )}

            {/* HEADER */}
            <div className="text-center mb-10">
                <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg border-2 border-blue-200">
                    <i className="fas fa-object-group"></i>
                </div>
                <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-4 garden-text uppercase tracking-tight">Merge PDFs</h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg mx-auto">
                    Manage your garden of documents. Ensure all files are unlocked before merging.
                </p>
            </div>

            {/* FILE LIST */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                     <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">{orderedFiles.length} Files Selected</span>
                     <button onClick={() => navigate('/upload')} className="text-sm font-bold text-blue-500 hover:text-blue-700">
                        <i className="fas fa-plus mr-1"></i> Add More
                     </button>
                </div>

                <ul className="space-y-4 mb-8">
                    {orderedFiles.map((file, index) => (
                        <li key={file.id} className={`bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between border-2 transition-all ${file.isLocked ? 'border-red-400 shadow-lg shadow-red-100 dark:shadow-none' : 'border-gray-100 dark:border-gray-600 hover:shadow-md'}`}>
                            <div className="flex items-center gap-4 overflow-hidden">
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${file.isLocked ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                                    {file.isLocked ? <i className="fas fa-lock text-xs"></i> : index + 1}
                                </span>
                                <div className="truncate">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-bold truncate ${file.isLocked ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                                            {file.name}
                                        </p>
                                        {file.isLocked && (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Locked</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                                {file.isLocked ? (
                                    <button 
                                        onClick={() => setUnlockModalFile(file)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95"
                                    >
                                        <i className="fas fa-unlock"></i> Unlock
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200 dark:border-gray-600'}`}
                                        >
                                            <i className="fas fa-arrow-up"></i>
                                        </button>
                                        <button 
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === orderedFiles.length - 1}
                                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${index === orderedFiles.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200 dark:border-gray-600'}`}
                                        >
                                            <i className="fas fa-arrow-down"></i>
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={() => removeFile(file.id)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm ml-2"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="text-center mb-4">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Only Unlocked Files will be merged</p>
                </div>

                <button 
                    onClick={handleMergeClick}
                    disabled={orderedFiles.length < 2}
                    className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${orderedFiles.length >= 2 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    <i className="fas fa-object-group"></i> 
                    {orderedFiles.length < 2 ? 'Select at least 2 files' : 'MERGE PDFS'}
                </button>
            </div>

            {/* WARNING POPUP: Locked files detected on merge click */}
            {showLockedWarning && (
                <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-900/30">
                        <div className="bg-red-600 p-6 text-white text-center">
                            <i className="fas fa-exclamation-triangle text-5xl mb-4"></i>
                            <h3 className="text-2xl font-black garden-text uppercase tracking-widest">Locked Files Found!</h3>
                        </div>
                        <div className="p-8 space-y-6 text-center">
                            <p className="text-gray-600 dark:text-gray-300 font-bold">
                                Your selection contains locked files. These cannot be merged until they are unlocked with a password.
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <button 
                                    onClick={() => setShowLockedWarning(false)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black shadow-lg transition"
                                >
                                    1. UNLOCK FILES WITH PASSWORD
                                </button>
                                <button 
                                    onClick={removeLockedAndProceed}
                                    className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-4 rounded-xl font-black transition"
                                >
                                    2. REMOVE LOCKED & PROCEED
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INDIVIDUAL UNLOCK MODAL */}
            {unlockModalFile && (
                <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gray-900 p-6 text-white text-center relative">
                            <h3 className="text-xl font-black garden-text uppercase">Unlock File</h3>
                            <button onClick={() => setUnlockModalFile(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Unlocking:</p>
                                <p className="font-bold text-gray-800 dark:text-white truncate">{unlockModalFile.name}</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Password Required</label>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Secret Key..."
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 font-bold"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                />
                                {unlockError && (
                                    <p className="text-red-500 text-[10px] font-bold mt-2 animate-bounce uppercase">
                                        <i className="fas fa-info-circle mr-1"></i> {unlockError}
                                    </p>
                                )}
                            </div>

                            <button 
                                onClick={handleUnlock}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-green-700 transition transform active:scale-95"
                            >
                                UNLOCK DOCUMENT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MergeConfig;
