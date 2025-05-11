import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLessonById, getMaterialsByLessonId } from '../api/userApi';

function Lesson() {
    const { lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                if (!lessonId || isNaN(lessonId)) {
                    throw new Error('Invalid or undefined lesson ID: ' + lessonId);
                }

                console.log('Fetching lesson with ID:', lessonId);
                const lessonData = await getLessonById(parseInt(lessonId));
                console.log('Lesson data fetched:', lessonData);
                if (!lessonData || typeof lessonData !== 'object') {
                    throw new Error('Invalid lesson data received');
                }

                // Загрузка материалов только для уроков теории
                if (lessonData.lesson_type === 'теория') {
                    console.log('Fetching materials for lesson ID:', lessonId);
                    const materialsData = await getMaterialsByLessonId(parseInt(lessonId));
                    console.log('Materials data fetched:', materialsData);
                    if (!Array.isArray(materialsData)) {
                        throw new Error('Invalid materials data received');
                    }
                    setMaterials(materialsData);
                } else {
                    console.log('Lesson type is not "теория", skipping materials fetch. Lesson type:', lessonData.lesson_type);
                }

                setLesson(lessonData);
                setLoading(false);
            } catch (err) {
                console.error('Error in fetchData:', err.message, err.response?.data || err.response || err.stack);
                setError(`Failed to load lesson content: ${err.message}`);
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [lessonId, navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!lesson) return <div>Lesson not found</div>;

    const textMaterials = materials.filter((material) => material.material_type === 'Текст');
    const mediaMaterials = materials.filter(
        (material) => material.material_type === 'Видео' || material.material_type === 'Аудио'
    );

    const handleBackToCourse = () => {
        console.log('Navigating back to course, course_id:', lesson.module?.course_id);
        if (lesson.module?.course_id) {
            navigate(`/course/${lesson.module.course_id}`);
        } else {
            console.error('course_id is undefined, navigating to /courses');
            navigate('/courses');
        }
    };

    return (
        <div>
            <h2>{lesson.lesson_name}</h2>
            {textMaterials.length > 0 && (
                <div>
                    <h3>Text Content</h3>
                    {textMaterials.map((material, index) => (
                        <div key={index}>
                            <p>{material.content}</p>
                        </div>
                    ))}
                </div>
            )}
            {mediaMaterials.length > 0 && (
                <div>
                    <h3>Media Content</h3>
                    {mediaMaterials.map((material, index) => (
                        <div key={index}>
                            {material.material_type === 'Видео' && (
                                <div>
                                    <p>Video URL: {material.url}</p>
                                    <iframe
                                        width="600"
                                        height="340"
                                        src={material.url}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Rutube Video"
                                    ></iframe>
                                </div>
                            )}
                            {material.material_type === 'Аудио' && (
                                <div>
                                    <audio controls>
                                        <source src={material.url} type="audio/mp3"/>
                                        Your browser does not support the audio tag.
                                    </audio>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {materials.length === 0 && <p>No materials available for this lesson.</p>}
            <button onClick={handleBackToCourse}>Back to Course</button>
        </div>
    );
}

export default Lesson;