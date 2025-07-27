import { useState } from 'react';

function TestEditor({ testTask, lessonId, onSave, onCancel, onDelete }) {
    const [editedTest, setEditedTest] = useState({
        id_t_task: testTask?.id_t_task || null,
        lesson_id: lessonId,
        task_name: testTask?.task_name || '',
        description: testTask?.description || '',
        task_answers: testTask?.task_answers || [''],
        correct: testTask?.correct || [],
    });

    const handleTaskNameChange = (e) => {
        setEditedTest({ ...editedTest, task_name: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        setEditedTest({ ...editedTest, description: e.target.value });
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...editedTest.task_answers];
        const oldAnswer = newAnswers[index];
        newAnswers[index] = value;

        const newCorrect = editedTest.correct
            .filter((c) => c !== oldAnswer)
            .concat(value.trim() && editedTest.correct.includes(oldAnswer) ? [value] : []);

        setEditedTest({
            ...editedTest,
            task_answers: newAnswers,
            correct: newCorrect,
        });
    };

    const handleAddAnswer = () => {
        setEditedTest({
            ...editedTest,
            task_answers: [...editedTest.task_answers, ''],
        });
    };

    const handleRemoveAnswer = (index) => {
        const answerToRemove = editedTest.task_answers[index];
        const newAnswers = editedTest.task_answers.filter((_, i) => i !== index);
        const newCorrect = editedTest.correct.filter((c) => c !== answerToRemove);
        setEditedTest({
            ...editedTest,
            task_answers: newAnswers,
            correct: newCorrect,
        });
    };

    const handleCorrectChange = (answer) => {
        const newCorrect = editedTest.correct.includes(answer)
            ? editedTest.correct.filter((a) => a !== answer)
            : [...editedTest.correct, answer];
        setEditedTest({ ...editedTest, correct: newCorrect });
    };

    const handleSubmit = () => {
        if (!editedTest.task_name.trim() || !editedTest.description.trim()) {
            alert('Название и описание теста обязательны');
            return;
        }
        if (editedTest.task_answers.some((a) => !a.trim())) {
            alert('Все варианты ответа должны быть заполнены');
            return;
        }
        if (editedTest.correct.length === 0) {
            alert('Выберите хотя бы один правильный ответ');
            return;
        }
        if (editedTest.correct.some((c) => !editedTest.task_answers.includes(c))) {
            alert('Правильные ответы должны быть из списка вариантов ответа');
            return;
        }
        onSave(editedTest);
    };

    const handleDelete = () => {
        if (!editedTest.id_t_task) {
            alert('Нет задания для удаления');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить тестовое задание?')) {
            onDelete(editedTest.id_t_task);
        }
    };

    return (
        <div style={{ position: 'relative', padding: '20px' }}>
            <h3>Редактирование тестового задания</h3>
            <div>
                <label>Название задания:</label>
                <input
                    type="text"
                    value={editedTest.task_name}
                    onChange={handleTaskNameChange}
                    style={{ width: '100%', marginBottom: '10px' }}
                />
            </div>
            <div>
                <label>Описание/Вопрос:</label>
                <textarea
                    value={editedTest.description}
                    onChange={handleDescriptionChange}
                    style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                />
            </div>
            <div>
                <h4>Варианты ответа:</h4>
                {editedTest.task_answers.map((answer, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            style={{ width: '70%', marginRight: '10px' }}
                        />
                        <input
                            type="checkbox"
                            checked={editedTest.correct.includes(answer)}
                            onChange={() => handleCorrectChange(answer)}
                        />
                        <label>Правильный</label>
                        <button
                            onClick={() => handleRemoveAnswer(index)}
                            style={{ marginLeft: '10px' }}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
                <button onClick={handleAddAnswer} style={{ marginTop: '10px' }}>
                    Добавить вариант
                </button>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <button onClick={handleSubmit} style={{ marginRight: '10px' }}>
                        Сохранить
                    </button>
                    <button onClick={onCancel}>Отмена</button>
                </div>
                {editedTest.id_t_task && (
                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            cursor: 'pointer',
                        }}
                    >
                        Удалить задание
                    </button>
                )}
            </div>
        </div>
    );
}

export default TestEditor;