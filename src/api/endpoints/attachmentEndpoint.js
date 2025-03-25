import apiClient from "../config/axiosConfig";


export const attachmentEndpointApi = {
    getAll: (filter,pageNumber = 1, pageSize = 10) =>
        apiClient.get('/attachments', {
            params: {
                ...filter,
                pageNumber,
                pageSize
            }
        }),

    get: (id) => apiClient.get(`/attachments/${id}`),
}