import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getUserNotifications,
    markNotificationAsRead,
    getUserProfile,
    getAllUsers,
    sendBulkNotification,
} from '../api/userApi';
import '../App.css';

function NotificationsPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        recipientType: 'students', // По умолчанию "Всем студентам"
        user_ids: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserProfile();
                setCurrentUser(userData);

                if (parseInt(userId) !== userData.id_user) {
                    navigate('/unauthorized');
                    return;
                }

                const notifs = await getUserNotifications(parseInt(userId));
                setNotifications(notifs);

                if (userData.roles.some((role) => ['admin', 'teacher'].includes(role.role_name))) {
                    const allUsers = await getAllUsers();
                    setUsers(allUsers);
                }

                setLoading(false);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные');
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, navigate]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            const updatedNotif = await markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id_notification === notificationId ? { ...notif, status: updatedNotif.status } : notif
                )
            );
        } catch (err) {
            console.error('Ошибка отметки уведомления:', err);
            setError('Не удалось отметить уведомление как прочитанное');
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ title: '', content: '', recipientType: 'students', user_ids: [] });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRecipientTypeChange = (e) => {
        setFormData((prev) => ({ ...prev, recipientType: e.target.value, user_ids: [] }));
    };

    const handleUserSelect = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map((option) => parseInt(option.value));
        setFormData((prev) => ({ ...prev, user_ids: selectedOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dto = {
                creator_id: currentUser.id_user,
                title: formData.title,
                content: formData.content,
            };
            if (formData.recipientType === 'specific') {
                dto.user_ids = formData.user_ids;
            } else if (formData.recipientType === 'students') {
                dto.roles = ['student'];
            } else if (formData.recipientType === 'teachers') {
                dto.roles = ['teacher'];
            } else if (formData.recipientType === 'admins') {
                dto.roles = ['admin'];
            }
            await sendBulkNotification(dto);
            closeModal();
            alert('Уведомления отправлены!');
            if (
                formData.user_ids.includes(currentUser.id_user) ||
                ['students', 'teachers', 'admins'].includes(formData.recipientType) &&
                currentUser.roles.some((role) => role.role_name === formData.recipientType.slice(0, -1))
            ) {
                const notifs = await getUserNotifications(parseInt(userId));
                setNotifications(notifs);
            }
        } catch (err) {
            console.error('Ошибка отправки уведомлений:', err);
            setError('Не удалось отправить уведомления');
        }
    };

    const isAdminOrTeacher = currentUser?.roles.some((role) =>
        ['admin', 'teacher'].includes(role.role_name)
    );

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2>Ваши уведомления</h2>
                {isAdminOrTeacher && (
                    <button className="send-notification-button" onClick={openModal}>
                        Отправить уведомление
                    </button>
                )}
            </div>
            {notifications.length === 0 ? (
                <p>Нет уведомлений</p>
            ) : (
                <ul className="notifications-list">
                    {notifications.map((notif) => (
                        <li
                            key={notif.id_notification}
                            className={`notification-item ${notif.status === 'unread' ? 'unread' : 'read'}`}
                        >
                            <div className="notification-header">
                                <h3>{notif.title}</h3>
                                <span className="notification-date">
                  {new Date(notif.sent_date).toLocaleString()}
                </span>
                            </div>
                            <p className="notification-content">{notif.content}</p>
                            <p className="notification-creator">
                                От: {notif.creator?.user_fio || 'Неизвестный пользователь'}
                            </p>
                            {notif.status === 'unread' && (
                                <button
                                    className="mark-read-button"
                                    onClick={() => handleMarkAsRead(notif.id_notification)}
                                >
                                    Отметить прочитанным
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Создать уведомление</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Заголовок</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Введите заголовок"
                                />
                            </div>
                            <div className="form-group">
                                <label>Содержимое</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Введите текст уведомления"
                                    rows={5}
                                />
                            </div>
                            <div className="form-group">
                                <label>Получатели</label>
                                <div className="recipient-options">
                                    <label>
                                        <input
                                            type="radio"
                                            name="recipientType"
                                            value="students"
                                            checked={formData.recipientType === 'students'}
                                            onChange={handleRecipientTypeChange}
                                        />
                                        Всем студентам
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="recipientType"
                                            value="teachers"
                                            checked={formData.recipientType === 'teachers'}
                                            onChange={handleRecipientTypeChange}
                                        />
                                        Всем преподавателям
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="recipientType"
                                            value="admins"
                                            checked={formData.recipientType === 'admins'}
                                            onChange={handleRecipientTypeChange}
                                        />
                                        Всем администраторам
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="recipientType"
                                            value="specific"
                                            checked={formData.recipientType === 'specific'}
                                            onChange={handleRecipientTypeChange}
                                        />
                                        Конкретным пользователям
                                    </label>
                                </div>
                                {formData.recipientType === 'specific' && (
                                    <div className="user-select">
                                        <label>Выберите пользователей</label>
                                        <select
                                            multiple
                                            value={formData.user_ids}
                                            onChange={handleUserSelect}
                                            size={5}
                                        >
                                            {users.map((user) => (
                                                <option key={user.id_user} value={user.id_user}>
                                                    {user.user_name} ({user.roles.map((r) => r.role_name).join(', ')})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="modal-submit-button">
                                    Отправить
                                </button>
                                <button type="button" className="modal-cancel-button" onClick={closeModal}>
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

export default NotificationsPage;