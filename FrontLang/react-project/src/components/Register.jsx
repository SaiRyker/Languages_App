import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {register} from "../api/authApi.js";

function Register() {
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const password = Math.random().toString(36).slice(-8); // Генерация случайного пароля
        try {
            await register({ login, email, role, fullName, password });
            setMessage(`Регистрация успешна! Логин: ${login}, Почта: ${email}, Пароль: ${password}`);
            alert(`Регистрация успешна!\nЛогин: ${login}\nПочта: ${email}\nПароль: ${password}`);
            setLogin('');
            setEmail('');
            setRole('user');
            setFullName('');
        } catch (error) {
            setMessage('Ошибка регистрации: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="register-container">
            <div className="register-wrapper">
                <h2>Регистрация нового пользователя</h2>
                {message && <p className="message">{message}</p>}
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label>Логин</label>
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Электронная почта</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Роль</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-input"
                        >
                            <option value="user">User</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>ФИО</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Зарегистрировать</button>
                </form>
            </div>
        </div>
    );
}

export default Register;