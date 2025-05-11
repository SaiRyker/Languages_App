import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseByName, getModulesByCourseId, getLessonsByModuleId, createLesson } from '../api/userApi';

function Modules() {
    const { courseName } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newLesson, setNewLesson] = useState({ module_id: null, lesson_name: '', order_number: '', description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const courseData = await getCourseByName(courseName);
                const modulesData = await getModulesByCourseId(courseData.id_course);
                setCourse(courseData);
                setModules(modulesData);

                // Загружаем уроки для каждого модуля
                const lessonsData = {};
                for (const module of modulesData) {
                    const lessonData = await getLessonsByModuleId(module.id_module);
                    lessonsData[module.id_module] = lessonData;
                }
                setLessons(lessonsData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load modules or lessons');
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [courseName, navigate]);

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        try {
            const dto = {
                module_id: newLesson.module_id,
                lesson_name: newLesson.lesson_name,
                order_number: parseInt(newLesson.order_number),
                description: newLesson.description || '',
            };
            const createdLesson = await createLesson(dto);
            setLessons((prev) => ({
                ...prev,
                [newLesson.module_id]: [...(prev[newLesson.module_id] || []), createdLesson],
            }));
            setNewLesson({ module_id: null, lesson_name: '', order_number: '', description: '' });
        } catch (err) {
            setError('Failed to create lesson');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div>
            <h2>Modules for {course.course_name}</h2>
            {modules.length > 0 ? (
                <ul>
                    {modules.map((module, index) => (
                        <li key={index}>
                            {module.module_name} (Order: {module.order_number})
                            <h3>Lessons:</h3>
                            <ul>
                                {(lessons[module.id_module] || []).map((lesson, lessonIndex) => (
                                    <li key={lessonIndex}>
                                        {lesson.lesson_name} (Order: {lesson.order_number}, Description: {lesson.description})
                                    </li>
                                ))}
                            </ul>
                            <form onSubmit={handleCreateLesson}>
                                <select
                                    value={newLesson.module_id || ''}
                                    onChange={(e) => setNewLesson({ ...newLesson, module_id: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="" disabled>Select Module</option>
                                    {modules.map((m) => (
                                        <option key={m.id_module} value={m.id_module}>
                                            {m.module_name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={newLesson.lesson_name}
                                    onChange={(e) => setNewLesson({ ...newLesson, lesson_name: e.target.value })}
                                    placeholder="Lesson Name"
                                    required
                                />
                                <input
                                    type="number"
                                    value={newLesson.order_number}
                                    onChange={(e) => setNewLesson({ ...newLesson, order_number: e.target.value })}
                                    placeholder="Order Number"
                                    required
                                />
                                <input
                                    type="text"
                                    value={newLesson.description}
                                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                                    placeholder="Description (optional)"
                                />
                                <button type="submit">Create Lesson</button>
                            </form>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No modules available</p>
            )}
            <button onClick={() => navigate('/courses')}>Back to Courses</button>
        </div>
    );
}

export default Modules;