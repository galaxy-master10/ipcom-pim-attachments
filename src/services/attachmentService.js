import { attachmentEndpointApi } from "../api/endpoints/attachmentEndpoint.js";

export class AttachmentService {
    async getAllAttachements(filters = {}, pageNumber = 1, pageSize = 10) {
        try {
            pageNumber = Number(pageNumber);
            pageSize = Number(pageSize);

            // Clean up the filters object by removing empty values
            const cleanFilters = {};
            Object.keys(filters).forEach(key => {
                const value = filters[key];
                if (value !== null && value !== undefined && value !== '') {
                    cleanFilters[key] = value;
                }
            });

            const response = await attachmentEndpointApi.getAll(cleanFilters, pageNumber, pageSize);
            return {
                data: response.data.data,
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalRecords: response.data.totalRecords,
                totalPages: response.data.totalPages
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
}