// src/utilities/utilities.js
export const countAttachmentsExpiringWithinDays = (days, attachments) => {
    if (!attachments.value.$values) return 0;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return attachments.value.$values.filter(attachment => {
        if (!attachment.expiryDate) return false;
        const expiryDate = new Date(attachment.expiryDate);
        return expiryDate <= futureDate && expiryDate >= today;
    }).length;
};

export const getFileIcon = (filename) => {
    if (!filename) return 'mdi-file-question-outline';

    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
        case 'pdf':
            return 'mdi-file-pdf-box';
        case 'docx':
        case 'doc':
            return 'mdi-file-word-box';
        case 'xlsx':
        case 'xls':
            return 'mdi-file-excel-box';
        case 'pptx':
        case 'ppt':
            return 'mdi-file-powerpoint-box';
        case 'jpg':
        case 'jpeg':
        case 'png':
            return 'mdi-file-image-box';
        default:
            return 'mdi-file-document-outline';
    }
}

export const getStatusColor = (status) => {
    switch (status) {
        case 0:
            return 'grey';
        case 1:
            return 'error';
        case 2:
            return 'deep-orange';
        case 3:
            return 'amber-darken-2';
        case 4:
            return 'success';
        default:
            return 'grey';
    }
}

export const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const getStatusAndLevel = (expiryDate) => {
    if (!expiryDate) return { status: 'Active', statusLevel: 4 };

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysToExpiry <= 0) return { status: 'Verlopen', statusLevel: 0 };
    if (daysToExpiry <= 7) return { status: `Vervalt binnen ${daysToExpiry} dagen`, statusLevel: 1 };
    if (daysToExpiry <= 14) return { status: `Vervalt binnen ${daysToExpiry} dagen`, statusLevel: 2 };
    if (daysToExpiry <= 30) return { status: `Vervalt binnen ${daysToExpiry} dagen`, statusLevel: 3 };

    return { status: 'Active', statusLevel: 4 };
};