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

export const getLanguageById = async (language_id) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/languages/${language_id}`);
    return response.data;
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
};

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

export const saveUserSolution = async (testTaskId, userId, userAnswer) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/tsolutions', {
        testTaskId,
        userId,
        userAnswer,
    });
    return response.data;
};

export const getUserSolution = async (testTaskId, userId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/tsolutions/${testTaskId}/${userId}`);
    return response.data;
};

export const getUserSolutionsByUserId = async (userId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/tsolutions/user/${userId}`);
    return response.data;
};

export const getPrTaskByLessonId = async (lesson_id) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/practicals/lesson/${lesson_id}`);
    return response.data;
};

export const updatePrTask = async (taskId, data) => {
    const apiClient = createApiClient();
    const response = await apiClient.put(`/practicals/${taskId}`, data);
    return response.data;
};

export const getUserPrSolution = async (prTask_id, student_id) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/prsolutions/${prTask_id}/${student_id}`);
    return response.data;
};

export const runCode = async (code, lang_name) => {
    const apiClient = createApiClient();
    try {
        const response = await apiClient.post('/practicals/run-code', {
            code,
            lang_name,
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to run code: ' + (error.response?.statusText || error.message));
    }
};

export const saveUserPrSolution = async (prTaskId, userId, codeUser, lang_name) => {
    const apiClient = createApiClient();
    const normalizedCode = codeUser.trim().replace(/\n\s*/g, '\n');
    const response = await apiClient.post('/prsolutions/user-submit', {
        prTaskId: prTaskId,
        studentId: userId,
        code: normalizedCode,
        lang_name,
    });
    return response.data;
};

export const getTeacherCourses = async () => {
    const apiClient = createApiClient();
    const response = await apiClient.get('/courses/teacher-courses');
    return response.data;
};

export const getUserById = async (user_id) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/users/${user_id}`);
    return response.data;
};

export const createModule = async (moduleData) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/cmodules', moduleData);
    return response.data;
};

export const updateModule = async (moduleId, moduleData) => {
    const apiClient = createApiClient();
    const response = await apiClient.put(`/cmodules/${moduleId}`, moduleData);
    return response.data;
};

export const deleteModule = async (moduleId) => {
    const apiClient = createApiClient();
    const response = await apiClient.delete(`/cmodules/${moduleId}`);
    return response.data;
};

export const updateLesson = async (lessonId, lessonData) => {
    const apiClient = createApiClient();
    const response = await apiClient.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
};

export const deleteLesson = async (lessonId) => {
    const apiClient = createApiClient();
    const response = await apiClient.delete(`/lessons/${lessonId}`);
    return response.data;
};

export const updateModuleOrder = async (courseId, moduleOrder) => {
    const apiClient = createApiClient();
    const response = await apiClient.put(`/cmodules/course/${courseId}/order`, { moduleOrder });
    return response.data;
};

export const updateLessonOrder = async (moduleId, lessonOrder) => {
    const apiClient = createApiClient();
    const response = await apiClient.put(`/lessons/cmodule/${moduleId}/order`, { lessonOrder });
    return response.data;
};

export const getAllGroups = async (curatedOnly = false, userId = null) => {
    const apiClient = createApiClient();
    try {
        console.log('Отправка запроса getAllGroups:', { curatedOnly, userId });
        const response = await apiClient.get('/groups', {
            params: {
                curatedOnly,
                ...(userId ? { userId } : {}), // Передаём userId в query
            },
        });
        console.log('Ответ getAllGroups:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка getAllGroups:', error.response?.data || error.message);
        throw error;
    }
};

export const addCourseToGroup = async (dto) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/groups/add-courses', dto);
    return response.data;
};

export const createGroup = async (dto) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/groups', dto);
    return response.data;
};

export const addStudentsToGroup = async (dto) => {
    const apiClient = createApiClient();
    const response = await apiClient.post('/groups/add-students', dto);
    return response.data;
};

export const getCoursesByCreatorId = async (creatorId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/courses/creator/${creatorId}`);
    return response.data;
};

export const getGroupStudents = async (groupId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/groups/${groupId}/students`);
    return response.data;
};

export const getGroupCourses = async (groupId) => {
    const apiClient = createApiClient();
    const response = await apiClient.get(`/groups/${groupId}/courses`);
    return response.data;
};

export const getAllStudents = async () => {
    const apiClient = createApiClient();
    try {
        console.log('Запрос getAllStudents');
        const response = await apiClient.get('/users/students');
        console.log('Ответ getAllStudents:', response.data);
        const students = Array.isArray(response.data) ? response.data : [];
        return students;
    } catch (error) {
        console.error('Ошибка getAllStudents:', error.response?.data || error.message);
        throw error;
    }
};

export const removeStudentsFromGroup = async (dto) => {
    const apiClient = createApiClient();
    try {
        console.log('Запрос removeStudentsFromGroup:', dto);
        const response = await apiClient.post('/groups/remove-students', dto);
        console.log('Ответ removeStudentsFromGroup:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка removeStudentsFromGroup:', error.response?.data || error.message);
        throw error;
    }
};

export const removeCoursesFromGroup = async (dto) => {
    const apiClient = createApiClient();
    try {
        console.log('Запрос removeCoursesFromGroup:', dto);
        const response = await apiClient.post('/groups/remove-courses', dto);
        console.log('Ответ removeCoursesFromGroup:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка removeCoursesFromGroup:', error.response?.data || error.message);
        throw error;
    }
};