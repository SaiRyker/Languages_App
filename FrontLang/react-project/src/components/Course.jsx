import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseById, getModulesByCourseId, getLessonsByCourseId } from '../api/userApi';

function Course() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedModules, setExpandedModules] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Course ID from URL:', courseId, 'Type:', typeof courseId);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                if (!courseId || isNaN(courseId)) {
                    throw new Error('Invalid or undefined course ID: ' + courseId);
                }

                console.log('Fetching course with ID:', courseId);
                const courseData = await getCourseById(parseInt(courseId));
                console.log('Course data fetched (raw):', courseData);
                if (!courseData || typeof courseData !== 'object') {
                    throw new Error('Invalid course data received');
                }
                setCourse(courseData);

                console.log('Fetching modules for course ID:', courseId);
                const modulesData = await getModulesByCourseId(parseInt(courseId));
                console.log('Modules data fetched (raw):', modulesData);
                if (!Array.isArray(modulesData)) {
                    throw new Error('Invalid modules data received');
                }
                setModules(modulesData);

                console.log('Fetching lessons for course ID:', courseId);
                const lessonsData = await getLessonsByCourseId(parseInt(courseId));
                console.log('Lessons data fetched (raw):', lessonsData);
                if (!Array.isArray(lessonsData)) {
                    throw new Error('Invalid lessons data received');
                }
                setLessons(lessonsData);

                setLoading(false);
            } catch (err) {
                console.error('Error in fetchData:', err.message, err.response?.data || err.response || err.stack);
                setError(`Failed to load course data: ${err.message}`);
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [courseId, navigate]);

    if (loading) return <div className="course-loading">Loading...</div>;
    if (error) return <div className="course-error">{error}</div>;
    if (!course) return <div className="course-not-found">Course not found</div>;

    const lessonsByModule = lessons.reduce((acc, lesson) => {
        if (!acc[lesson.module_id]) {
            acc[lesson.module_id] = [];
        }
        acc[lesson.module_id].push(lesson);
        return acc;
    }, {});

    const handleLessonClick = (lessonId) => {
        navigate(`/lesson/${lessonId}`);
    };

    const toggleModule = (moduleId) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    return (
        <div className="course-container">
            <div className="course-header">
                <h2>{course.course_name}</h2>
                <p>Уровень сложности: {course.diff_level || 'N/A'}</p>
                <p> Язык программирования: {course.language?.lang_name || 'N/A'}</p>
            </div>
            {modules.length > 0 ? (
                <div className="course-structure">
                    <h3>Программа курса:</h3>
                    <div className="modules-list">
                        {modules.map((module) => (
                            <div
                                key={module.id_module}
                                className={`module-card ${expandedModules[module.id_module] ? 'expanded' : ''}`}
                            >
                                <div
                                    className="module-header"
                                    onClick={() => toggleModule(module.id_module)}
                                >
                                    <span className="module-order">{module.order_number}.</span>
                                    <span className="module-name">{module.module_name}</span>
                                    <span className="module-toggle">
                                        {expandedModules[module.id_module] ? '−' : '+'}
                                    </span>
                                </div>
                                {expandedModules[module.id_module] && (
                                    <div className="module-content">
                                        {(lessonsByModule[module.id_module] || []).length > 0 ? (
                                            <ul className="lessons-list">
                                                {lessonsByModule[module.id_module].map((lesson) => (
                                                    <li key={lesson.id_lesson} className="lesson-item">
                                                        <span className="lesson-order">{lesson.order_number}.</span>
                                                        <span
                                                            className="lesson-link"
                                                            onClick={() => handleLessonClick(lesson.id_lesson)}
                                                        >
                                                            {lesson.lesson_name}
                                                        </span>
                                                        <span className="lesson-details">
                                                            (Description: {lesson.description || 'N/A'})
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="no-lessons">Доступных уроков нет</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="no-modules">Доступных модулей нет</p>
            )}
            <button className="back-button" onClick={() => navigate('/courses')}>
                Вернуться к курсам
            </button>
        </div>
    );
}

export default Course;