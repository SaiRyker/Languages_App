import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import '../App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await login({ user_email: email, user_password: password });
            localStorage.setItem('token', response.token);
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
            <img src="src/assets/logo.png" alt="Site Logo" className="site-logo"/>
            <div className="login-form">
                <h2>Вход в аккаунт</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        {/*<label>Email или логин:</label>*/}
                        <input placeholder="Введите логин или Email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    </div>
                    <div className="form-group">
                        {/*<label>Пароль:</label>*/}
                        <input placeholder="Введите пароль" className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <button className="submit-button" type="submit">Войти</button>
                </form>
            </div>
            </div>
        </div>
    );
}

export default Login;