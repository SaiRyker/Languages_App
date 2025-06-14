import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getUserCourses} from '../api/userApi';
import '../App.css';

function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }


        const fetchCourses = async () => {
            try {
                const data = await getUserCourses();
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
        console.log('Navigating to courseId:', course_id, 'Type:', typeof course_id); // Отладка
        if (course_id) {
            navigate(`/course/${course_id}`);
        } else {
            console.error('courseId is undefined');
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!courses || courses.length === 0) return <div>No courses available</div>;

    return (
        <div className="courses-container">
            <div className="courses-wrapper">
                <h2>Мои курсы</h2>
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