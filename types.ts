
// Global types for the external libraries loaded via CDN
declare global {
  interface Window {
    pdfjsLib: any;
    JSZip: any;
    saveAs: any;
    gapi: any;
    google: any;
    Dropbox: any;
    PDFLib: any;
    jspdf: any;
    forge: any;
  }
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  READING = 'READING', // Uploading/Reading file
  CONVERTING = 'CONVERTING', // Converting pages
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface PDFPage {
  pageNum: number;
  imageData: string; // Base64
}

export interface PDFFile {
  id: string;
  // SECURITY UPDATE: We no longer store the raw 'File' object.
  // We store the encrypted binary data and the IV needed to decrypt it with the session key.
  encryptedData: ArrayBuffer; 
  iv: Uint8Array;
  
  name: string;
  size: number;
  compressedSize?: number; // Store the size after compression
  status: ProcessingStatus;
  progress: number; // 0 to 100
  totalPages: number;
  convertedPages: PDFPage[];
  errorMessage?: string;
  isLocked?: boolean; // Track if the PDF is password protected
}

export interface FileContextType {
  files: PDFFile[];
  stats: {
    deleted: number;
    newAdded: number;
  };
  addFiles: (files: File[]) => Promise<void>; // Changed to Promise due to async encryption
  removeFile: (id: string) => void;
  updateFileStatus: (id: string, status: ProcessingStatus, progress?: number) => void;
  updateFilePages: (id: string, totalPages: number, newPage?: PDFPage, compressedSize?: number) => void;
  updateFileLockedState: (id: string, isLocked: boolean, newData?: ArrayBuffer, newIv?: Uint8Array) => void;
  resetApp: () => void;
  sessionKey: CryptoKey | null; // Expose key to internal processors
}
