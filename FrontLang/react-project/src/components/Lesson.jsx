import {useState, useEffect, useCallback, useRef} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getCourseById,
    getLanguageById,
    getLessonById,
    getMaterialsByLessonId, getPrTaskByLessonId,
    getTestTaskByLessonId,
    getUserProfile, getUserPrSolution, getUserSolution, runCode, saveUserPrSolution,
    saveUserSolution
} from '../api/userApi';
import CodeMirror, {EditorView} from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublime } from '@uiw/codemirror-themes-all'
import { Console, Hook, Unhook } from 'console-feed'
import PracticalEditor from "./PracticalEditor.jsx";

function Lesson() {
    const { lessonId } = useParams();


    const [lesson, setLesson] = useState(null);
    const [materials, setMaterials] = useState([]);

    const [language, setLanguage] = useState(null);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [testTask, setTestTask] = useState(null);
    const [userAnswer, setUserAnswer] = useState([]);
    const [solution, setSolution] = useState(null);
    
    const [practicalTask, setPracticalTask] = useState(null);
    const [solutionResult, setSolutionResult] = useState(null);

    const [courseData, setCourseData] = useState(null); // Данные курса
    const [openModules, setOpenModules] = useState([]); // Для разворачивания модулей

    const [code, setCode] = useState("//write your code here");

    const [isEditingTask, setIsEditingTask] = useState(false);

    const [logs, setLogs] = useState([])

    const navigate = useNavigate();

    const consoleRef = useRef(null);

    const onChange = useCallback((val, viewUpdate) => {
        //console.log('val:', val);
        setCode(val);
        window.localStorage.setItem('user_code_values', val);
    }, []);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const codeFromStorage = localStorage.getItem('user_code_values');
        if (codeFromStorage) {
            setCode(codeFromStorage)
        }
        // Консоль для практических заданий
        const userConsole = {};
        const consoleMethods = ['log', 'error', 'warn', 'info'];
        consoleMethods.forEach((method) => {
            userConsole[method] = (...args) => {
                setLogs((currLogs) => [
                    ...currLogs,
                    { method, data: args.map(String) },
                ]);
            };
        });

        const hookedConsole = Hook(
            userConsole,
            (log) => setLogs((currLogs) => [...currLogs, log]),
            false
        )

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

                console.log(lessonData.module.course_id)

                setLesson(lessonData);

                const courseData = await getCourseById(parseInt(lessonData.module.course_id));
                console.log("Курсик)", courseData)
                setCourseData(courseData);

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

                } else if (lessonData.lesson_type === 'практика') {
                    console.log('Fetching practical task for lesson ID:', lessonId);
                    const practicalTaskData = await getPrTaskByLessonId(lessonId);
                    console.log('Practical task data fetched:', practicalTaskData);
                    if (!practicalTaskData || typeof practicalTaskData !== 'object') {
                        throw new Error('Invalid practical task data received');
                    }


                    const languageData = await getLanguageById(practicalTaskData.language_id)
                    if (!languageData || typeof languageData !== 'object') {
                        throw new Error('Invalid language data received');
                    };
                    console.log(languageData);
                    setLanguage(languageData);
                    setPracticalTask(practicalTaskData);

                    const userData = await getUserProfile();
                    const userId = userData.id_user;
                    console.log(userId)

                    const practicalSolutionData = await getUserPrSolution(practicalTaskData.id_pr_task, userId);
                    // console.log(practicalSolutionData)
                    setSolutionResult(practicalSolutionData || { status: 'Не начат', score: 0, test_results: [] });
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

        return () => Unhook(hookedConsole)
    }, [lessonId,  navigate]);



    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!lesson) return <div>Lesson not found</div>;

    const textMaterials = materials.filter((material) => material.material_type === 'Текст');
    const mediaMaterials = materials.filter(
        (material) => material.material_type === 'Видео' || material.material_type === 'Аудио'
    );

    // Функция для переключения состояния модуля (развёрнут/свёрнут)
    const toggleModule = (moduleId) => {
        setOpenModules((prev) =>
            prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
        );
    };

    // Логика для навигации между уроками
    const getNavigationLessons = () => {
        if (!courseData) return { prevLesson: null, nextLesson: null };

        let allLessons = [];
        courseData.modules.forEach((module) => {
            allLessons = [...allLessons, ...module.lessons];
        });

        const currentIndex = allLessons.findIndex((l) => l.id_lesson === parseInt(lessonId));
        const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

        return { prevLesson, nextLesson };
    };

    // Функции для перехода между уроками
    const goToPreviousLesson = () => {
        if (prevLesson) {
            navigate(`/lesson/${prevLesson.id_lesson}`);
        }
    };

    const goToNextLesson = () => {
        if (nextLesson) {
            navigate(`/lesson/${nextLesson.id_lesson}`);
        }
    };

    const { prevLesson, nextLesson } = getNavigationLessons();
    console.log(prevLesson)
    console.log(nextLesson)

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

    const handleRunCode = async () => {
        setLogs([]);
        try {
            const languageTemp = (language.lang_name).toLowerCase();
            const result = await runCode(code, languageTemp);
            console.log('Server response:', result); // Отладка

            if (result.error) {
                setLogs([{ method: 'error', data: [result.error] }]);
            } else {
                const cleanOutput = result.output.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
                console.log(cleanOutput)
                setLogs((currLogs) => [{ method: 'log', data: [cleanOutput || 'Some errors on server'] }]);
            }
        } catch (err) {
            setLogs((currLogs) => [{ method: 'error', data: ['Error running code: ' + err.message] },]);
        }
    };


    const clearConsole = () => {
        setLogs([]);
    };

    const submitSolution = async () => {
        setLogs([]); // Очищаем консоль
        setSolutionResult(null); // Сбрасываем результаты
        const userData = await getUserProfile();
        const userId = userData.id_user;
        const lang_name = (language.lang_name).toLowerCase();
        console.log(practicalTask.id_pr_task)
        console.log(userId)
        console.log(code)
        const codeUser = String(code);
        try {
            console.log('Sending code to server:', code); // Отладочный вывод
            const result = await saveUserPrSolution(practicalTask.id_pr_task, userId, codeUser, lang_name);
            setSolutionResult(result); // Сохраняем результат

            setLogs([{ method: 'log', data: [`Solution submitted. Status: ${result.status}`] }]);
            setLogs((prev) => [...prev, { method: 'log', data: [`Score: ${result.score}/100`] }]);

            // Логируем результаты тестов
            if (result.test_results) {
                result.test_results.forEach((test, index) => {
                    setLogs((prev) => [
                        ...prev,
                        {
                            method: test.passed ? 'log' : 'error',
                            data: [
                                `Test ${index + 1}: ${test.passed ? 'Passed' : 'Failed'}`,
                                test.error ? `Error: ${test.error}` : '',
                            ].filter(Boolean),
                        },
                    ]);
                });
            }
        } catch (error) {
            setLogs([{ method: 'error', data: ['Error submitting solution: ' + error.message] }]);
        }
    }

    const openTaskEditor = () => {
        setIsEditingTask(true);
    };

    const closeTaskEditor = () => {
        setIsEditingTask(false);
    };

    // Функция для получения данных измененного практического задания
    const fetchPracticalTask = async () => {
        try {
            const newPrTaskData = await getPrTaskByLessonId(lesson.id_lesson)
            setPracticalTask(newPrTaskData); // Обновляем состояние с новыми данными
        } catch (error) {
            console.error('Error fetching practical task:', error);
        }
    };



    return (
        <div className="lesson-container">
            {/* Боковое меню */}
            <div className="lesson-sidebar">
                {courseData && (
                    <>
                        {/* Название курса (кликабельное) */}
                        <div
                            className="course-title"
                            onClick={() => navigate(`/course/${courseData.id_course}`)}
                        >
                            {courseData.course_name}
                        </div>

                        {/* Список модулей */}
                        {courseData.modules.map((module) => (

                            <div key={module.id_module} className="module">
                                {/* Заголовок модуля (кликабельный для разворачивания) */}
                                <div
                                    className="module-header"
                                    onClick={() => toggleModule(module.id_module)}
                                >
                                    <span>{module.module_name}</span>
                                    <span>{openModules.includes(module.id_module) ? '−' : '+'}</span>
                                </div>

                                {/* Уроки внутри модуля */}
                                {openModules.includes(module.id_module) && (
                                    <div
                                        className={`module-content ${openModules.includes(module.id_module) ? 'active' : ''}`}>
                                        {module.lessons.map((lesson) => (
                                            <div
                                                key={lesson.id_lesson}
                                                className={`lesson-item ${lesson.id_lesson === parseInt(lessonId) ? 'active' : ''}`}
                                                onClick={() => navigate(`/lesson/${lesson.id_lesson}`)}
                                            >
                                                {lesson.lesson_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
                <button onClick={handleBackToCourse} className="back-button">Вернуться к курсу</button>
            </div>
            <div className="lesson-content">
                <h2>{lesson.lesson_name}</h2>
                {lesson.lesson_type === 'теория' && (
                    <>
                        {textMaterials.length > 0 && (
                            <div className="lesson-theory">
                                {textMaterials.map((material, index) => (
                                    <div key={index}>
                                        <p>{material.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {mediaMaterials.length > 0 && (
                            <div className="lesson-theory">
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
                                    </div>
                                ))}
                            </div>
                        )}
                        {materials.length === 0 && <p>No materials available for this lesson.</p>}
                    </>
                )}
                {lesson.lesson_type === 'тест' && testTask && (
                    <div className="lesson-test">
                        <h3>{testTask.task_name}</h3>
                        <p>{testTask.description}</p>
                        {Array.isArray(testTask.task_answers) && testTask.task_answers.length > 0 && (
                            <div>
                                <h4>Варианты ответа:</h4>
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
                                <button onClick={handleSubmitAnswer}>Проверить</button>
                                {/*<p><strong>Correct Answer (for reference):</strong> {testTask.correct.join(', ')}</p>*/}
                            </div>
                        )}
                        {solution && (
                            <div style={{marginTop: '10px'}}>
                                <p><strong>Статус:</strong> <span
                                    style={{color: solution.status === 'Завершено' ? 'green' : 'red'}}>{solution.status}</span>
                                </p>
                                <p><strong>Ваш ответ:</strong> {solution.answer.join(', ')}</p>
                                <p><strong>Процент завершенности:</strong> {solution.score}%</p>
                            </div>
                        )}
                        {!solution && (
                            <div style={{marginTop: '10px'}}>
                                <p><strong>Статус:</strong> <span style={{color: 'gray'}}>Не начат</span></p>
                                <p><strong>Процент завершенности:</strong> 0%</p>
                            </div>
                        )}
                    </div>
                )}
                {lesson.lesson_type === 'практика' && practicalTask && (

                    <div className="lesson-practical">
                        <h3>Практическое задание</h3>
                        <p><strong>Тема:</strong> {practicalTask.task_name}</p>
                        <p><strong>Описание:</strong> {practicalTask.description}</p>
                        <p><strong>Язык программирования:</strong> {language.lang_name}</p>
                        <div>
                            <h4>Напишите ваше программное решение:</h4>
                            <div>
                                <CodeMirror
                                    value={code}
                                    theme={sublime}
                                    height="200px"
                                    extensions={[javascript({jsx: true}), EditorView.lineWrapping]}
                                    onChange={onChange}/>
                            </div>
                            <div><Console logs={logs} variant="dark" ref={consoleRef}/></div>
                            <button onClick={handleRunCode} style={{marginTop: '10px'}}>Запустить код</button>
                            <button onClick={clearConsole} style={{marginTop: '10px'}}>Очистить консоль</button>
                            <button onClick={submitSolution} style={{marginTop: '10px'}}>Проверить решение</button>
                            {/*<button onClick={openTaskEditor} style={{marginTop: '10px'}}>Edit pr_task</button>*/}
                        </div>

                        {solutionResult && (
                            <div style={{marginTop: '10px'}}>
                                <p><strong>Статус:</strong> <span
                                    style={{color: solutionResult.status === 'Завершено' ? 'green' : 'red'}}>{solutionResult.status}</span>
                                </p>
                                <p><strong>Ваш ответ:</strong> {solutionResult.code_user}</p>
                                <p><strong>Процент завершенности:</strong> {solutionResult.score}%</p>
                            </div>
                        )}
                        {!solutionResult && (
                            <div style={{marginTop: '10px'}}>
                                <p><strong>Статус:</strong> <span style={{color: 'gray'}}>Не начат</span></p>
                                <p><strong>Процент завершенности:</strong> 0%</p>
                            </div>
                        )}
                        {isEditingTask && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    background: 'white',
                                    padding: '20px',
                                    maxWidth: '600px',
                                    margin: '50px auto',
                                    borderRadius: '5px'
                                }}>
                                    <PracticalEditor lessonId={lesson.id_lesson} onClose={closeTaskEditor}
                                                     onTaskUpdated={fetchPracticalTask}/>
                                    <button onClick={closeTaskEditor} style={{marginTop: '10px'}}>Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {lesson.lesson_type !== 'теория' && lesson.lesson_type !== 'тест' && lesson.lesson_type !== 'практика' && (
                    <p>No content available for this lesson type.</p>
                )}
                {/* Навигационные кнопки */}
                <div className="lesson-nav">
                    {/* Предыдущий урок */}
                    <div style={{textAlign: 'left'}}>
                        {prevLesson ? (
                            <>
                                <div className="nav-label">
                                    {prevLesson.lesson_name.length > 20 ? prevLesson.lesson_name.substring(0, 20) + '...' : prevLesson.lesson_name}
                                </div>
                                <button
                                    onClick={goToPreviousLesson}
                                    className="nav-button"
                                >
                                    Предыдущий урок
                                </button>
                            </>
                        ) : (
                            <div style={{width: '150px'}}/> // Плейсхолдер для выравнивания
                        )}
                    </div>

                    {/* Следующий урок */}
                    <div style={{textAlign: 'right'}}>
                        {nextLesson ? (
                            <>
                                <div className="nav-label">
                                    {nextLesson.lesson_name.length > 20 ? nextLesson.lesson_name.substring(0, 20) + '...' : nextLesson.lesson_name}
                                </div>
                                <button
                                    onClick={goToNextLesson}
                                    className="nav-button"
                                >
                                    Следующий урок
                                </button>
                            </>
                        ) : (
                            <div style={{width: '150px'}}/> // Плейсхолдер для выравнивания
                        )}
                    </div>
                </div>


            </div>

        </div>
    );
}

export default Lesson;