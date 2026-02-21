// Enterprise-Grade Security Utilities using Web Crypto API

// Algorithm: AES-GCM (Galois/Counter Mode) - Authenticated Encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// 1. Generate a secure session key (Ephemeral - dies when tab closes)
export const generateSessionKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    true, // extractable (needed for internal use, but we don't save it anywhere persistent)
    ['encrypt', 'decrypt']
  );
};

// 2. Encrypt Data (Raw ArrayBuffer -> Encrypted Buffer + IV)
export const encryptData = async (
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ encryptedBuffer: ArrayBuffer; iv: Uint8Array }> => {
  // Generate a random initialization vector (IV) for every encryption op
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    data
  );

  return { encryptedBuffer, iv };
};

// 3. Decrypt Data (Encrypted Buffer + IV -> Raw ArrayBuffer)
export const decryptData = async (
  encryptedBuffer: ArrayBuffer,
  iv: Uint8Array,
  key: CryptoKey
): Promise<ArrayBuffer> => {
  return await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    encryptedBuffer
  );
};
