// src/utilities/fileUtils.js

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