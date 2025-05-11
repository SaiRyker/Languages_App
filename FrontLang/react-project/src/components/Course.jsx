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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!course) return <div>Course not found</div>;

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

    return (
        <div>
            <h2>{course.course_name}</h2>
            <p>Level: {course.diff_level || 'N/A'}, Language: {course.language?.lang_name || 'N/A'}</p>
            {modules.length > 0 ? (
                <div>
                    <h3>Course Structure:</h3>
                    <ul>
                        {modules.map((module, index) => (
                            <li key={index}>
                                <strong>{module.module_name} (Order: {module.order_number})</strong>
                                {(lessonsByModule[module.id_module] || []).length > 0 ? (
                                    <ul>
                                        {lessonsByModule[module.id_module].map((lesson, lessonIndex) => (
                                            <li key={lessonIndex}>
                                                <span
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: 'blue',
                                                        textDecoration: 'underline'
                                                    }}
                                                    onClick={() => handleLessonClick(lesson.id_lesson)}
                                                >
                                                {lesson.lesson_name}
                                                    </span>{' '}
                                                    (Order: {lesson.order_number}, Description: {lesson.description || 'N/A'})
                                            </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <p>No lessons available</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No modules available</p>
            )}
            <button onClick={() => navigate('/courses')}>Back to Courses</button>
        </div>
    );
}

export default Course;