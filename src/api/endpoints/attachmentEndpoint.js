import apiClient from "../config/axiosConfig";


export const attachmentEndpointApi = {
    getAll: (filter, pageNumber = 1, pageSize = 10) => {
        const processedFilter = { ...filter };
        for (const key in processedFilter) {
            if (typeof processedFilter[key] === 'boolean') {
                processedFilter[key] = processedFilter[key].toString();
            }
        }

        return apiClient.get('/attachments', {
            params: {
                ...processedFilter,
                pageNumber,
                pageSize
            },
            paramsSerializer: params => {
                const searchParams = new URLSearchParams();

                for (const key in params) {
                    if (params[key] !== null && params[key] !== undefined) {
                        searchParams.append(key, params[key]);
                    }
                }

                return searchParams.toString();
            }
        });
    },


    get: (id) => apiClient.get(`/attachments/${id}`),

    update: (id, data) => apiClient.put(`/attachments/${id}`, data),
    delete: (id) => apiClient.delete(`/attachments/${id}`),

    getCategories: () => apiClient.get('/attachments/categories'),

    getCountries: () => apiClient.get('/attachments/countries'),

    getLanguages: () => apiClient.get('/attachments/languages'),
}

