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
    const response = await apiClient.get('/users/profile/groups');
    return response.data;
};

export const getUserCourses = async () => {
    const apiClient = createApiClient();
    const response = await apiClient.get('/users/profile/courses');
    return response.data;
}

export const getCourseByName = async (courseName) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/courses/name/${courseName}`);
    return response.data;
};

export const getCourseById = async (courseId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
};

export const getModulesByCourseId = async (courseId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/cmodules/course/${courseId}`);
    return response.data;
};

export const createLesson = async (dto) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/lessons', dto);
    return response.data;
};

export const getLessonsByCourseId = async (courseId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/lessons/course/${courseId}`);
    return response.data;
};

export const getLessonsByModuleId = async (moduleId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/lessons/module/${moduleId}`);
    return response.data;
};

export const getMaterialsByLessonId = async (lessonId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/lmaterials/${lessonId}`);
    return response.data;
};

export const getLessonById = async (lessonId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/lessons/${lessonId}`);
    return response.data;
};

export const getTestTaskByLessonId = async (lessonId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/tests/lesson/${lessonId}`);
    return response.data;
};

// Новый метод для сохранения решения
export const saveUserSolution = async (testTaskId, userId, userAnswer) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/tsolutions', {
        testTaskId,
        userId,
        userAnswer,
    });
    return response.data;
};

// Новый метод для получения решения
export const getUserSolution = async (testTaskId, userId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/tsolutions/${testTaskId}/${userId}`);
    return response.data;
};

// Новый метод для получения всех решений пользователя
export const getUserSolutionsByUserId = async (userId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/tsolutions/user/${userId}`);
    return response.data;
};