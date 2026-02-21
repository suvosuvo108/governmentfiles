
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { PDFFile, ProcessingStatus, FileContextType, PDFPage } from '../types';
import { generateSessionKey, encryptData } from '../utils/security';

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  
  // Security: The Ephemeral Session Key
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);

  // Statistics State
  const [deletedCount, setDeletedCount] = useState(0);
  const [newAddedCount, setNewAddedCount] = useState(0); 
  
  // Ref to track if the first batch has been uploaded yet
  const hasUploadedFirstBatch = useRef(false);

  // 1. Initialize Security Shield (Generate Key) on Mount
  useEffect(() => {
    const initSecurity = async () => {
        try {
            const key = await generateSessionKey();
            setSessionKey(key);
            console.log("🔒 Secure Session Established: AES-256 Key Generated");
        } catch (err) {
            console.error("Security initialization failed:", err);
        }
    };
    initSecurity();
  }, []);

  const addFiles = async (newFiles: File[]) => {
    if (!sessionKey) {
        console.error("Security Key not ready");
        return;
    }

    // Filter out zero-byte files to prevent "PDF file is empty" errors
    const validFiles = newFiles.filter(f => f.size > 0);
    if (validFiles.length < newFiles.length) {
        console.warn(`${newFiles.length - validFiles.length} empty file(s) skipped.`);
    }

    if (validFiles.length === 0) return;

    if (hasUploadedFirstBatch.current) {
        setNewAddedCount(prev => prev + validFiles.length);
    } else {
        hasUploadedFirstBatch.current = true;
    }

    const encryptedFiles: PDFFile[] = [];

    for (const f of validFiles) {
        try {
            const buffer = await f.arrayBuffer();
            
            // Check if PDF is locked BEFORE session-encrypting it
            let isLocked = false;
            if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
                try {
                    if (buffer.byteLength < 10) throw new Error("File too small to be a PDF");
                    await window.pdfjsLib.getDocument({ data: buffer }).promise;
                } catch (err: any) {
                    if (err.name === 'PasswordException') {
                        isLocked = true;
                    } else {
                        console.error("Structural error in PDF:", f.name, err);
                        continue;
                    }
                }
            }

            const { encryptedBuffer, iv } = await encryptData(buffer, sessionKey);
            
            encryptedFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                encryptedData: encryptedBuffer,
                iv: iv,
                name: f.name,
                size: f.size,
                status: ProcessingStatus.PENDING,
                progress: 0,
                totalPages: 0,
                convertedPages: [],
                isLocked: isLocked
            });
        } catch (err) {
            console.error("File processing failed:", f.name, err);
        }
    }

    setFiles(prev => [...prev, ...encryptedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setDeletedCount(prev => prev + 1);
  };

  const updateFileStatus = (id: string, status: ProcessingStatus, progress?: number) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, status, progress: progress !== undefined ? progress : f.progress };
      }
      return f;
    }));
  };

  const updateFileLockedState = (id: string, isLocked: boolean, newData?: ArrayBuffer, newIv?: Uint8Array) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { 
            ...f, 
            isLocked, 
            encryptedData: newData || f.encryptedData, 
            iv: newIv || f.iv 
        };
      }
      return f;
    }));
  };

  const updateFilePages = (id: string, totalPages: number, newPage?: PDFPage, compressedSize?: number) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const updatedFile = {
          ...f,
          totalPages,
          convertedPages: newPage ? [...f.convertedPages, newPage] : f.convertedPages
        };
        if (compressedSize !== undefined) {
            updatedFile.compressedSize = compressedSize;
        }
        return updatedFile;
      }
      return f;
    }));
  };

  const resetApp = () => {
    setFiles([]);
    setDeletedCount(0);
    setNewAddedCount(0);
    hasUploadedFirstBatch.current = false;
  };

  return (
    <FileContext.Provider value={{ 
        files, 
        stats: { deleted: deletedCount, newAdded: newAddedCount },
        addFiles, 
        removeFile, 
        updateFileStatus, 
        updateFilePages,
        updateFileLockedState,
        resetApp,
        sessionKey
    }}>
      {children}
    </FileContext.Provider>
  );
};
