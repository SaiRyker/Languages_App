import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse, getLanguages, createLanguage } from '../api/authApi.js';
import { DiffLevel } from '../types.ts'; // Импортируем DiffLevel
import '../App.css';

function CreateCourse() {
    const [courseName, setCourseName] = useState('');
    const [diffLevel, setDiffLevel] = useState(DiffLevel.beginner); // Используем ключ из DiffLevel
    const [language, setLanguage] = useState(''); // Храним lang_id
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [languages, setLanguages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newLangName, setNewLangName] = useState('');
    const [newLangDescription, setNewLangDescription] = useState('');
    const navigate = useNavigate();

    // Проверка авторизации и роли + загрузка языков
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Вы должны быть авторизованы');
            navigate('/login');
            return;
        }

        const getUserRoles = () => {
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
            (role) => role.role_name === 'admin' || role.role_name === 'teacher'
        );
        if (!isAdminOrTeacher) {
            setMessage('Доступ запрещён: требуется роль администратора или преподавателя');
            navigate('/profile');
            return;
        }

        // Загрузка языков
        const fetchLanguages = async () => {
            try {
                const data = await getLanguages();
                setLanguages(data);
                // Проверяем, есть ли недавно добавленный язык в localStorage
                const newlyAddedLangId = localStorage.getItem('newlyAddedLangId');
                if (newlyAddedLangId && data.some((lang) => lang.id_lang === Number(newlyAddedLangId))) {
                    setLanguage(Number(newlyAddedLangId));
                    localStorage.removeItem('newlyAddedLangId'); // Очищаем после использования
                } else if (data.length > 0) {
                    setLanguage(data[0].id_lang); // Первый язык по умолчанию
                }
            } catch (error) {
                setMessage('Ошибка загрузки языков: ' + (error.response?.data?.message || error.message));
            }
        };
        fetchLanguages();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const courseData = {
                course_name: courseName,
                diff_level: diffLevel, // Передаём ключ из DiffLevel
                lang_id: Number(language),
                description: description,
            };
            await createCourse(courseData);
            setMessage(`Курс "${courseName}" успешно создан!`);
            alert(`Курс "${courseName}" успешно создан!`);
            setCourseName('');
            setDiffLevel(DiffLevel.beginner);
            setLanguage(languages[0]?.id_lang || '');
            setDescription('');
        } catch (error) {
            setMessage('Ошибка создания курса: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCreateLanguage = async (e) => {
        e.preventDefault();
        try {
            const languageData = {
                lang_name: newLangName,
                description: newLangDescription,
            };
            const newLanguage = await createLanguage(languageData);
            // Сохраняем id_lang нового языка в localStorage
            localStorage.setItem('newlyAddedLangId', newLanguage.id_lang);
            setShowModal(false);
            setNewLangName('');
            setNewLangDescription('');
            setMessage(`Язык "${newLangName}" успешно добавлен!`);
            // Перезагружаем страницу
            window.location.reload();
        } catch (error) {
            setMessage('Ошибка добавления языка: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="register-container">
            <div className="register-wrapper">
                <h2>Создание нового курса</h2>
                {message && <p className="message">{message}</p>}
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label>Название курса</label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Уровень сложности</label>
                        <select
                            value={diffLevel}
                            onChange={(e) => setDiffLevel(e.target.value)}
                            className="form-input"
                        >
                            {Object.entries(DiffLevel).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group language-group">
                        <label>Язык программирования</label>
                        <div className="language-input-group">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="form-input"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.id_lang} value={lang.id_lang}>
                                        {lang.lang_name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="create-course-button"
                                onClick={() => {
                                    console.log('Opening modal'); // Для отладки
                                    setShowModal(true);
                                }}
                            >
                                Добавить язык
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Описание курса (опционально)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input"
                            rows="4"
                        />
                    </div>
                    <button type="submit" className="submit-button">Создать курс</button>
                </form>
            </div>

            {/* Модальное окно для создания нового языка */}
            {showModal && (
                <div className="lesson-practical task-editor-overlay">
                    <div className="task-editor">
                        <h3>Добавить новый язык</h3>
                        <form onSubmit={handleCreateLanguage}>
                            <div className="form-group">
                                <label>Название языка</label>
                                <input
                                    type="text"
                                    value={newLangName}
                                    onChange={(e) => setNewLangName(e.target.value)}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Описание (опционально)</label>
                                <textarea
                                    value={newLangDescription}
                                    onChange={(e) => setNewLangDescription(e.target.value)}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="submit-button">
                                    Добавить
                                </button>
                                <button
                                    type="button"
                                    className="submit-button"
                                    style={{ backgroundColor: '#ff4d4f' }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCourse;