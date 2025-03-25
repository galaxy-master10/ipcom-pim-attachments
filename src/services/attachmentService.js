import {attachmentEndpointApi} from "../api/endpoints/attachmentEndpoint.js";

export class AttachmentService {
    async getAllAttachements(filter, pageNumber, pageSize) {
        try {
            pageNumber = Number(pageNumber);
            pageSize = Number(pageSize);
            const response = await attachmentEndpointApi.getAll(filter, pageNumber, pageSize);
            return {
                data: response.data.data,
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalRecords: response.data.totalRecords,
                totalPages: response.data.totalPages

            };
        } catch (error) {
            throw error;

        }
    }

    async getAttachement(id) {
        try {
            const response = await attachmentEndpointApi.get(id);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}