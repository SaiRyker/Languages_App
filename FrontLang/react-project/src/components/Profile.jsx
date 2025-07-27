import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {getUserGroup, getUserProfile} from "../api/userApi.js";
import '../App.css';

function Profile() {
    const [user, setUser] = useState(null);
     const [groups, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const profileData = await getUserProfile();
                const groupsData = await getUserGroup();
                setUser(profileData);
                setGroup(groupsData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load profile');
                setLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return null;

    const roles = user.roles?.map((role) => role.role_name) || [];

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                <div className="profile-card">
                    <h2>Профиль</h2>
                    <p className="profile-info">ФИО: {user.user_fio}</p>
                    <p className="profile-info">Логин: {user.user_login}</p>
                    <p className="profile-info">Email: {user.user_email}</p>
                    <p className="profile-info">Должность: {roles.join(', ') || 'No roles'}</p>
                    {
                        groups.length > 0 && (
                            <div className="groups-section">
                                <h3>Студенческая группа:</h3>
                                <ul className="groups-list">
                                    {
                                        groups.map((group, index) => (
                                            <li className="group-item" key={index}>{group.group_name} (Статус: {group.status})</li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )
                    }
                    <div className="profile-actions">
                        <button
                            className="action-button-profile courses-button"
                            onClick={() => navigate('/courses')}
                        >
                            Мои курсы
                        </button>
                        <button
                            className="action-button-profile logout-button"
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
            <div>

            </div>
        </div>
    );
}

export default Profile;