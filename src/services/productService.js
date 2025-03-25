import {productEndpointApi} from "../api/endpoints/productEndpoint.js";

export class ProductService {
    async getAllProducts(filter, pageNumber, pageSize) {
        try {
            pageNumber = Number(pageNumber);
            pageSize = Number(pageSize);
            const response = await productEndpointApi.getAll(filter, pageNumber, pageSize);
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

    async getProduct(id) {
        try {
            const response = await productEndpointApi.get(id);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}