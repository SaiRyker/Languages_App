import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getLessonById,
    getMaterialsByLessonId,
    getTestTaskByLessonId,
    getUserProfile, getUserSolution,
    saveUserSolution
} from '../api/userApi';

function Lesson() {
    const { lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [testTask, setTestTask] = useState(null);
    const [userAnswer, setUserAnswer] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [solution, setSolution] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log(token)
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

                setLesson(lessonData);

                if (lessonData.lesson_type === 'теория') {
                    console.log('Fetching materials for lesson ID:', lessonId);
                    const materialsData = await getMaterialsByLessonId(parseInt(lessonId));
                    console.log('Materials data fetched:', materialsData);
                    if (!Array.isArray(materialsData)) {
                        throw new Error('Invalid materials data received');
                    }
                    setMaterials(materialsData);
                } else if (lessonData.lesson_type === 'тест') {
                    console.log('Fetching test task for lesson ID:', lessonId);
                    const testTaskData = await getTestTaskByLessonId(parseInt(lessonId));
                    console.log('Test task data fetched:', testTaskData);
                    if (!testTaskData || typeof testTaskData !== 'object') {
                        throw new Error('Invalid test task data received');
                    }
                    setTestTask(testTaskData);

                    const userData = await getUserProfile();
                    const userId = userData.id_user;
                    console.log(userId)

                    // Получаем последнюю запись решения
                    const solutionData = await getUserSolution(testTaskData.id_t_task, userId);
                    setSolution(solutionData || { status: 'Не начат', score: 0, answer: [] }); // По умолчанию, если решения нет

                } else {
                    console.log('Lesson type is not "теория" or "тест", skipping additional fetch. Lesson type:', lessonData.lesson_type);
                }

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

    const handleAnswerChange = (answer, isMultipleChoice) => (e) => {
        if (isMultipleChoice) {
            // Для checkbox (множественный выбор)
            if (e.target.checked) {
                setUserAnswer((prev) => [...prev, answer]);
            } else {
                setUserAnswer((prev) => prev.filter((a) => a !== answer));
            }
        } else {
            // Для radio (один выбор)
            setUserAnswer([answer]);
        }
    };

    const handleSubmitAnswer = async () => {
        try {
            const userData = await getUserProfile();
            const userId = userData.id_user;

            const result = await saveUserSolution(testTask.id_t_task, userId, userAnswer);
            setSolution(result)
            alert(`Test ${result.status.toLowerCase()}`);
        } catch (err) {
            console.error('Error submitting answer:', err);
            setError('Failed to save answer');
        }
    };

    return (
        <div>
            <h2>{lesson.lesson_name}</h2>
            {lesson.lesson_type === 'теория' && (
                <>
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
                                                <source src={material.url} type="audio/mp3" />
                                                Your browser does not support the audio tag.
                                            </audio>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {materials.length === 0 && <p>No materials available for this lesson.</p>}
                </>
            )}
            {lesson.lesson_type === 'тест' && testTask && (
                <div>
                    <h3>Test Task</h3>
                    <p><strong>Task Name:</strong> {testTask.task_name}</p>
                    <p><strong>Description:</strong> {testTask.description}</p>
                    {Array.isArray(testTask.task_answers) && testTask.task_answers.length > 0 && (
                        <div>
                            <h4>Options:</h4>
                            {testTask.task_answers.map((answer, index) => {
                                const isMultipleChoice = Array.isArray(testTask.correct) && testTask.correct.length > 1;
                                return (
                                    <div key={index}>
                                        <input
                                            type={isMultipleChoice ? 'checkbox' : 'radio'}
                                            id={`answer-${index}`}
                                            name={isMultipleChoice ? `answer-${index}` : 'answer'}
                                            value={answer}
                                            onChange={handleAnswerChange(answer, isMultipleChoice)}
                                            checked={isMultipleChoice ? userAnswer.includes(answer) : userAnswer[0] === answer}
                                        />
                                        <label htmlFor={`answer-${index}`}>{answer}</label>
                                    </div>
                                );
                            })}
                            <button onClick={handleSubmitAnswer}>Submit Answer</button>
                            <p><strong>Correct Answer (for reference):</strong> {testTask.correct.join(', ')}</p>
                        </div>
                    )}
                    {solution && (
                        <div style={{ marginTop: '10px' }}>
                            <p><strong>Status:</strong> <span style={{ color: solution.status === 'Завершено' ? 'green' : 'red' }}>{solution.status}</span></p>
                            <p><strong>Your Answer:</strong> {solution.answer.join(', ')}</p>
                            <p><strong>Score:</strong> {solution.score}%</p>
                        </div>
                    )}
                    {!solution && (
                        <div style={{ marginTop: '10px' }}>
                            <p><strong>Status:</strong> <span style={{ color: 'gray' }}>Не начат</span></p>
                            <p><strong>Score:</strong> 0%</p>
                        </div>
                    )}
                </div>
            )}
            {lesson.lesson_type !== 'теория' && lesson.lesson_type !== 'тест' && (
                <p>No content available for this lesson type.</p>
            )}
            <button onClick={handleBackToCourse}>Back to Course</button>
        </div>
    );
}

export default Lesson;