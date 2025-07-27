import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGroups, createGroup, getCoursesByCreatorId, addCourseToGroup } from '../api/userApi.js';
import '../App.css';

const Groups = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [curatedOnly, setCuratedOnly] = useState(false);
    const [filterGroupName, setFilterGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [assignGroupId, setAssignGroupId] = useState('');
    const [assignCourseId, setAssignCourseId] = useState('');
    const [userCourses, setUserCourses] = useState([]);
    const [assignCuratedOnly, setAssignCuratedOnly] = useState(false);
    const [filteredGroups, setFilteredGroups] = useState([]);

    // Извлечение ID пользователя из JWT
    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Токен не найден');
            return null;
        }
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            console.log('Расшифрованный payload:', payload);
            return payload.id || null;
        } catch (e) {
            console.error('Ошибка декодирования токена:', e);
            return null;
        }
    };

    const userId = getUserId();

    // Перенаправление на логин, если пользователь не аутентифицирован
    useEffect(() => {
        if (!userId) {
            console.log('Перенаправление на /login из-за отсутствия userId');
            navigate('/login');
        }
    }, [userId, navigate]);

    // Загрузка групп и курсов пользователя
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Загрузка данных с userId:', userId, 'curatedOnly:', curatedOnly);
                const [groupsData, coursesData] = await Promise.all([
                    getAllGroups(curatedOnly, userId),
                    userId ? getCoursesByCreatorId(userId) : Promise.resolve([]),
                ]);
                console.log('Получены группы:', groupsData);
                console.log('Получены курсы:', coursesData);
                setGroups(groupsData);
                setUserCourses(coursesData);
            } catch (err) {
                console.error('Ошибка загрузки:', err.response?.data || err.message);
                if (err.response?.status === 401) {
                    console.log('Ошибка 401, перенаправление на /login');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError(`Ошибка загрузки данных: ${err.response?.data?.message || err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchData();
        }
    }, [curatedOnly, userId, navigate]);

    // Фильтрация групп по названию и curatedOnly
    useEffect(() => {
        const newFilteredGroups = groups.filter(
            (group) =>
                (!assignCuratedOnly || group.curator?.id_user === userId) &&
                group.group_name.toLowerCase().includes(filterGroupName.toLowerCase())
        );
        console.log('Отфильтрованные группы:', newFilteredGroups);
        setFilteredGroups(newFilteredGroups);
    }, [assignCuratedOnly, groups, userId, filterGroupName]);

    // Обработка создания группы
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            setError('Название группы обязательно.');
            return;
        }
        const groupDto = {
            group_name: groupName,
            curator_id: userId,
        };
        console.log('Создание группы с DTO:', groupDto);
        try {
            const newGroup = await createGroup(groupDto);
            setSuccess('Группа успешно создана!');
            setError(null);
            setShowCreateModal(false);
            setGroupName('');
            navigate(`/group/${newGroup.id_group}`);
        } catch (err) {
            console.error('Ошибка создания группы:', err.response?.data || err.message);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError(`Ошибка создания группы: ${err.response?.data?.message || err.message}`);
            }
            setSuccess(null);
        }
    };

    // Обработка назначения курса
    const handleAssignCourse = async (e) => {
        e.preventDefault();
        if (!assignGroupId || !assignCourseId) {
            setError('Выберите группу и курс.');
            return;
        }
        try {
            await addCourseToGroup({
                group_id: parseInt(assignGroupId),
                course_ids: [parseInt(assignCourseId)],
            });
            setSuccess('Курс успешно назначен!');
            setError(null);
            setShowAssignModal(false);
            setAssignGroupId('');
            setAssignCourseId('');
            setAssignCuratedOnly(false);
        } catch (err) {
            console.error('Ошибка назначения курса:', err.response?.data || err.message);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError(`Ошибка назначения курса: ${err.response?.data?.message || err.message}`);
            }
            setSuccess(null);
        }
    };

    // Переход на страницу деталей группы
    const handleGroupClick = (groupId) => {
        console.log('Переход к группе:', groupId);
        navigate(`/group/${groupId}`);
    };

    return (
        <div className="groups-container content-with-sidebar">
            <div className="groups-wrapper">
                <h2>Группы</h2>
                <div className="groups-actions">
                    <button className="create-group-button" onClick={() => setShowCreateModal(true)}>
                        Создать группу
                    </button>
                    <button className="submit-button" onClick={() => setShowAssignModal(true)}>
                        Назначить курс
                    </button>
                </div>
                <div className="filter-section">
                    <div className="form-group">
                        <label>
                            <input
                                className = "group-input"
                                type="checkbox"
                                checked={curatedOnly}
                                onChange={() => setCuratedOnly(!curatedOnly)}
                            />
                            Показать только мои группы
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Фильтр по названию группы</label>
                        <input
                            type="text"
                            className="form-input"
                            value={filterGroupName}
                            onChange={(e) => setFilterGroupName(e.target.value)}
                            placeholder="Введите название группы"
                        />
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="message success-message">{success}</p>}
                {loading ? (
                    <p className="profile-loading">Загрузка групп...</p>
                ) : (
                    <div className="groups-list">
                        {filteredGroups.length === 0 ? (
                            <p className="courses-empty">Группы не найдены.</p>
                        ) : (
                            <table className="groups-table">
                                <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Название группы</th>
                                    <th>Куратор</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredGroups.map((group, index) => (
                                    <tr key={group.id_group} className="group-row">
                                        <td>{index + 1}</td>
                                        <td>
                        <span
                            className="group-name-link"
                            onClick={() => handleGroupClick(group.id_group)}
                        >
                          {group.group_name}
                        </span>
                                        </td>
                                        <td>{group.curator ? group.curator.user_fio : 'Нет'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Модальное окно создания группы */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Создать новую группу</h3>
                        <form onSubmit={handleCreateGroup} className="modal-form">
                            <div className="form-group">
                                <label>Название группы</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Введите название группы"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="submit-button">
                                    Создать группу
                                </button>
                                <button
                                    type="button"
                                    className="action-button logout-button"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно назначения курса */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Назначить курс группе</h3>
                        <form onSubmit={handleAssignCourse} className="modal-form">
                            <div className="form-group">
                                <label>Фильтр групп</label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={assignCuratedOnly}
                                        onChange={() => setAssignCuratedOnly(!assignCuratedOnly)}
                                    />
                                    Показать только мои группы
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Выберите группу</label>
                                <select
                                    className="form-input"
                                    value={assignGroupId}
                                    onChange={(e) => setAssignGroupId(e.target.value)}
                                    required
                                >
                                    <option value="">Выберите группу</option>
                                    {filteredGroups.map((group) => (
                                        <option key={group.id_group} value={group.id_group}>
                                            {group.group_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Выберите курс</label>
                                <select
                                    className="form-input"
                                    value={assignCourseId}
                                    onChange={(e) => setAssignCourseId(e.target.value)}
                                    required
                                >
                                    <option value="">Выберите курс</option>
                                    {userCourses.map((course) => (
                                        <option key={course.id_course} value={course.id_course}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="submit-button">
                                    Назначить курс
                                </button>
                                <button
                                    type="button"
                                    className="action-button logout-button"
                                    onClick={() => setShowAssignModal(false)}
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
};

export default Groups;