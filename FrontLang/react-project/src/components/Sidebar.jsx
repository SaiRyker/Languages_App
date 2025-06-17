import { Link, useLocation, useParams } from 'react-router-dom';
import '../App.css';

function Sidebar() {
    const location = useLocation();
    const { courseId } = useParams(); // Получаем courseId из URL для страницы /course/:courseId

    // Функция для декодирования JWT-токена
    const getUserRoles = () => {
        const token = localStorage.getItem('token');
        if (!token) return [];

        try {
            // Декодируем payload токена (base64)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            return payload.roles || [];
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return [];
        }
    };

    // Проверяем, является ли пользователь администратором
    const isAdmin = getUserRoles().some((role) => role.role_name === 'admin');

    // Проверяем, является ли пользователь администратором или преподавателем
    const isAdminOrTeacher = getUserRoles().some(
        (role) => role.role_name === 'admin' || role.role_name === 'teacher'
    );


    // Определяем активную страницу для выделения
    const isProfileActive = location.pathname === '/profile';
    const isCoursesActive = location.pathname === '/courses';
    const isRegisterActive = location.pathname === '/register';
    const isCourseActive = location.pathname === `/course/${courseId}`;

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">
                <Link
                    to="/profile"
                    className={`sidebar-link ${isProfileActive ? 'active' : ''}`}
                >
                    Профиль
                </Link>
                <Link
                    to="/courses"
                    className={`sidebar-link ${isCoursesActive ? 'active' : ''}`}
                >
                    Мои курсы
                </Link>
                {isAdmin && (
                    <Link
                        to="/register"
                        className={`sidebar-link ${isRegisterActive ? 'active' : ''}`}
                    >
                        Зарегистрировать пользователя
                    </Link>
                )}
                {isAdminOrTeacher && (
                    <Link
                        to="/groups"
                        className={`sidebar-link ${location.pathname === '/groups' ? 'active' : ''}`}
                    >
                        Группы
                    </Link>
                )}
                {courseId && (
                    <Link
                        to={`/course/${courseId}`}
                        className={`sidebar-link ${isCourseActive ? 'active' : ''}`}
                    >
                        Структура курса
                    </Link>
                )}
            </nav>
        </div>
    );
}

export default Sidebar;