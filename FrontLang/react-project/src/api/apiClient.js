import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api', // Используем прокси, настроенный в vite.config.js
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllCourses = async () => {
    const response = await apiClient.get('/courses');
    console.log(response);
    return response.data;
};

export const getCoursesByLanguage = async (langId) => {
    const response = await apiClient.get(`/courses/language/${langId}`);
    return response.data;
};

// Добавьте другие методы API по мере необходимости