
// In a real app, this should be unique per user and stored. For this demo, it's a constant.
const SALT = 'luna-cycle-salt-2024'; 
const ITERATIONS = 100000;

// Helper to convert string to ArrayBuffer
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// Helper to convert ArrayBuffer to string
function ab2str(buf) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

// Derives a key from a PIN using PBKDF2
async function getKey(pin) {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        str2ab(pin),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: str2ab(SALT),
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts data using a PIN.
 * @param {string} pin The user's PIN.
 * @param {object} data The data object to encrypt.
 * @returns {Promise<string>} A base64 encoded string of the encrypted data.
 */
export async function encryptData(pin, data) {
    try {
        const key = await getKey(pin);
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
        const dataStr = JSON.stringify(data);
        const encodedData = str2ab(dataStr);

        const encryptedContent = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            encodedData
        );

        const encryptedData = new Uint8Array(iv.length + encryptedContent.byteLength);
        encryptedData.set(iv, 0);
        encryptedData.set(new Uint8Array(encryptedContent), iv.length);

        return btoa(ab2str(encryptedData.buffer));
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Could not encrypt data.");
    }
}

/**
 * Decrypts data using a PIN.
 * @param {string} pin The user's PIN.
 * @param {string} encryptedBase64 The base64 encoded encrypted data.
 * @returns {Promise<any>} The decrypted data object.
 */
export async function decryptData(pin, encryptedBase64) {
    try {
        const key = await getKey(pin);
        const encryptedData = new Uint8Array(str2ab(atob(encryptedBase64)));
        const iv = encryptedData.slice(0, 12);
        const data = encryptedData.slice(12);

        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            data
        );

        const decryptedStr = ab2str(decryptedContent);
        return JSON.parse(decryptedStr);
    } catch (error) {
        console.error("Decryption failed. Incorrect PIN or corrupted data.", error);
        throw new Error("Could not decrypt data. Please check your PIN.");
    }
}
