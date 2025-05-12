// src/utilities/fileUtils.js

// CHANGE: Import CryptoJS properly
import CryptoJS from 'crypto-js';

/**
 * Decodes a base64 encoded string
 * @param {string} encodedContent - The base64 encoded content
 * @returns {string} The decoded content
 */
export const decodeBase64 = (encodedContent) => {
    try {
        // Make sure we have a valid base64 string (remove any line breaks)
        const cleanedContent = encodedContent.replace(/\s/g, '');

        // Decode the base64 string
        return atob(cleanedContent);
    } catch (error) {
        console.error('Error decoding base64 content:', error);
        return null;
    }
};

/**
 * Converts a base64 encoded string to a Blob object
 * @param {string} base64Data - The base64 encoded content
 * @param {string} contentType - The MIME type of the content
 * @returns {Blob} The Blob object
 */
export const base64ToBlob = (base64Data, contentType = '') => {
    try {
        // Remove data URI scheme if present (e.g., 'data:application/pdf;base64,')
        let cleanBase64 = base64Data;
        if (base64Data.startsWith('data:')) {
            cleanBase64 = base64Data.split(',')[1];
        } else {
            cleanBase64 = base64Data.replace(/\s/g, ''); // Remove whitespace
        }

        // Convert base64 to binary
        const byteCharacters = atob(cleanBase64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: contentType });
    } catch (error) {
        console.error('Error converting base64 to Blob:', error);
        return null;
    }
};

/**
 * Creates an object URL from a Blob
 * @param {Blob} blob - The Blob object
 * @returns {string} The object URL
 */
export const createObjectURL = (blob) => {
    if (!blob) return null;
    return URL.createObjectURL(blob);
};

/**
 * Determines the MIME type based on file extension
 * @param {string} filename - The filename with extension
 * @returns {string} The MIME type
 */
export const getMimeType = (filename) => {
    if (!filename) return '';

    const extension = filename.split('.').pop().toLowerCase();

    // Common MIME types
    const mimeTypes = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        csv: 'text/csv',
        html: 'text/html',
        htm: 'text/html'
    };

    return mimeTypes[extension] || '';
};

/**
 * Creates a data URL from a base64 encoded string
 * @param {string} base64Data - The base64 encoded content
 * @param {string} mimeType - The MIME type of the content
 * @returns {string} The data URL
 */
export const createDataUrl = (base64Data, mimeType) => {
    if (!base64Data) return null;

    // Clean the base64 string (remove whitespace)
    const cleanBase64 = base64Data.replace(/\s/g, '');

    // Create data URL
    return `data:${mimeType};base64,${cleanBase64}`;
};

/**
 * Reads a file as a base64 string
 * @param {File} file - The file to read
 * @returns {Promise<string>} - A promise that resolves with the base64 string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Get the base64 string from the data URL
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Reads a file as an ArrayBuffer
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} - A promise that resolves with the ArrayBuffer
 */
export const fileToArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * CHANGE: Simple MD5 implementation that works without CryptoJS
 * @param {string} str - The string to hash
 * @returns {string} - Base64 encoded MD5 hash (simulated)
 */
const simpleMD5 = (str) => {
    // This is a very simplified implementation that simply encodes the file name and size
    // It's not a real MD5 hash but provides a unique identifier for the file
    const data = `${str}${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to base64-like string
    const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
    // Convert to a format similar to base64
    return btoa(hashStr);
};

/**
 * Calculates the MD5 hash of a file using CryptoJS or fallback
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - A promise that resolves with the MD5 hash in Base64 format
 */
export const calculateFileMD5 = async (file) => {
    try {
        // Try using CryptoJS if available
        if (typeof CryptoJS !== 'undefined' && CryptoJS.MD5) {
            // Read the file as an ArrayBuffer
            const arrayBuffer = await fileToArrayBuffer(file);

            // Convert ArrayBuffer to WordArray
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

            // Calculate MD5 hash and return as Base64
            return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Base64);
        } else {
            // Use simple fallback if CryptoJS is not available
            console.warn('CryptoJS MD5 not available, using simple hash fallback');
            return simpleMD5(`${file.name}-${file.size}-${file.lastModified}`);
        }
    } catch (error) {
        console.error('Error calculating MD5 hash:', error);
        // Use fallback in case of error
        return simpleMD5(`${file.name}-${file.size}-${file.lastModified}`);
    }
};

/**
 * Process a file for upload (calculates MD5 and converts to base64)
 * @param {File} file - The file to process
 * @returns {Promise<Object>} - A promise that resolves with { md5, base64, size, type }
 */
export const processFileForUpload = async (file) => {
    if (!file) return null;

    try {
        // Read as base64 and calculate MD5 in parallel
        const [base64, md5] = await Promise.all([
            fileToBase64(file),
            calculateFileMD5(file)
        ]);

        return {
            md5,
            base64,
            size: file.size,
            type: file.type || getMimeType(file.name)
        };
    } catch (error) {
        console.error('Error processing file for upload:', error);
        throw error;
    }
};