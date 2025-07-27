import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgressByCreator, getUserProfile } from '../api/userApi';

function UserProgress() {
    const [progressData, setProgressData] = useState([]);
    const [creatorId, setCreatorId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получение профиля текущего пользователя для получения creator_id
                const userProfile = await getUserProfile();
                if (!userProfile.id_user) {
                    throw new Error('Пользователь не авторизован');
                }
                setCreatorId(userProfile.id_user);

                // Получение прогресса пользователей по курсам преподавателя
                const progress = await getProgressByCreator(userProfile.id_user);
                console.log(userProfile)
                console.log(progress)
                setProgressData(progress);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError(err.message || 'Не удалось загрузить данные прогресса');
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Не начат':
                return 'gray';
            case 'В процессе':
                return 'orange';
            case 'Завершен':
                return 'green';
            default:
                return 'black';
        }
    };

    return (
        <div className="groups-wrapper" style={{ padding: '20px' }}>
            <h2>Прогресс пользователей</h2>
            {loading && <p>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && progressData.length === 0 && (
                <p>Нет данных о прогрессе пользователей</p>
            )}
            {!loading && !error && progressData.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgb(84 84 84)' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Студент</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Курс</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Прогресс (%)</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Статус</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Дата завершения</th>
                    </tr>
                    </thead>
                    <tbody>
                    {progressData.map((progress) => (
                        <tr key={progress.id_progress}>
                            <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: "#343434" }}>
                                {progress.user?.user_fio || 'Неизвестный пользователь'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: "#343434" }}>
                                {progress.course?.course_name || 'Неизвестный курс'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: "#343434", textAlign: 'center' }}>
                                {progress.completion_percent}%
                            </td>
                            <td
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'center',
                                    color: getStatusColor(progress.status)
                                    , backgroundColor: "#343434"
                                }}
                            >
                                {progress.status}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: "#343434" }}>
                                {progress.completion_date
                                    ? new Date(progress.completion_date).toLocaleDateString()
                                    : '-'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserProgress;