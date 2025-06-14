import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
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
