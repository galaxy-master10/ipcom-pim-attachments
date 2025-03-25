import axios from "axios";



const apiClient = axios.create({
    baseURL: `http://localhost:5142/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

export default apiClient;

