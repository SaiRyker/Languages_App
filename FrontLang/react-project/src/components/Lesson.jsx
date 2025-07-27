import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getCourseById,
    getLanguageById,
    getLessonById,
    getMaterialsByLessonId,
    getPrTaskByLessonId,
    getTestTaskByLessonId,
    getUserProfile,
    getUserPrSolution,
    getUserSolution,
    runCode,
    saveUserPrSolution,
    saveUserSolution,
    updateLesson,
    createMaterial,
    updateMaterial,
    updateMaterialOrder,
    deleteMaterial,
    createTestTask,
    updateTestTask,
    createPrTask,
    updatePrTask,
    deleteTestTask,
    deletePrTask,
    getLessonStatus,
    createLessonStatus,
    getLessonStatusesForModule,
} from '../api/userApi';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublime } from '@uiw/codemirror-themes-all';
import { Console, Hook, Unhook } from 'console-feed';
import PracticalEditor from './PracticalEditor.jsx';
import { EditorView } from '@codemirror/view';
import TestEditor from './TestEditor.jsx';
import '../App.css';
import {LessonStatus} from "../LessonStatusType.js";

function Lesson() {
    const { lessonId } = useParams();
    const navigate = useNavigate();

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
    const [courseData, setCourseData] = useState(null);
    const [openModules, setOpenModules] = useState([]);
    const [code, setCode] = useState('// write your code here');
    const [logs, setLogs] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedLessonName, setEditedLessonName] = useState('');
    const [editedMaterials, setEditedMaterials] = useState([]);
    const [newMaterials, setNewMaterials] = useState([]);
    const [lessonStatus, setLessonStatus] = useState(null);
    const [isStudent, setIsStudent] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [userId, setUserId] = useState(null);
    const [moduleStatuses, setModuleStatuses] = useState([]);

    const consoleRef = useRef(null);
    const materialTypes = ['Текст', 'Видео', 'Изображение'];

    const getUserRoles = () => {
        const token = localStorage.getItem('token');
        if (!token) return [];

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            return payload.roles || [];
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return [];
        }
    };

    const isAdminOrTeacher = getUserRoles().some(
        (role) => role.role_name === 'admin' || role.role_name === 'teacher',
    );

    const onChange = useCallback((val) => {
        setCode(val);
        window.localStorage.setItem('user_code_values', val);
    }, []);

    // Функция для обновления статусов модуля
    const refreshModuleStatuses = async () => {
        if (isStudent && lesson?.module?.id_module && userId) {
            try {
                const statuses = await getLessonStatusesForModule(userId, lesson.module.id_module);
                console.log('Refreshed module statuses:', statuses);
                if (Array.isArray(statuses)) {
                    setModuleStatuses(statuses);
                } else {
                    console.warn('getLessonStatusesForModule вернул не массив:', statuses);
                    setModuleStatuses([]);
                }
            } catch (err) {
                console.error('Ошибка обновления статусов модуля:', err);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const userRoles = getUserRoles();
        setIsStudent(userRoles.some((role) => role.role_name === 'student'));

        const codeFromStorage = localStorage.getItem('user_code_values');
        if (codeFromStorage) {
            setCode(codeFromStorage);
        }

        const userConsole = {};
        const consoleMethods = ['log', 'error', 'warn', 'info'];
        consoleMethods.forEach((method) => {
            userConsole[method] = (...args) => {
                setLogs((currLogs) => [...currLogs, { method, data: args.map(String) }]);
            };
        });

        const hookedConsole = Hook(
            userConsole,
            (log) => setLogs((currLogs) => [...currLogs, log]),
            false,
        );

        const fetchData = async () => {
            try {
                if (!lessonId || isNaN(lessonId)) {
                    throw new Error('Недопустимый ID урока: ' + lessonId);
                }

                const userData = await getUserProfile();
                setUserId(userData.id_user);

                const lessonData = await getLessonById(parseInt(lessonId));
                if (!lessonData || typeof lessonData !== 'object') {
                    throw new Error('Получены некорректные данные урока');
                }
                setLesson(lessonData);
                setEditedLessonName(lessonData.lesson_name);

                const courseData = await getCourseById(parseInt(lessonData.module.course_id));
                const sortedCourseData = {
                    ...courseData,
                    modules: courseData.modules.map((module) => ({
                        ...module,
                        lessons: [...module.lessons].sort((a, b) => a.order_number - b.order_number),
                    })),
                };
                setCourseData(sortedCourseData);

                if (isStudent && lessonData.module?.id_module) {
                    try {
                        const statuses = await getLessonStatusesForModule(userData.id_user, lessonData.module.id_module);
                        console.log('Module statuses raw:', statuses);
                        console.log('Module statuses JSON:', JSON.stringify(statuses));
                        if (!Array.isArray(statuses)) {
                            console.warn('getLessonStatusesForModule вернул не массив:', statuses);
                            setModuleStatuses([]);
                        } else {
                            setModuleStatuses(statuses);
                        }
                    } catch (err) {
                        console.error('Ошибка загрузки статусов модуля:', err);
                        setModuleStatuses([]);
                    }
                }

                if (lessonData.lesson_type === 'теория') {
                    const materialsData = await getMaterialsByLessonId(parseInt(lessonId));
                    if (!Array.isArray(materialsData)) {
                        throw new Error('Получены некорректные данные материалов');
                    }
                    const sortedMaterials = [...materialsData].sort((a, b) => a.order_number - b.order_number);
                    setMaterials(sortedMaterials);
                    setEditedMaterials(sortedMaterials);

                    if (isStudent) {
                        try {
                            const statusData = await getLessonStatus(userData.id_user, parseInt(lessonId));
                            if (!statusData) {
                                const newStatus = await createLessonStatus(userData.id_user, parseInt(lessonId), LessonStatus.READ);
                                setLessonStatus(newStatus.status || 'Прочитано');
                                await refreshModuleStatuses(); // Обновляем статусы после создания
                            } else {
                                setLessonStatus(statusData.status || 'Непрочитано');
                            }
                            setStatusError('');
                        } catch (err) {
                            console.error('Ошибка загрузки/создания статуса урока:', err);
                            setStatusError('Не удалось загрузить или создать статус урока.');
                        }
                    }
                } else if (lessonData.lesson_type === 'тест') {
                    try {
                        const testTaskData = await getTestTaskByLessonId(parseInt(lessonId));
                        if (!testTaskData || typeof testTaskData !== 'object') {
                            throw new Error('Получены некорректные данные тестового задания');
                        }
                        setTestTask(testTaskData);

                        const solutionData = await getUserSolution(testTaskData.id_t_task, userData.id_user);
                        console.log('Test solution:', JSON.stringify(solutionData));
                        setSolution(solutionData || { status: 'Не начато', score: 0, answer: [] });
                    } catch (err) {
                        if (err.response?.status === 404) {
                            setTestTask(null);
                        } else {
                            throw err;
                        }
                    }
                } else if (lessonData.lesson_type === 'практика') {
                    try {
                        const practicalTaskData = await getPrTaskByLessonId(lessonId);
                        if (!practicalTaskData || typeof practicalTaskData !== 'object') {
                            throw new Error('Получены некорректные данные практического задания');
                        }

                        const languageData = await getLanguageById(practicalTaskData.language_id);
                        if (!languageData || typeof languageData !== 'object') {
                            throw new Error('Получены некорректные данные языка программирования');
                        }
                        setLanguage(languageData);
                        setPracticalTask(practicalTaskData);

                        const practicalSolutionData = await getUserPrSolution(practicalTaskData.id_pr_task, userData.id_user);
                        console.log('Practical solution:', JSON.stringify(practicalSolutionData));
                        setSolutionResult(practicalSolutionData || { status: 'Не начато', score: 0, test_results: [] });
                    } catch (err) {
                        if (err.response?.status === 404) {
                            setPracticalTask(null);
                        } else {
                            throw err;
                        }
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err.message, err.response?.data || err);
                setError(`Не удалось загрузить урок: ${err.message}`);
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchData();

        return () => Unhook(hookedConsole);
    }, [lessonId, navigate, isStudent]);

    const toggleModule = (moduleId) => {
        setOpenModules((prev) =>
            prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
        );
    };

    const getNavigationLessons = () => {
        if (!courseData) return { prevLesson: null, nextLesson: null };

        let allLessons = [];
        courseData.modules.forEach((module) => {
            allLessons = [...allLessons, ...module.lessons];
        });

        allLessons.sort((a, b) => a.order_number - b.order_number);

        const currentIndex = allLessons.findIndex((l) => l.id_lesson === parseInt(lessonId));
        const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

        return { prevLesson, nextLesson };
    };

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

    const handleBackToCourse = () => {
        if (lesson.module?.course_id) {
            navigate(`/course/${lesson.module.course_id}`);
        } else {
            navigate('/courses');
        }
    };

    const handleAnswerChange = (answer, isMultipleChoice) => (e) => {
        if (isMultipleChoice) {
            if (e.target.checked) {
                setUserAnswer((prev) => [...prev, answer]);
            } else {
                setUserAnswer((prev) => prev.filter((a) => a !== answer));
            }
        } else {
            setUserAnswer([answer]);
        }
    };

    const handleSubmitAnswer = async () => {
        try {
            const result = await saveUserSolution(testTask.id_t_task, userId, userAnswer);
            setSolution(result);
            alert(`Тест ${result.status.toLowerCase()}`);
            await refreshModuleStatuses(); // Обновляем статусы после отправки теста
        } catch (err) {
            console.error('Ошибка отправки ответа:', err);
            setError('Не удалось сохранить ответ');
        }
    };

    const handleRunCode = async () => {
        setLogs([]);
        try {
            const languageTemp = language.lang_name.toLowerCase();
            const result = await runCode(code, languageTemp);

            if (result.error) {
                setLogs([{ method: 'error', data: [result.error] }]);
            } else {
                const cleanOutput = result.output.replace(/[-\u001F\u007F-\u009F]/g, '').trim();
                setLogs((currLogs) => [{ method: 'log', data: [cleanOutput || 'Ошибки на сервере'] }]);
            }
        } catch (err) {
            setLogs((currLogs) => [{ method: 'error', data: ['Ошибка выполнения кода: ' + err.message] }]);
        }
    };

    const clearConsole = () => {
        setLogs([]);
    };

    const submitSolution = async () => {
        setLogs([]);
        setSolutionResult(null);
        try {
            const lang_name = language.lang_name.toLowerCase();
            const codeUser = String(code);
            const result = await saveUserPrSolution(practicalTask.id_pr_task, userId, codeUser, lang_name);
            setSolutionResult(result);

            setLogs([{ method: 'log', data: [`Решение отправлено. Статус: ${result.status}`] }]);
            setLogs((prev) => [...prev, { method: 'log', data: [`Оценка: ${result.score}/100`] }]);

            if (result.test_results) {
                result.test_results.forEach((test, index) => {
                    setLogs((prev) => [
                        ...prev,
                        {
                            method: test.passed ? 'log' : 'error',
                            data: [
                                `Тест ${index + 1}: ${test.passed ? 'Пройден' : 'Не пройден'}`,
                                test.error ? `Ошибка: ${test.error}` : '',
                            ].filter(Boolean),
                        },
                    ]);
                });
            }

            await refreshModuleStatuses(); // Обновляем статусы после отправки практики
        } catch (error) {
            setLogs((prev) => [{ method: 'error', data: ['Ошибка отправки решения: ' + error.message] }]);
        }
    };

    const handleEditLesson = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedLessonName(lesson.lesson_name);
        setEditedMaterials(materials);
        setNewMaterials([]);
    };

    const handleMaterialChange = (index, field, value) => {
        setEditedMaterials((prev) =>
            prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
        );
    };

    const handleNewMaterialChange = (index, field, value) => {
        setNewMaterials((prev) =>
            prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
        );
    };

    const handleAddNewMaterial = () => {
        setNewMaterials((prev) => [
            ...prev,
            {
                lesson_id: parseInt(lessonId),
                material_type: 'Текст',
                content: '',
                url: '',
                order_number: materials.length + prev.length + 1,
                title: '',
            },
        ]);
    };

    const handleMoveMaterialUp = (index, isNew = false) => {
        if (index === 0) return;
        const setMaterials = isNew ? setNewMaterials : setEditedMaterials;
        setMaterials((prev) => {
            const newArray = [...prev];
            [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
            return newArray.map((m, i) => ({ ...m, order_number: i + 1 }));
        });
    };

    const handleMoveMaterialDown = (index, isNew = false) => {
        const materials = isNew ? newMaterials : editedMaterials;
        if (index === materials.length - 1) return;
        const setMaterials = isNew ? setNewMaterials : setEditedMaterials;
        setMaterials((prev) => {
            const newArray = [...prev];
            [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
            return newArray.map((m, i) => ({ ...m, order_number: i + 1 }));
        });
    };

    const handleDeleteMaterial = async (index, isNew = false) => {
        if (isNew) {
            setNewMaterials((prev) => prev.filter((_, i) => i !== index));
        } else {
            const material = editedMaterials[index];
            if (material.id_material) {
                try {
                    await deleteMaterial(material.id_material);
                    setEditedMaterials((prev) => prev.filter((_, i) => i !== index));
                } catch (err) {
                    console.error('Ошибка удаления материала:', err);
                    setError(`Не удалось удалить материал: ${err.message}`);
                }
            }
        }
    };

    const handleSaveTest = async (testData) => {
        try {
            if (testData.id_t_task) {
                await updateTestTask(testData);
            } else {
                await createTestTask(testData);
            }

            const updatedTestTask = await getTestTaskByLessonId(parseInt(lessonId));
            setTestTask(updatedTestTask || null);

            await handleSaveLesson();
            alert('Тест успешно сохранён!');
        } catch (err) {
            console.error('Ошибка сохранения теста:', err);
            setError(`Не удалось сохранить тест: ${err.message}`);
        }
    };

    const handleDeleteTest = async (idTestTask) => {
        try {
            await deleteTestTask(idTestTask);
            setTestTask(null);
            setIsEditing(false);
            alert('Тестовое задание успешно удалено!');
        } catch (err) {
            console.error('Ошибка удаления теста:', err);
            setError(`Не удалось удалить тест: ${err.message}`);
        }
    };

    const handleSavePractical = async (practicalData) => {
        try {
            if (practicalData.id_pr_task) {
                await updatePrTask(practicalData);
            } else {
                await createPrTask(practicalData);
            }
            const updatedPracticalTask = await getPrTaskByLessonId(parseInt(lessonId));
            setPracticalTask(updatedPracticalTask);
            const languageData = await getLanguageById(updatedPracticalTask.language_id);
            setLanguage(languageData);
            await handleSaveLesson();
            alert('Практическое задание успешно сохранено!');
        } catch (err) {
            console.error('Ошибка сохранения задания:', err);
            setError(`Не удалось сохранить задание: ${err.message}`);
        }
    };

    const handleDeletePractical = async (idPrTask) => {
        try {
            await deletePrTask(idPrTask);
            setPracticalTask(null);
            setIsEditing(false);
            alert('Практическое задание успешно удалено!');
        } catch (err) {
            console.error('Ошибка удаления задания:', err);
            setError(`Не удалось удалить задание: ${err.message}`);
        }
    };

    const handleSaveLesson = async () => {
        try {
            if (editedLessonName !== lesson.lesson_name) {
                await updateLesson(lesson.id_lesson, { lesson_name: editedLessonName });
            }

            if (lesson.lesson_type === 'теория') {
                for (const material of editedMaterials) {
                    console.log(material)
                    const original = materials.find((m) => m.id_material === material.id_material);
                    if (
                        material.content !== original?.content ||
                        material.url !== original?.url ||
                        material.material_type !== original?.material_type ||
                        material.order_number !== original?.order_number ||
                        material.title !== original?.title
                    ) {
                        await updateMaterial(material.id_material ,{
                            id_material: material.id_material,
                            content: material.content,
                            url: material.url,
                            material_type: material.material_type,
                            order_number: material.order_number,
                            title: material.title,
                        });
                    }
                }

                for (const material of newMaterials) {
                    if (
                        (material.material_type === 'Текст' && material.content.trim()) ||
                        (['Видео', 'Изображение'].includes(material.material_type) && material.url.trim())
                    ) {
                        await createMaterial({
                            lesson_id: parseInt(lessonId),
                            material_type: material.material_type,
                            content: material.content,
                            url: material.url,
                            order_number: material.order_number,
                            title: material.title,
                        });
                    }
                }

                const allMaterials = [...editedMaterials, ...newMaterials];
                const materialOrder = allMaterials
                    .filter((m) => m.id_material)
                    .map((m, i) => ({
                        id_material: m.id_material,
                        order_number: i + 1,
                    }));
                if (materialOrder.length > 0) {
                    await updateMaterialOrder(parseInt(lessonId), { materialOrder });
                }
            }

            const updatedLesson = await getLessonById(parseInt(lessonId));
            const updatedMaterials = await getMaterialsByLessonId(parseInt(lessonId));
            const sortedMaterials = [...updatedMaterials].sort((a, b) => a.order_number - b.order_number);
            setLesson(updatedLesson);
            setMaterials(sortedMaterials);
            setEditedMaterials(sortedMaterials);
            setNewMaterials([]);
            setIsEditing(false);
            setError('');
        } catch (err) {
            console.error('Ошибка сохранения урока:', err);
            setError(`Не удалось сохранить изменения: ${err.message}`);
        }
    };

    const getLessonStatusColor = (lesson) => {
        if (!isStudent || !moduleStatuses.length) {
            console.log(`No student or moduleStatuses for lesson ${lesson.id_lesson}`);
            return 'incomplete';
        }

        console.log('Module statuses:', JSON.stringify(moduleStatuses));
        console.log('Lesson ID:', lesson.id_lesson, 'Type:', typeof lesson.id_lesson);

        const moduleStatus = moduleStatuses.find((s, index) => {
            console.log(
                `Index ${index}: Comparing s.lesson_id = ${s.lesson_id} (${typeof s.lesson_id}) with lesson.id_lesson = ${lesson.id_lesson} (${typeof lesson.id_lesson})`,
            );
            console.log(`Strict equality (s.lesson_id === lesson.id_lesson): ${s.lesson_id === lesson.id_lesson}`);
            return s.lesson_id == lesson.id_lesson;
        });

        if (!moduleStatus) {
            console.log(`No moduleStatus found for lesson ${lesson.id_lesson}`);
            return 'incomplete';
        }

        console.log(`Found moduleStatus for lesson ${lesson.id_lesson}:`, moduleStatus);

        if (moduleStatus.lesson_type === 'теория') {
            const isCompleted = moduleStatus.status === 'Прочитано';
            return isCompleted ? 'completed' : 'incomplete';
        } else if (moduleStatus.lesson_type === 'тест' || moduleStatus.lesson_type === 'практика') {
            const isCompleted = moduleStatus.status === 'Завершено';
            return isCompleted ? 'completed' : 'incomplete';
        }

        return 'incomplete';
    };

    const renderProgressBar = () => {
        if (!courseData || !lesson.module) return null;

        const currentModule = courseData.modules.find((m) => m.id_module === lesson.module.id_module);
        if (!currentModule) return null;

        const sortedLessons = [...currentModule.lessons].sort((a, b) => a.order_number - b.order_number);

        return (
            <div className="progress-bar">
                {sortedLessons.map((l) => (
                    <div
                        key={l.id_lesson}
                        className={`progress-square ${getLessonStatusColor(l)} ${l.id_lesson === parseInt(lessonId) ? 'current' : ''}`}
                        onClick={() => navigate(`/lesson/${l.id_lesson}`)}
                        title={`${l.lesson_name} (${l.lesson_type})`}
                    >
                        <span className="progress-number">{l.order_number}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!lesson) return <div className="error">Урок не найден</div>;

    return (
        <div className="lesson-container">
            <div className="lesson-sidebar">
                {courseData && (
                    <>
                        <div className="course-title" onClick={() => navigate(`/course/${courseData.id_course}`)}>
                            {courseData.course_name}
                        </div>
                        {courseData.modules.map((module) => (
                            <div key={module.id_module} className="module">
                                <div className="module-header" onClick={() => toggleModule(module.id_module)}>
                                    <span>{module.module_name}</span>
                                    <span>{openModules.includes(module.id_module) ? '−' : '+'}</span>
                                </div>
                                {openModules.includes(module.id_module) && (
                                    <div className={`module-content ${openModules.includes(module.id_module) ? 'active' : ''}`}>
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
                        <button onClick={handleBackToCourse} className="back-button">
                            Вернуться к курсу
                        </button>
                    </>
                )}
            </div>
            <div className="lesson-content">
                {isEditing ? (
                    <div className="edit-lesson-form">
                        <h2>Редактирование урока</h2>
                        <div className="form-group">
                            <label>Название урока</label>
                            <input
                                type="text"
                                className="form-controls"
                                value={editedLessonName}
                                onChange={(e) => setEditedLessonName(e.target.value)}
                                placeholder="Введите название урока"
                            />
                        </div>
                        {lesson.lesson_type === 'теория' && (
                            <>
                                <h3>Материалы</h3>
                                {editedMaterials
                                    .sort((a, b) => a.order_number - b.order_number)
                                    .map((material, index) => {
                                        const materialKey = material.id_material ? `material-${material.id_material}` : `temp-${index}`;
                                        return (
                                            <div key={materialKey} className="material-item">
                                                <div className="material-order-buttons">
                                                    <button
                                                        className="order-button"
                                                        onClick={() => handleMoveMaterialUp(index)}
                                                        disabled={index === 0}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        className="order-button"
                                                        onClick={() => handleMoveMaterialDown(index)}
                                                        disabled={index === editedMaterials.length - 1}
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                                <div className="material-content">
                                                    <label>Заголовок материала</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={material.title || ''}
                                                        onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                                                        placeholder="Введите заголовок материала"
                                                    />
                                                    <label>Тип материала</label>
                                                    <select
                                                        className="form-control"
                                                        value={material.material_type}
                                                        onChange={(e) => handleMaterialChange(index, 'material_type', e.target.value)}
                                                    >
                                                        {materialTypes.map((type) => (
                                                            <option key={type} value={type}>
                                                                {type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {material.material_type !== 'Текст' && (
                                                        <div>
                                                            <label>URL {material.material_type.toLowerCase()}</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={material.url || ''}
                                                                onChange={(e) => handleMaterialChange(index, 'url', e.target.value)}
                                                                placeholder={`Введите URL ${material.material_type.toLowerCase()}`}
                                                            />
                                                        </div>
                                                    )}
                                                    <label>{material.material_type === 'Текст' ? 'Содержимое текста' : 'Описание'}</label>
                                                    <textarea
                                                        className="form-control"
                                                        value={material.content || ''}
                                                        onChange={(e) => handleMaterialChange(index, 'content', e.target.value)}
                                                        placeholder={
                                                            material.material_type === 'Текст'
                                                                ? 'Введите содержимое текста'
                                                                : `Введите описание ${material.material_type.toLowerCase()}`
                                                        }
                                                        rows={5}
                                                    />
                                                    <button
                                                        className="btn btn-danger delete-button"
                                                        onClick={() => handleDeleteMaterial(index)}
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                {newMaterials
                                    .sort((a, b) => a.order_number - b.order_number)
                                    .map((material, index) => (
                                        <div key={`new-${index}`} className="material-item">
                                            <div className="material-order-buttons">
                                                <button
                                                    className="order-button"
                                                    onClick={() => handleMoveMaterialUp(index, true)}
                                                    disabled={index === 0}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    className="order-button"
                                                    onClick={() => handleMoveMaterialDown(index, true)}
                                                    disabled={index === newMaterials.length - 1}
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                            <div className="material-content">
                                                <label>Заголовок материала</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={material.title || ''}
                                                    onChange={(e) => handleNewMaterialChange(index, 'title', e.target.value)}
                                                    placeholder="Введите заголовок материала"
                                                />
                                                <label>Тип материала</label>
                                                <select
                                                    className="form-control"
                                                    value={material.material_type}
                                                    onChange={(e) => handleNewMaterialChange(index, 'material_type', e.target.value)}
                                                >
                                                    {materialTypes.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                {material.material_type !== 'Текст' && (
                                                    <div>
                                                        <label>URL {material.material_type.toLowerCase()}</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={material.url || ''}
                                                            onChange={(e) => handleNewMaterialChange(index, 'url', e.target.value)}
                                                            placeholder={`Введите URL ${material.material_type.toLowerCase()}`}
                                                        />
                                                    </div>
                                                )}
                                                <label>{material.material_type === 'Текст' ? 'Содержимое текста' : 'Описание'}</label>
                                                <textarea
                                                    className="form-control"
                                                    value={material.content || ''}
                                                    onChange={(e) => handleNewMaterialChange(index, 'content', e.target.value)}
                                                    placeholder={
                                                        material.material_type === 'Текст'
                                                            ? 'Введите содержимое текста'
                                                            : `Введите описание ${material.material_type.toLowerCase()}`
                                                    }
                                                    rows={5}
                                                />
                                                <button
                                                    className="btn btn-danger delete-button"
                                                    onClick={() => handleDeleteMaterial(index, true)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                <button className="btn btn-primary" onClick={handleAddNewMaterial}>
                                    Добавить новый материал
                                </button>
                                <div className="form-actions">
                                    <button className="btn btn-primary" onClick={handleSaveLesson}>
                                        Сохранить
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                        Отмена
                                    </button>
                                </div>
                            </>
                        )}
                        {lesson.lesson_type === 'тест' && (
                            <TestEditor
                                testTask={testTask}
                                lessonId={parseInt(lessonId)}
                                onSave={handleSaveTest}
                                onCancel={handleCancelEdit}
                                onDelete={handleDeleteTest}
                            />
                        )}
                        {lesson.lesson_type === 'практика' && (
                            <PracticalEditor
                                practicalTask={practicalTask}
                                lessonId={parseInt(lessonId)}
                                onSave={handleSavePractical}
                                onCancel={handleCancelEdit}
                                onDelete={handleDeletePractical}
                            />
                        )}
                    </div>
                ) : (
                    <>
                        <div className="lesson-header">
                            {renderProgressBar()}
                            <h2>
                                {lesson.lesson_name || 'Без названия'}{' '}
                                {lesson.lesson_type === 'теория' && isStudent && (
                                    <>
                                        {statusError ? (
                                            <span style={{ color: 'red', fontSize: '0.8em' }}>({statusError})</span>
                                        ) : (
                                            lessonStatus && (
                                                <span
                                                    style={{
                                                        color: lessonStatus === 'Прочитано' ? 'green' : 'gray',
                                                        fontSize: '0.8em',
                                                    }}
                                                >
                          ({lessonStatus})
                        </span>
                                            )
                                        )}
                                    </>
                                )}
                            </h2>
                            {isAdminOrTeacher && (
                                <button className="btn btn-primary edit-lesson-btn" onClick={handleEditLesson}>
                                    Редактировать урок
                                </button>
                            )}
                        </div>
                        {lesson.lesson_type === 'теория' && (
                            <>
                                {materials.length > 0 ? (
                                    <div className="lesson-theory">
                                        {materials
                                            .sort((a, b) => a.order_number - b.order_number)
                                            .map((material, index) => (
                                                <div key={material.id_material || `material-${index}`}>
                                                    {material.title && <h4>{material.title}</h4>}
                                                    {material.material_type === 'Текст' && <p>{material.content}</p>}
                                                    {material.material_type === 'Видео' && (
                                                        <div>
                                                            {material.content && <p>{material.content}</p>}
                                                            <iframe
                                                                width="600"
                                                                height="340"
                                                                src={material.url}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                title="Video"
                                                            ></iframe>
                                                        </div>
                                                    )}
                                                    {material.material_type === 'Изображение' && (
                                                        <div>
                                                            {material.content && <p>{material.content}</p>}
                                                            <img src={material.url} alt="Lesson Image" style={{ maxWidth: '100%' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p>Нет доступных материалов для этого урока.</p>
                                )}
                            </>
                        )}
                        {lesson.lesson_type === 'тест' && (
                            <>
                                {testTask ? (
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
                                            </div>
                                        )}
                                        {solution && (
                                            <div style={{ marginTop: '10px' }}>
                                                <p>
                                                    <strong>Статус:</strong>{' '}
                                                    <span style={{ color: solution.status === 'Завершено' ? 'green' : 'red' }}>
                            {solution.status}
                          </span>
                                                </p>
                                                <p>
                                                    <strong>Ваш ответ:</strong> {solution.answer.join(', ')}
                                                </p>
                                                <p>
                                                    <strong>Процент завершенности:</strong> {solution.score}
                                                </p>
                                            </div>
                                        )}
                                        {!solution && (
                                            <div style={{ marginTop: '10px' }}>
                                                <p>
                                                    <strong>Статус:</strong> <span style={{ color: 'gray' }}>Не начато</span>
                                                </p>
                                                <p>
                                                    <strong>Процент завершенности:</strong> 0%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p>Нет доступных материалов для этого урока.</p>
                                )}
                            </>
                        )}
                        {lesson.lesson_type === 'практика' && (
                            <>
                                {practicalTask ? (
                                    <div className="lesson-practical">
                                        <div className="lesson">
                                            <h3>Практическое задание</h3>
                                            <p>
                                                <strong>Тема:</strong> {practicalTask.task_name}
                                            </p>
                                            <p>
                                                <strong>Описание:</strong> {practicalTask.description}
                                            </p>
                                            <p>
                                                <strong>Язык программирования:</strong> {language?.lang_name}
                                            </p>
                                            <div>
                                                <h4>Напишите ваше программное решение:</h4>
                                                <div>
                                                    <CodeMirror
                                                        value={code}
                                                        theme={sublime}
                                                        height="200px"
                                                        extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
                                                        onChange={onChange}
                                                    />
                                                </div>
                                                <div>
                                                    <Console logs={logs} variant="dark" ref={consoleRef} />
                                                </div>
                                                <button onClick={handleRunCode} style={{ marginTop: '10px' }}>
                                                    Запустить код
                                                </button>
                                                <button onClick={clearConsole} style={{ marginTop: '10px' }}>
                                                    Очистить консоль
                                                </button>
                                                <button onClick={submitSolution} style={{ marginTop: '10px' }}>
                                                    Проверить решение
                                                </button>
                                            </div>
                                            {solutionResult && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <p>
                                                        <strong>Статус:</strong>{' '}
                                                        <span style={{ color: solutionResult.status === 'Завершено' ? 'green' : 'red' }}>
                              {solutionResult.status}
                            </span>
                                                    </p>
                                                    <p>
                                                        <strong>Ваш ответ:</strong> {solutionResult.code_user}
                                                    </p>
                                                    <p>
                                                        <strong>Процент завершенности:</strong> {solutionResult.score}%
                                                    </p>
                                                </div>
                                            )}
                                            {!solutionResult && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <p>
                                                        <strong>Статус:</strong> <span style={{ color: 'gray' }}>Не начато</span>
                                                    </p>
                                                    <p>
                                                        <strong>Процент завершенности:</strong> 0%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p>Нет доступных материалов для этого урока.</p>
                                )}
                            </>
                        )}
                        {lesson.lesson_type !== 'теория' && lesson.lesson_type !== 'тест' && lesson.lesson_type !== 'практика' && (
                            <p>Нет контента для этого типа урока.</p>
                        )}
                        <div className="lesson-nav">
                            <div style={{ textAlign: 'left' }}>
                                {prevLesson && (
                                    <>
                                        <div className="nav-label">
                                            {prevLesson.lesson_name.length > 20
                                                ? prevLesson.lesson_name.substring(0, 20) + '...'
                                                : prevLesson.lesson_name}
                                        </div>
                                        <button className="nav-button" onClick={goToPreviousLesson}>
                                            Предыдущий урок
                                        </button>
                                    </>
                                )}
                                <div style={{ width: '150px' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {nextLesson && (
                                    <>
                                        <div className="nav-label">
                                            {nextLesson.lesson_name.length > 20
                                                ? nextLesson.lesson_name.substring(0, 20) + '...'
                                                : nextLesson.lesson_name}
                                        </div>
                                        <button className="nav-button" onClick={goToNextLesson}>
                                            Следующий урок
                                        </button>
                                    </>
                                )}
                                <div style={{ width: '150px' }} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Lesson;