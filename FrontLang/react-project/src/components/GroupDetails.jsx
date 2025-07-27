import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addStudentsToGroup, getGroupStudents, getAllStudents, getGroupCourses, removeStudentsFromGroup, removeCoursesFromGroup } from '../api/userApi.js';
import '../App.css';

const GroupDetails = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [filterFio, setFilterFio] = useState('');
    const [filterCourseName, setFilterCourseName] = useState('');
    const [addFilterFio, setAddFilterFio] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState('students');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);

    // Загрузка студентов группы, всех студентов и курсов группы
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [groupStudents, allStudentsData, groupCourses] = await Promise.all([
                    getGroupStudents(groupId),
                    getAllStudents(),
                    getGroupCourses(groupId),
                ]);
                console.log('Получены студенты группы:', groupStudents);
                console.log('Получены все студенты:', allStudentsData);
                console.log('Получены курсы группы:', groupCourses);
                const studentsArray = Array.isArray(allStudentsData) ? allStudentsData : [];
                const coursesArray = Array.isArray(groupCourses) ? groupCourses : [];
                setStudents(Array.isArray(groupStudents) ? groupStudents : []);
                setAllStudents(studentsArray);
                setCourses(coursesArray);
                setError(null);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err.response?.data || err.message);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError('Не удалось загрузить данные: ' + (err.response?.data?.message || err.message));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId, navigate]);

    // Обработка добавления студентов
    const handleAddStudents = async (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            setError('Выберите хотя бы одного студента.');
            return;
        }
        const studentIds = selectedStudents.map((student) => student.id_user);
        try {
            await addStudentsToGroup({ group_id: parseInt(groupId), student_ids: studentIds });
            setSuccess('Студенты успешно добавлены!');
            setError(null);
            setSelectedStudents([]);
            setShowAddModal(false);
            setAddFilterFio('');
            setSelectedStudentId('');
            const updatedStudents = await getGroupStudents(groupId);
            console.log('Обновлённый список студентов:', updatedStudents);
            setStudents(Array.isArray(updatedStudents) ? updatedStudents : []);
        } catch (err) {
            console.error('Ошибка добавления студентов:', err.response?.data || err.message);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Не удалось добавить студентов: ' + (err.response?.data?.message || err.message));
            }
            setSuccess(null);
        }
    };

    // Обработка удаления студентов
    const handleRemoveStudents = async () => {
        if (selectedStudentIds.length === 0) {
            setError('Выберите хотя бы одного студента для удаления.');
            return;
        }
        try {
            await removeStudentsFromGroup({ group_id: parseInt(groupId), student_ids: selectedStudentIds });
            setSuccess('Студенты успешно удалены!');
            setError(null);
            setSelectedStudentIds([]);
            const updatedStudents = await getGroupStudents(groupId);
            setStudents(Array.isArray(updatedStudents) ? updatedStudents : []);
        } catch (err) {
            console.error('Ошибка удаления студентов:', err.response?.data || err.message);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Не удалось удалить студентов: ' + (err.response?.data?.message || err.message));
            }
            setSuccess(null);
        }
    };

    // Обработка удаления курсов
    const handleRemoveCourses = async () => {
        if (selectedCourseIds.length === 0) {
            setError('Выберите хотя бы один курс для удаления.');
            return;
        }
        try {
            await removeCoursesFromGroup({ group_id: parseInt(groupId), course_ids: selectedCourseIds });
            setSuccess('Курсы успешно удалены!');
            setError(null);
            setSelectedCourseIds([]);
            const updatedCourses = await getGroupCourses(groupId);
            setCourses(Array.isArray(updatedCourses) ? updatedCourses : []);
        } catch (err) {
            console.error('Ошибка удаления курсов:', err.response?.data || err.message);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Не удалось удалить курсы: ' + (err.response?.data?.message || err.message));
            }
            setSuccess(null);
        }
    };

    // Обработка добавления студента в список выбранных
    const handleAddSelectedStudent = () => {
        if (!selectedStudentId) return;
        const selectedStudent = allStudents.find(
            (student) => student.id_user === parseInt(selectedStudentId)
        );
        if (
            selectedStudent &&
            !selectedStudents.some((s) => s.id_user === selectedStudent.id_user)
        ) {
            setSelectedStudents([...selectedStudents, selectedStudent]);
            setSelectedStudentId('');
            setAddFilterFio('');
        }
    };

    // Обработка удаления студента из выбранных (в модальном окне)
    const handleRemoveStudent = (id) => {
        setSelectedStudents(selectedStudents.filter((student) => student.id_user !== id));
    };

    // Обработка выбора студента через checkbox
    const handleSelectStudent = (id) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    // Обработка выбора курса через checkbox
    const handleSelectCourse = (id) => {
        if (selectedCourseIds.includes(id)) {
            setSelectedCourseIds(selectedCourseIds.filter((cid) => cid !== id));
        } else {
            setSelectedCourseIds([...selectedCourseIds, id]);
        }
    };

    // Фильтрация студентов в таблице
    const filteredStudents = Array.isArray(students)
        ? students.filter((student) =>
            student.user_fio.toLowerCase().includes(filterFio.toLowerCase())
        )
        : [];

    // Фильтрация курсов в таблице
    const filteredCourses = Array.isArray(courses)
        ? courses.filter((course) =>
            course.course_name.toLowerCase().includes(filterCourseName.toLowerCase())
        )
        : [];

    // Фильтрация студентов для <select>
    const availableStudents = Array.isArray(allStudents)
        ? allStudents.filter(
            (student) => !students.some((groupStudent) => groupStudent.id_user === student.id_user)
        )
        : [];
    const filteredAvailableStudents = availableStudents.filter((student) =>
        student.user_fio.toLowerCase().includes(addFilterFio.toLowerCase())
    );

    console.log('availableStudents:', availableStudents);
    console.log('filteredStudents:', filteredStudents);
    console.log('filteredCourses:', filteredCourses);
    console.log('filteredAvailableStudents:', filteredAvailableStudents);

    return (
        <div className="groups-container content-with-sidebar">
            <div className="groups-wrapper">
                <h2>Детали группы</h2>
                <div className="groups-actions">
                    <h3>Добавить студентов</h3>
                    <button className="submit-button edit-button" onClick={() => setShowAddModal(true)}>
                        Выбрать студентов
                    </button>
                    <button
                        className="submit-button edit-button"
                        onClick={() => {
                            setIsEditing(!isEditing);
                            setSelectedStudentIds([]);
                            setSelectedCourseIds([]);
                        }}
                    >
                        {isEditing ? 'Отмена редактирования' : 'Редактировать'}
                    </button>
                </div>
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Состав группы
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        Доступные курсы
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="message success-message">{success}</p>}
                {loading ? (
                    <p className="profile-loading">Загрузка данных...</p>
                ) : (
                    <div className="groups-list">
                        {activeTab === 'students' && (
                            <>
                                <div className="filter-section">
                                    <div className="form-group">
                                        <label>Фильтр по ФИО</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={filterFio}
                                            onChange={(e) => setFilterFio(e.target.value)}
                                            placeholder="Введите ФИО для поиска"
                                        />
                                    </div>
                                </div>
                                {isEditing && (
                                    <button
                                        className="submit-button delete-button"
                                        onClick={handleRemoveStudents}
                                        disabled={selectedStudentIds.length === 0}
                                    >
                                        Удалить выбранные
                                    </button>
                                )}
                                {filteredStudents.length === 0 ? (
                                    <p className="courses-empty">Студенты не найдены.</p>
                                ) : (
                                    <table className="groups-table">
                                        <thead>
                                        <tr>
                                            {isEditing && <th>Выбрать</th>}
                                            <th>№</th>
                                            <th>Email студента</th>
                                            <th>ФИО студента</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredStudents.map((student, index) => (
                                            <tr key={student.id_user} className="group-row">
                                                {isEditing && (
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudentIds.includes(student.id_user)}
                                                            onChange={() => handleSelectStudent(student.id_user)}
                                                        />
                                                    </td>
                                                )}
                                                <td>{index + 1}</td>
                                                <td>{student.user_email}</td>
                                                <td>{student.user_fio}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                        {activeTab === 'courses' && (
                            <>
                                <div className="filter-section">
                                    <div className="form-group">
                                        <label>Фильтр по названию курса</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={filterCourseName}
                                            onChange={(e) => setFilterCourseName(e.target.value)}
                                            placeholder="Введите название курса"
                                        />
                                    </div>
                                </div>
                                {isEditing && (
                                    <button
                                        className="submit-button delete-button"
                                        onClick={handleRemoveCourses}
                                        disabled={selectedCourseIds.length === 0}
                                    >
                                        Удалить выбранные
                                    </button>
                                )}
                                {filteredCourses.length === 0 ? (
                                    <p className="courses-empty">Курсы не найдены.</p>
                                ) : (
                                    <table className="groups-table">
                                        <thead>
                                        <tr>
                                            {isEditing && <th>Выбрать</th>}
                                            <th>№</th>
                                            <th>Название курса</th>
                                            <th>Описание</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredCourses.map((course, index) => (
                                            <tr key={course.id_course} className="group-row">
                                                {isEditing && (
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCourseIds.includes(course.id_course)}
                                                            onChange={() => handleSelectCourse(course.id_course)}
                                                        />
                                                    </td>
                                                )}
                                                <td>{index + 1}</td>
                                                <td>{course.course_name}</td>
                                                <td>{course.course_description || 'Нет описания'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Модальное окно для выбора студентов */}
                {showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Выбрать студентов</h3>
                            <form onSubmit={handleAddStudents} className="modal-form">
                                <div className="form-group">
                                    <label>Поиск по ФИО</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={addFilterFio}
                                        onChange={(e) => setAddFilterFio(e.target.value)}
                                        placeholder="Введите ФИО студента"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Выберите студента</label>
                                    <select
                                        className="form-input"
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                    >
                                        <option value="">Выберите студента</option>
                                        {filteredAvailableStudents.map((student) => (
                                            <option key={student.id_user} value={student.id_user}>
                                                {student.user_fio} ({student.user_email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="submit-button"
                                    onClick={handleAddSelectedStudent}
                                    disabled={!selectedStudentId}
                                >
                                    Добавить в список
                                </button>
                                {selectedStudents.length > 0 && (
                                    <div className="selected-students">
                                        <h4>Выбранные студенты:</h4>
                                        <ul>
                                            {selectedStudents.map((student) => (
                                                <li key={student.id_user}>
                                                    {student.user_fio} ({student.user_email})
                                                    <button
                                                        type="button"
                                                        className="remove-student-button"
                                                        onClick={() => handleRemoveStudent(student.id_user)}
                                                    >
                                                        Удалить
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button type="submit" className="submit-button">
                                        Добавить студентов
                                    </button>
                                    <button
                                        type="button"
                                        className="action-button logout-button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setSelectedStudents([]);
                                            setAddFilterFio('');
                                            setSelectedStudentId('');
                                        }}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupDetails;