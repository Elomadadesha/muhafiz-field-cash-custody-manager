/**
 * Security utilities using Web Crypto API
 * - SHA-256 for password hashing
 * - AES-GCM for backup encryption/decryption
 */
// Hash a password for storage
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
// Generate a key from a password for encryption
async function getKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}
// Encrypt data object to a string
export async function encryptData(data: any, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKeyFromPassword(password, salt);
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedData
  );
  // Combine salt + iv + ciphertext for storage
  // We'll use a simple JSON structure to hold these components encoded as base64
  const payload = {
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedContent))
  };
  return JSON.stringify(payload);
}
// Decrypt string to data object
export async function decryptData(encryptedString: string, password: string): Promise<any> {
  try {
    const payload = JSON.parse(encryptedString);
    if (!payload.salt || !payload.iv || !payload.data) {
      throw new Error("Invalid backup file format");
    }
    const salt = new Uint8Array(payload.salt);
    const iv = new Uint8Array(payload.iv);
    const encryptedData = new Uint8Array(payload.data);
    const key = await getKeyFromPassword(password, salt);
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedData
    );
    const decodedString = new TextDecoder().decode(decryptedContent);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("فشل فك التش��ير. تأكد من صحة كلمة المرور.");
  }
}