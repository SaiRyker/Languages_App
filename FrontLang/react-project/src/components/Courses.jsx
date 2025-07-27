import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCourses, getTeacherCourses } from '../api/userApi';
import '../App.css';

function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Функция для декодирования JWT-токена
    const getUserRoles = () => {
        const token = localStorage.getItem('token');
        if (!token) return [];

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            console.log('JWT payload:', payload); // Отладка
            return payload.roles || [];
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return [];
        }
    };

    // Проверяем роли пользователя
    const roles = getUserRoles();
    const isAdminOrTeacher = roles.some(
        (role) => role.role_name === 'admin' || role.role_name === 'teacher'
    );
    const isStudent = roles.some((role) => role.role_name === 'student');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found, redirecting to login');
            navigate('/login');
            return;
        }

        const fetchCourses = async () => {
            try {
                let data;
                console.log('User roles:', roles.map((r) => r.role_name)); // Отладка
                if (isAdminOrTeacher) {
                    console.log('Fetching teacher courses');
                    data = await getTeacherCourses();
                } else if (isStudent) {
                    console.log('Fetching student courses');
                    data = await getUserCourses();
                } else {
                    throw new Error('No valid role found for user');
                }

                console.log('Fetched courses:', data); // Отладка
                setCourses(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Не удалось загрузить курсы');
                setLoading(false);
                if (err.response?.status === 401) {
                    console.warn('Unauthorized, redirecting to login');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchCourses();
    }, [navigate, isAdminOrTeacher, isStudent]);

    const handleCourseClick = (course_id) => {
        console.log('Navigating to courseId:', course_id, 'Type:', typeof course_id);
        if (course_id && !isNaN(course_id)) {
            navigate(`/course/${course_id}`);
        } else {
            console.error('Invalid courseId:', course_id);
        }
    };

    if (loading) return <div className="courses-loading">Загрузка...</div>;
    if (error) return <div className="courses-error">{error}</div>;
    if (!courses || courses.length === 0) {
        return (
            <div className="courses-container">
                <div className="courses-wrapper">
                    <h2>Мои курсы</h2>
                    <div className="alert alert-warning">
                        <strong>Внимание!</strong> На данный момент у вас нет доступа ни к одному курсу.
                    </div>
                    {isAdminOrTeacher && (
                        <button
                            className="create-course-button"
                            onClick={() => navigate('/courses/create-course')}
                        >
                            Создать курс
                        </button>
                    )}
                    <button className="back-button" onClick={() => navigate('/profile')}>
                        Вернуться в профиль
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="courses-container">
            <div className="courses-wrapper">
                <h2>Мои курсы</h2>
                {isAdminOrTeacher && (
                    <button
                        className="create-course-button"
                        onClick={() => navigate('/courses/create-course')}
                    >
                        Создать курс
                    </button>
                )}
                <div className="courses-list">
                    {courses.map((course) => (
                        <div
                            key={course.id_course}
                            className="course-card"
                            onClick={() => handleCourseClick(course.id_course)}
                        >
                            <h3 className="course-title">{course.course_name}</h3>
                            <p className="course-details">
                                Уровень сложности: {course.diff_level || 'Не указан'}
                            </p>
                            <p className="course-details">
                                Язык программирования: {course.language?.lang_name || 'Не указан'}
                            </p>
                        </div>
                    ))}
                </div>
                <button className="back-button" onClick={() => navigate('/profile')}>
                    Вернуться в профиль
                </button>
            </div>
        </div>
    );
}

export default Courses;