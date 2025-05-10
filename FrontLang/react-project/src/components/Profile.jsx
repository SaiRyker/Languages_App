import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {getUserGroup, getUserProfile} from "../api/userApi.js";

function Profile() {
    const [user, setUser] = useState(null);
    // const [group, setGroup] = useState(null);
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
                const [profileData, groupData] = await Promise.all([
                    getUserProfile(),
                    // getUserGroup(),
                ])
                setUser(profileData);
                // setGroup(groupData);
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
        <div>
            <div>
                <h2>Profile</h2>
                <p>Login: {user.user_login}</p>
                <p>Email: {user.user_email}</p>
                <p>Roles: {roles.join(', ') || 'No roles'}</p>
                <button onClick={() => {navigate('/courses');}}>Мои курсы</button>
                <button onClick={() => {localStorage.removeItem('token'); navigate('/login');}}>Выйти</button>
            </div>
            <div>

            </div>
        </div>
    );
}

export default Profile;