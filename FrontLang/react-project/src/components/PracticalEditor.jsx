import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublime } from '@uiw/codemirror-theme-sublime';
import { EditorView } from '@codemirror/view';
import { getLanguages } from '../api/userApi';

function PracticalEditor({ practicalTask, lessonId, onSave, onCancel, onDelete }) {
    const [editedTask, setEditedTask] = useState({
        id_pr_task: practicalTask?.id_pr_task || null,
        lesson_id: lessonId,
        task_name: practicalTask?.task_name || '',
        description: practicalTask?.description || '',
        test_code: practicalTask?.test_code || '',
        language_id: practicalTask?.language_id || '',
    });
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const langs = await getLanguages();
                setLanguages(langs);
                if (langs.length > 0 && !editedTask.language_id) {
                    setEditedTask((prev) => ({ ...prev, language_id: langs[0].id_lang }));
                }
            } catch (err) {
                console.error('Ошибка загрузки языков:', err);
                setError('Не удалось загрузить список языков');
            }
        };
        fetchLanguages();
    }, []);

    const handleTaskNameChange = (e) => {
        setEditedTask({ ...editedTask, task_name: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        setEditedTask({ ...editedTask, description: e.target.value });
    };

    const handleTestCodeChange = (value) => {
        setEditedTask({ ...editedTask, test_code: value });
    };

    const handleLanguageIdChange = (e) => {
        setEditedTask({ ...editedTask, language_id: parseInt(e.target.value) });
    };

    const handleSubmit = () => {
        if (!editedTask.task_name.trim()) {
            alert('Название задания обязательно');
            return;
        }
        if (!editedTask.description.trim()) {
            alert('Описание задания обязательно');
            return;
        }
        if (!editedTask.test_code.trim()) {
            alert('Тестовый код обязателен');
            return;
        }
        if (!editedTask.language_id) {
            alert('Язык программирования обязателен');
            return;
        }

        console.log('Отправка данных:', editedTask);
        onSave(editedTask);
    };

    const handleDelete = () => {
        if (!editedTask.id_pr_task) {
            alert('Нет задачи для удаления');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить практическое задание?')) {
            if (typeof onDelete === 'function') {
                onDelete(editedTask.id_pr_task);
            } else {
                console.error('onDelete is not a function');
                alert('Ошибка: функция удаления не определена');
            }
        }
    };

    return (
        <div style={{ position: 'relative', padding: '20px' }}>
            <h3>Редактирование практического задания</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Загрузка...</p>}
            <div>
                <label>Название задания:</label>
                <input
                    type="text"
                    value={editedTask.task_name}
                    onChange={handleTaskNameChange}
                    style={{ width: '100%', marginBottom: '10px' }}
                />
            </div>
            <div>
                <label>Описание:</label>
                <textarea
                    value={editedTask.description}
                    onChange={handleDescriptionChange}
                    style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                />
            </div>
            <div>
                <label>Язык программирования:</label>
                <select
                    value={editedTask.language_id}
                    onChange={handleLanguageIdChange}
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={languages.length === 0}
                >
                    {languages.length === 0 && (
                        <option value="">Загрузка языков...</option>
                    )}
                    {languages.map((lang) => (
                        <option key={lang.id_lang} value={lang.id_lang}>
                            {lang.lang_name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <h4>Тестовый код (Jest):</h4>
                <CodeMirror
                    value={editedTask.test_code}
                    theme={sublime}
                    height="150px"
                    extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
                    onChange={handleTestCodeChange}
                />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <button onClick={handleSubmit} style={{ marginRight: '10px' }} disabled={loading}>
                        Сохранить
                    </button>
                    <button onClick={onCancel} disabled={loading}>
                        Отмена
                    </button>
                </div>
                {editedTask.id_pr_task && (
                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            cursor: 'pointer',
                        }}
                        disabled={loading}
                    >
                        Удалить задание
                    </button>
                )}
            </div>
        </div>
    );
}

export default PracticalEditor;