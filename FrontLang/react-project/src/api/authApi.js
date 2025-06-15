import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Предполагается, что токен сохранён в localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (credentials) => {
    console.log(credentials);
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    console.log(userData)
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
};