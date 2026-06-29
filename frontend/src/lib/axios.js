import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// Optional: You can add interceptors here to automatically attach the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('todoToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;