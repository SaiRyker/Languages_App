import React, { useState, useEffect } from 'react';
import { getPrTaskByLessonId, updatePrTask } from '../api/userApi'; // Укажи правильный путь к userApi
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublime } from '@uiw/codemirror-theme-sublime';
import { EditorView } from '@codemirror/view';

const PracticalEditor = ({ lessonId, onClose, onTaskUpdated }) => {
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [testCode, setTestCode] = useState('');
    const [languageId, setLanguageId] = useState('javascript');
    const [taskId, setTaskId] = useState(null); // Храним taskId для обновления
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка данных задания при монтировании
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const task = await getPrTaskByLessonId(lessonId);
                if (!task) {
                    throw new Error('Task not found for this lesson');
                }
                setTaskId(task.id_pr_task);
                setTaskName(task.task_name);
                setDescription(task.description);
                setTestCode(task.test_code);
                setLanguageId(task.language_id);
            } catch (err) {
                setError('Failed to load task data');
                console.error('Error fetching task:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [lessonId]);

    const handleSaveTask = async () => {
        try {
            const response = await updatePrTask(taskId, {
                task_name: taskName,
                description,
                test_code: testCode,
                language_id: languageId,
                lesson_id: lessonId,
            });
            console.log('Task updated:', response);
            if (onTaskUpdated && typeof onTaskUpdated === 'function') {
                onTaskUpdated(); // Вызываем обновление данных
            }
            if (onClose && typeof onClose === 'function') {
                onClose(); // Закрываем редактор
            }
        } catch (error) {
            console.error('Error updating task:', error);
            setError('Failed to update task');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#000000' }}>
            <h2>Edit Task</h2>
            <div>
                <label>
                    Task Name:
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                </label>
            </div>
            <div>
                <label>
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                </label>
            </div>
            <div>
                <label>
                    Language:
                    <input
                        type="text"
                        value={languageId}
                        onChange={(e) => setLanguageId(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                </label>
            </div>
            <div>
                <h4>Test Code (Jest):</h4>
                <CodeMirror
                    value={testCode}
                    theme={sublime}
                    height="150px"
                    extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
                    onChange={(value) => setTestCode(value)}
                />
            </div>
            <button onClick={handleSaveTask} style={{ marginTop: '10px' }}>
                Save Changes
            </button>
        </div>
    );
};

export default PracticalEditor;