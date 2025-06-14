import { Link, useLocation, useParams } from 'react-router-dom';
import '../App.css';

function Sidebar() {
    const location = useLocation();
    const { courseId } = useParams(); // Получаем courseId из URL для страницы /course/:courseId

    // Определяем активную страницу для выделения
    const isProfileActive = location.pathname === '/profile';
    const isCoursesActive = location.pathname === '/courses';
    const isRegisterActive = location.pathname === '/register';

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
                <Link
                    to="/register"
                    className={`sidebar-link ${isRegisterActive ? 'active' : ''}`}
                >
                    Зарегистрировать пользователя
                </Link>
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