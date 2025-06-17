import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getCourseById,
    getModulesByCourseId,
    getLessonsByCourseId,
    getUserById,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    updateModuleOrder,
    updateLessonOrder,
} from '../api/userApi';
import { LessonType } from '../lesson-type';
import '../App.css';

function ModuleItem({ module, isEditing, editModule, setEditModule, handleEditModule, handleDeleteModule, newLesson, setNewLesson, handleAddLesson, lessonsByModule, editLesson, setEditLesson, handleEditLesson, handleDeleteLesson, moveModuleUp, moveModuleDown, isFirst, isLast, moveLessonUp, moveLessonDown }) {
    return (
        <div className="module-card editable">
            <div className="module-header">
                <div className="module-order-controls">
                    {isEditing && (
                        <div className="order-arrows">
                            <button
                                className="arrow-button"
                                onClick={() => moveModuleUp(module.id_module)}
                                disabled={isFirst}
                                title="Переместить вверх"
                            >
                                ↑
                            </button>
                            <button
                                className="arrow-button"
                                onClick={() => moveModuleDown(module.id_module)}
                                disabled={isLast}
                                title="Переместить вниз"
                            >
                                ↓
                            </button>
                        </div>
                    )}
                    <span className="module-order">{module.order_number}.</span>
                </div>
                {editModule[module.id_module] !== undefined ? (
                    <input
                        type="text"
                        value={editModule[module.id_module]}
                        onChange={(e) => setEditModule({ ...editModule, [module.id_module]: e.target.value })}
                        placeholder="Новое название модуля"
                    />
                ) : (
                    <span className="module-name">{module.module_name}</span>
                )}
                {isEditing && (
                    <div className="module-actions">
                        {editModule[module.id_module] !== undefined ? (
                            <>
                                <button onClick={() => handleEditModule(module.id_module)}>Сохранить</button>
                                <button onClick={() => setEditModule({ ...editModule, [module.id_module]: undefined })}>Отмена</button>
                            </>
                        ) : (
                            <button onClick={() => setEditModule({ ...editModule, [module.id_module]: module.module_name })}>Редактировать</button>
                        )}
                        <button onClick={() => handleDeleteModule(module.id_module)}>Удалить</button>
                    </div>
                )}
            </div>
            {isEditing && (
                <form onSubmit={(e) => handleAddLesson(module.id_module, e)} className="add-lesson-form">
                    <input
                        type="text"
                        value={newLesson[module.id_module]?.name || ''}
                        onChange={(e) => setNewLesson({ ...newLesson, [module.id_module]: { ...newLesson[module.id_module], name: e.target.value } })}
                        placeholder="Название урока"
                        required
                    />
                    <input
                        type="text"
                        value={newLesson[module.id_module]?.description || ''}
                        onChange={(e) => setNewLesson({ ...newLesson, [module.id_module]: { ...newLesson[module.id_module], description: e.target.value } })}
                        placeholder="Описание урока"
                    />
                    <select
                        value={newLesson[module.id_module]?.type || LessonType.THEORY}
                        onChange={(e) => setNewLesson({ ...newLesson, [module.id_module]: { ...newLesson[module.id_module], type: e.target.value } })}
                    >
                        <option value={LessonType.THEORY}>Теория</option>
                        <option value={LessonType.TEST}>Тест</option>
                        <option value={LessonType.PRACTICAL}>Практика</option>
                    </select>
                    <button type="submit">Добавить урок</button>
                </form>
            )}
            <ul className="lessons-list">
                {(lessonsByModule[module.id_module] || []).map((lesson, index) => (
                    <LessonItem
                        key={lesson.id_lesson}
                        lesson={lesson}
                        isEditing={isEditing}
                        editLesson={editLesson}
                        setEditLesson={setEditLesson}
                        handleEditLesson={handleEditLesson}
                        handleDeleteLesson={handleDeleteLesson}
                        moveLessonUp={() => moveLessonUp(module.id_module, lesson.id_lesson)}
                        moveLessonDown={() => moveLessonDown(module.id_module, lesson.id_lesson)}
                        isFirst={index === 0}
                        isLast={index === (lessonsByModule[module.id_module] || []).length - 1}
                    />
                ))}
            </ul>
        </div>
    );
}

function LessonItem({ lesson, isEditing, editLesson, setEditLesson, handleEditLesson, handleDeleteLesson, moveLessonUp, moveLessonDown, isFirst, isLast }) {
    return (
        <li className="lesson-item editable">
            <div className="lesson-order-controls">
                {isEditing && (
                    <div className="order-arrows">
                        <button
                            className="arrow-button"
                            onClick={() => moveLessonUp()}
                            disabled={isFirst}
                            title="Переместить вверх"
                        >
                            ↑
                        </button>
                        <button
                            className="arrow-button"
                            onClick={() => moveLessonDown()}
                            disabled={isLast}
                            title="Переместить вниз"
                        >
                            ↓
                        </button>
                    </div>
                )}
                <span className="lesson-order">{lesson.order_number}.</span>
            </div>
            {editLesson[lesson.id_lesson] ? (
                <>
                    <input
                        type="text"
                        value={editLesson[lesson.id_lesson].name}
                        onChange={(e) => setEditLesson({ ...editLesson, [lesson.id_lesson]: { ...editLesson[lesson.id_lesson], name: e.target.value } })}
                        placeholder="Название урока"
                    />
                    <input
                        type="text"
                        value={editLesson[lesson.id_lesson].description}
                        onChange={(e) => setEditLesson({ ...editLesson, [lesson.id_lesson]: { ...editLesson[lesson.id_lesson], description: e.target.value } })}
                        placeholder="Описание урока"
                    />
                    <select
                        value={editLesson[lesson.id_lesson].type}
                        onChange={(e) => setEditLesson({ ...editLesson, [lesson.id_lesson]: { ...editLesson[lesson.id_lesson], type: e.target.value } })}
                    >
                        <option value={LessonType.THEORY}>Теория</option>
                        <option value={LessonType.TEST}>Тест</option>
                        <option value={LessonType.PRACTICAL}>Практика</option>
                    </select>
                    <button onClick={() => handleEditLesson(lesson.id_lesson)}>Сохранить</button>
                    <button onClick={() => setEditLesson({ ...editLesson, [lesson.id_lesson]: null })}>Отмена</button>
                </>
            ) : (
                <>
                    <span className="lesson-name">{lesson.lesson_name}</span>
                    <span className="lesson-details">(Тип: {lesson.lesson_type}, Описание: {lesson.description || 'N/A'})</span>
                    {isEditing && (
                        <>
                            <button onClick={() => setEditLesson({ ...editLesson, [lesson.id_lesson]: { name: lesson.lesson_name, description: lesson.description, type: lesson.lesson_type } })}>
                                Редактировать
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id_lesson)}>Удалить</button>
                        </>
                    )}
                </>
            )}
        </li>
    );
}

function Course() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedModules, setExpandedModules] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');
    const [newLesson, setNewLesson] = useState({});
    const [editModule, setEditModule] = useState({});
    const [editLesson, setEditLesson] = useState({});
    const navigate = useNavigate();

    const getUserData = () => {
        const token = localStorage.getItem('token');
        if (!token) return { roles: [], id: null };
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            return { roles: payload.roles || [], id: payload.id || null };
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return { roles: [], id: null };
        }
    };

    const { roles, id: userId } = getUserData();
    const isAdmin = roles.some((role) => role.role_name === 'admin');
    const isTeacher = roles.some((role) => role.role_name === 'teacher');
    const canEdit = isAdmin || (isTeacher && course?.creator_id === userId);

    useEffect(() => {
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

                const courseData = await getCourseById(parseInt(courseId));
                if (!courseData || typeof courseData !== 'object') {
                    throw new Error('Invalid course data received');
                }
                setCourse(courseData);

                const teacherData = await getUserById(courseData.creator_id);
                if (!teacherData || typeof teacherData !== 'object') {
                    throw new Error('Invalid teacher data received');
                }
                setTeacher(teacherData);

                const modulesData = await getModulesByCourseId(parseInt(courseId));
                if (!Array.isArray(modulesData)) {
                    throw new Error('Invalid modules data received');
                }
                setModules(modulesData);

                const lessonsData = await getLessonsByCourseId(parseInt(courseId));
                if (!Array.isArray(lessonsData)) {
                    throw new Error('Invalid lessons data received');
                }
                setLessons(lessonsData);

                setLoading(false);
            } catch (err) {
                console.error('Error in fetchData:', err.message, err.response?.data || err);
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

    const handleAddModule = async (e) => {
        e.preventDefault();
        try {
            const moduleData = {
                course_id: parseInt(courseId),
                module_name: newModuleName,
                order_number: modules.length + 1,
            };
            const newModule = await createModule(moduleData);
            setModules([...modules, newModule]);
            setNewModuleName('');
        } catch (err) {
            console.error('Error adding module:', err.response?.data || err.message);
            setError(`Failed to add module: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleEditModule = async (moduleId) => {
        try {
            const moduleData = { module_name: editModule[moduleId] };
            console.log('Editing module:', moduleId, moduleData);
            await updateModule(moduleId, moduleData);
            setModules(modules.map((m) => (m.id_module === moduleId ? { ...m, module_name: moduleData.module_name } : m)));
            setEditModule({ ...editModule, [moduleId]: undefined });
        } catch (err) {
            console.error('Error editing module:', err.response?.data || err.message);
            setError(`Failed to edit module: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        try {
            console.log('Deleting module:', moduleId);
            await deleteModule(moduleId);
            setModules(modules.filter((m) => m.id_module !== moduleId));
            setLessons(lessons.filter((l) => l.module_id !== moduleId));
        } catch (err) {
            console.error('Error deleting module:', err.response?.data || err.message);
            setError(`Failed to delete module: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleAddLesson = async (moduleId, e) => {
        e.preventDefault();
        try {
            const lessonData = {
                module_id: moduleId,
                lesson_name: newLesson[moduleId]?.name || '',
                description: newLesson[moduleId]?.description || '',
                lesson_type: newLesson[moduleId]?.type || LessonType.THEORY,
                order_number: (lessonsByModule[moduleId]?.length || 0) + 1,
            };
            console.log('Adding lesson:', lessonData);
            const newLessonData = await createLesson(lessonData);
            setLessons([...lessons, newLessonData]);
            setNewLesson({ ...newLesson, [moduleId]: { name: '', description: '', type: LessonType.THEORY } });
        } catch (err) {
            console.error('Error adding lesson:', err.response?.data || err.message);
            setError(`Failed to add lesson: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleEditLesson = async (lessonId) => {
        try {
            const lessonData = {
                lesson_name: editLesson[lessonId]?.name,
                description: editLesson[lessonId]?.description,
                lesson_type: editLesson[lessonId]?.type,
            };
            console.log('Editing lesson:', lessonId, lessonData);
            await updateLesson(lessonId, lessonData);
            setLessons(lessons.map((l) => (l.id_lesson === lessonId ? { ...l, ...lessonData } : l)));
            setEditLesson({ ...editLesson, [lessonId]: null });
        } catch (err) {
            console.error('Error editing lesson:', err.response?.data || err.message);
            setError(`Failed to edit lesson: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        try {
            console.log('Deleting lesson:', lessonId);
            await deleteLesson(lessonId);
            setLessons(lessons.filter((l) => l.id_lesson !== lessonId));
        } catch (err) {
            console.error('Error deleting lesson:', err.response?.data || err.message);
            setError(`Failed to delete lesson: ${err.response?.data?.message || err.message}`);
        }
    };

    const moveModuleUp = async (moduleId) => {
        const index = modules.findIndex((m) => m.id_module === moduleId);
        if (index <= 0) return;

        const reorderedModules = [...modules];
        [reorderedModules[index], reorderedModules[index - 1]] = [reorderedModules[index - 1], reorderedModules[index]];
        const updatedModules = reorderedModules.map((m, i) => ({ ...m, order_number: i + 1 }));
        setModules(updatedModules);

        try {
            console.log('Updating module order:', updatedModules);
            await updateModuleOrder(parseInt(courseId), updatedModules.map((m) => ({ id_module: m.id_module, order_number: m.order_number })));
        } catch (err) {
            console.error('Error updating module order:', err.response?.data || err.message);
            setError(`Failed to update module order: ${err.response?.data?.message || err.message}`);
        }
    };

    const moveModuleDown = async (moduleId) => {
        const index = modules.findIndex((m) => m.id_module === moduleId);
        if (index >= modules.length - 1) return;

        const reorderedModules = [...modules];
        [reorderedModules[index], reorderedModules[index + 1]] = [reorderedModules[index + 1], reorderedModules[index]];
        const updatedModules = reorderedModules.map((m, i) => ({ ...m, order_number: i + 1 }));
        setModules(updatedModules);

        try {
            console.log('Updating module order:', updatedModules);
            await updateModuleOrder(parseInt(courseId), updatedModules.map((m) => ({ id_module: m.id_module, order_number: m.order_number })));
        } catch (err) {
            console.error('Error updating module order:', err.response?.data || err.message);
            setError(`Failed to update module order: ${err.response?.data?.message || err.message}`);
        }
    };

    const moveLessonUp = async (moduleId, lessonId) => {
        const lessonsInModule = lessonsByModule[moduleId] || [];
        const index = lessonsInModule.findIndex((l) => l.id_lesson === lessonId);
        if (index <= 0) return;

        const reorderedLessons = [...lessonsInModule];
        [reorderedLessons[index], reorderedLessons[index - 1]] = [reorderedLessons[index - 1], reorderedLessons[index]];
        const updatedLessons = reorderedLessons.map((l, i) => ({ ...l, order_number: i + 1 }));
        setLessons(lessons.map((l) => updatedLessons.find((ul) => ul.id_lesson === l.id_lesson) || l));

        try {
            console.log('Updating lesson order:', updatedLessons);
            await updateLessonOrder(moduleId, updatedLessons.map((l) => ({ id_lesson: l.id_lesson, order_number: l.order_number })));
        } catch (err) {
            console.error('Error updating lesson order:', err.response?.data || err.message);
            setError(`Failed to update lesson order: ${err.response?.data?.message || err.message}`);
        }
    };

    const moveLessonDown = async (moduleId, lessonId) => {
        const lessonsInModule = lessonsByModule[moduleId] || [];
        const index = lessonsInModule.findIndex((l) => l.id_lesson === lessonId);
        if (index >= lessonsInModule.length - 1) return;

        const reorderedLessons = [...lessonsInModule];
        [reorderedLessons[index], reorderedLessons[index + 1]] = [reorderedLessons[index + 1], reorderedLessons[index]];
        const updatedLessons = reorderedLessons.map((l, i) => ({ ...l, order_number: i + 1 }));
        setLessons(lessons.map((l) => updatedLessons.find((ul) => ul.id_lesson === l.id_lesson) || l));

        try {
            console.log('Updating lesson order:', updatedLessons);
            await updateLessonOrder(moduleId, updatedLessons.map((l) => ({ id_lesson: l.id_lesson, order_number: l.order_number })));
        } catch (err) {
            console.error('Error updating lesson order:', err.response?.data || err.message);
            setError(`Failed to update lesson order: ${err.response?.data?.message || err.message}`);
        }
    };

    const lessonsByModule = lessons.reduce((acc, lesson) => {
        if (!acc[lesson.module_id]) acc[lesson.module_id] = [];
        acc[lesson.module_id].push(lesson);
        return acc;
    }, {});

    const handleLessonClick = (lessonId) => {
        navigate(`/lesson/${lessonId}`);
    };

    const toggleModule = (moduleId) => {
        setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    if (loading) return <div className="course-loading">Loading...</div>;
    if (error) return <div className="course-error">{error}</div>;
    if (!course) return <div className="course-not-found">Course not found</div>;

    return (
        <div className="course-container">
            <div className="course-header">
                <h2>{course.course_name}</h2>
                <p>Уровень сложности: {course.diff_level || 'N/A'}</p>
                <p>Язык программирования: {course.language?.lang_name || 'N/A'}</p>
                <p>Преподаватель: {teacher?.user_fio || 'N/A'}</p>
                {canEdit && (
                    <button className="edit-course-button" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Завершить редактирование' : 'Редактировать курс'}
                    </button>
                )}
            </div>
            <div className="course-structure">
                {isEditing && (
                    <div className="course-editor">
                        <h3>Редактировать программу курса</h3>
                        <form onSubmit={handleAddModule} className="add-module-form">
                            <input
                                type="text"
                                value={newModuleName}
                                onChange={(e) => setNewModuleName(e.target.value)}
                                placeholder="Название нового модуля"
                                required
                            />
                            <button type="submit">Добавить модуль</button>
                        </form>
                        <div className="modules-list">
                            {modules.map((module, index) => (
                                <ModuleItem
                                    key={module.id_module}
                                    module={module}
                                    isEditing={isEditing}
                                    editModule={editModule}
                                    setEditModule={setEditModule}
                                    handleEditModule={handleEditModule}
                                    handleDeleteModule={handleDeleteModule}
                                    newLesson={newLesson}
                                    setNewLesson={setNewLesson}
                                    handleAddLesson={handleAddLesson}
                                    lessonsByModule={lessonsByModule}
                                    editLesson={editLesson}
                                    setEditLesson={setEditLesson}
                                    handleEditLesson={handleEditLesson}
                                    handleDeleteLesson={handleDeleteLesson}
                                    moveModuleUp={moveModuleUp}
                                    moveModuleDown={moveModuleDown}
                                    isFirst={index === 0}
                                    isLast={index === modules.length - 1}
                                    moveLessonUp={moveLessonUp}
                                    moveLessonDown={moveLessonDown}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!isEditing && (
                    <div className="course-structure">
                        <h3>Программа курса:</h3>
                        <div className="modules-list">
                            {modules.length > 0 ? (
                                modules.map((module) => (
                                    <div
                                        key={module.id_module}
                                        className={`module-card ${expandedModules[module.id_module] ? 'expanded' : ''}`}
                                    >
                                        <div className="module-header" onClick={() => toggleModule(module.id_module)}>
                                            <span className="module-order">{module.order_number}.</span>
                                            <span className="module-name">{module.module_name}</span>
                                            <span className="module-toggle">{expandedModules[module.id_module] ? '−' : '+'}</span>
                                        </div>
                                        {expandedModules[module.id_module] && (
                                            <div className="module-content">
                                                {(lessonsByModule[module.id_module] || []).length > 0 ? (
                                                    <ul className="lessons-list">
                                                        {lessonsByModule[module.id_module].map((lesson) => (
                                                            <li key={lesson.id_lesson} className="lesson-item">
                                                                <span className="lesson-order">{lesson.order_number}.</span>
                                                                <span className="lesson-link" onClick={() => handleLessonClick(lesson.id_lesson)}>
                                                                    {lesson.lesson_name}
                                                                </span>
                                                                <span className="lesson-details">(Описание: {lesson.description || 'N/A'})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="no-lessons">Доступных уроков нет</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="no-modules">Доступных модулей нет</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button className="back-button" onClick={() => navigate('/courses')}>
                Вернуться к курсам
            </button>
        </div>
    );
}

export default Course;