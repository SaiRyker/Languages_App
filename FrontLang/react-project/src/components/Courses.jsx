import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCourses } from '../api/userApi';

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!courses || courses.length === 0) return <div>No courses available</div>;

    return (
        <div>
            <h2>My Courses</h2>
            <ul>
                {courses.map((course, index) => (
                    <li key={index}>
                        {course.course_name} (Level: {course.diff_level}, Language: {course.language?.lang_name || 'N/A'})
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate('/profile')}>Back to Profile</button>
        </div>
    );
}

export default Courses;