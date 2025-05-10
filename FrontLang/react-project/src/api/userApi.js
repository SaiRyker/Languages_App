import axios from 'axios';

const createApiClient = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: '/api',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

export const getUserProfile = async () => {
    const apiClient = createApiClient();
    const response = await apiClient.get('/users/profile');
    return response.data;
};

export const getUserGroup = async () => {
    const apiClient = createApiClient();
    const response = await apiClient.get('/users/profile/group');
    return response.data;
};

export const getUserCourses = async () => {
    const apiClient = createApiClient();
    const response = await apiClient.get('/users/profile/courses');
    return response.data;
}