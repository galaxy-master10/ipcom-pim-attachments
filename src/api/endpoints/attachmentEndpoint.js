import apiClient from "../config/axiosConfig";


export const attachmentEndpointApi = {
    getAll: (filter, pageNumber = 1, pageSize = 10) => {
        // Convert boolean values to strings for proper query parameter handling
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
                // Convert params object to query string manually if needed
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
}

