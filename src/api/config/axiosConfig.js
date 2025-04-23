import axios from "axios";
import authService from "@/auth/authService.js";

let apiKey = null;
let apiKeyExpirationTime = null;
const API_KEY_REFRESH_BUFFER = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BASE_URL = 'https://localhost:5143/api';

const clearApiKey = () => {
    apiKey = null;
    apiKeyExpirationTime = null;
};

const getApiKey = async () => {
    const currentTime = Date.now();

    if (apiKey && apiKeyExpirationTime && currentTime < apiKeyExpirationTime) {
        return apiKey;
    }

    try {
        const token = await authService.getTokenSilently();

        if (!token) {
            throw new Error('No token available');
        }

        if (apiKey) {
            try {
                const validateResponse = await fetch(`${BASE_URL}/validate`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (validateResponse.ok) {
                    const validationData = await validateResponse.json();

                    if (validationData.isValid && validationData.remainingDays > 1) {
                        apiKeyExpirationTime = new Date(validationData.expiresAt).getTime() - API_KEY_REFRESH_BUFFER;
                        return apiKey;
                    }
                }
            } catch (validateError) {
                console.log('Validation error, will request a new API key');
                console.error(validateError);
            }
        }


        const response = await fetch(`${BASE_URL}/apikey`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            const generateResponse = await fetch(`${BASE_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!generateResponse.ok) {
                throw new Error(`Failed to generate API key: ${generateResponse.status}`);
            }

            const data = await generateResponse.json();
            apiKey = data.apiKey;
            apiKeyExpirationTime = new Date(data.expiresAt).getTime() - API_KEY_REFRESH_BUFFER;
            return apiKey;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        apiKey = data.apiKey;
        apiKeyExpirationTime = new Date(data.expiresAt).getTime() - API_KEY_REFRESH_BUFFER;
        return apiKey;
    } catch (error) {
        clearApiKey();
        throw error;
    }
};


const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});



apiClient.interceptors.request.use(
    async (config) => {
        try {

            const token = await authService.getTokenSilently();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            if (!config.url.includes('/apikey')) {
                const key = await getApiKey();
                if (key) {
                    config.headers['X-API-Key'] = key;
                }
            }

            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;


            if (error.response?.data?.includes('API Key is expired')) {

                clearApiKey();

                await getApiKey();

                return apiClient(originalRequest);
            }

            try {
                clearApiKey();

                await authService.getToken();

                await getApiKey();

                return apiClient(originalRequest);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    }
);

export {
    clearApiKey,
    getApiKey,
    apiClient
}
export default apiClient;

