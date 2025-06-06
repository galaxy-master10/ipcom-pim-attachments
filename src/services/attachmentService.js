import { attachmentEndpointApi } from "../api/endpoints/attachmentEndpoint.js";

export class AttachmentService {
    async getAllAttachements(filters = {}, pageNumber = 1, pageSize = 10) {
        try {
            pageNumber = Number(pageNumber);
            pageSize = Number(pageSize);

            const formattedFilters = { ...filters };

            if (formattedFilters.expiryDateFrom) {
                formattedFilters.expiryDateFrom = new Date(formattedFilters.expiryDateFrom).toISOString().split('T')[0];
            }

            if (formattedFilters.expiryDateTo) {
                formattedFilters.expiryDateTo = new Date(formattedFilters.expiryDateTo).toISOString().split('T')[0];
            }

            const cleanFilters = {};
            Object.keys(formattedFilters).forEach(key => {
                const value = formattedFilters[key];
                if (value !== null && value !== undefined && value !== '') {
                    // Make sure boolean values are passed properly
                    if (typeof value === 'boolean') {
                        cleanFilters[key] = value;
                    } else {
                        cleanFilters[key] = value;
                    }
                }
            });

            const response = await attachmentEndpointApi.getAll(cleanFilters, pageNumber, pageSize);
            return {
                data: response.data.data,
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalRecords: response.data.totalRecords,
                totalPages: response.data.totalPages,
                expiringWithin7Days: response.data.expiringWithin7Days,
                expiringWithin30Days: response.data.expiringWithin30Days,
            };
        } catch (error) {
            console.error('Error in AttachmentService.getAllAttachements:', error);
            throw error;
        }
    }

    async getAttachement(id) {
        try {
            const response = await attachmentEndpointApi.get(id);
            return response.data;
        } catch (error) {
            console.error('Error in AttachmentService.getAttachement:', error);
            throw error;
        }
    }

    async updateAttachment(attachmentData) {
        try {
            const response = await attachmentEndpointApi.update(attachmentData.id, attachmentData);
            return response.data;
        } catch (error) {
            console.error('Error in AttachmentService.updateAttachment:', error);
            throw error;
        }
    }

    async deleteAttachment(id) {
        try {
            const response = await attachmentEndpointApi.delete(id);
            return response.data;
        } catch (error) {
            console.error('Error in AttachmentService.deleteAttachment:', error);
            throw error;
        }
    }

    async getCategories() {
        try {
            const response = await attachmentEndpointApi.getCategories();
            return response.data;
        } catch (error) {
            console.error('Error in AttachmentService.getCategories:', error);
            throw error;
        }
    }

    async getCountries() {
        try {
            const response = await attachmentEndpointApi.getCountries();
            return response.data;
        } catch (error) {
            console.error('Error in AttachmentService.getCountries:', error);
            throw error;
        }
    }

    async getLanguages() {
        try {
            const response = await attachmentEndpointApi.getLanguages();
            return response.data;
        } catch (error) {
            console.error('Error in AttachmentService.getLanguages:', error);
            throw error;
        }
    }


}