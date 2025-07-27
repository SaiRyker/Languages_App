import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api/userApi';
import logo from '../assets/logo.png';
import '../App.css';

function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserProfile();
                setUser(userData);
            } catch (err) {
                console.error('Ошибка загрузки профиля:', err);
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="site-header">
            <img
                src={logo}
                alt="Site Logo"
                className="header-logo"
                onClick={() => navigate('/')}
            />
            <div className="header-actions">
                {user && (
                    <>
                        <div
                            className="notification-icon"
                            onClick={() => navigate(`/notifications/${user.id_user}`)}
                            title="Уведомления"
                        >
                            🔔
                        </div>
                        <span className="header-user">{user.user_name}</span>
                        <button className="header-button" onClick={handleLogout}>
                            Выйти
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;