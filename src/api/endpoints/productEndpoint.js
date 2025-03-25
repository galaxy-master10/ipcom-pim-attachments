import apiClient from "../config/axiosConfig";


export const productEndpointApi = {
    getAll: (filter,pageNumber = 1, pageSize = 10) =>
        apiClient.get('/products', {
            params: {
                ...filter,
                pageNumber,
                pageSize
            }
        }),

    get: (id) => apiClient.get(`/products/${id}`),
}