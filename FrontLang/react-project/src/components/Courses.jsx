import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getUserCourses} from '../api/userApi';
import {getTeacherCourses } from '../api/userApi';
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
            return payload.roles || [];
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return [];
        }
    };

    // Проверяем, является ли пользователь администратором или преподавателем
    const isAdminOrTeacher = getUserRoles().some(
        (role) => role.role_name === 'admin' || role.role_name === 'teacher'
    );


    const isTeacher = getUserRoles().some(
        (role) => role.role_name === 'teacher'
    );

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }


        const fetchCourses = async () => {
            try {
                const data = await getTeacherCourses();
                console.log('Fetched courses:', data); // Отладка
                setCourses(data);
                setLoading(false);
                console.log('Courses data:', data);
            } catch (err) {
                setError('Failed to load courses');
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchCourses();
    }, [navigate]);

    const handleCourseClick = (course_id) => {
        console.log('Navigating to courseId:', course_id, 'Type:', typeof course_id);
        if (course_id && !isNaN(course_id)) {
            navigate(`/course/${course_id}`);
        } else {
            console.error('Invalid courseId:', course_id);
        }
    };


    if (loading) return <div className="courses-loading">Loading...</div>;
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
                                Уровень сложности: {course.diff_level}
                            </p>
                            <p className="course-details">
                                Язык программирования: {course.language?.lang_name || 'N/A'}
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