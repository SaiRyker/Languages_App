import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {getUserGroup, getUserProfile} from "../api/userApi.js";

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
        <div>
            <div>
                <h2>Profile</h2>
                <p>Login: {user.user_login}</p>
                <p>Email: {user.user_email}</p>
                <p>Roles: {roles.join(', ') || 'No roles'}</p>
                {
                    groups.length > 0 && (
                        <div>
                            <h3>Groups:</h3>
                            <ul>
                                {
                                    groups.map((group, index) => (
                                        <li key={index}>{group.group_name} (Status: {group.status})</li>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                }
                <button onClick={() => {navigate('/courses');}}>Мои курсы</button>
                <button onClick={() => {localStorage.removeItem('token'); navigate('/login');}}>Выйти</button>
            </div>
            <div>

            </div>
        </div>
    );
}

export default Profile;