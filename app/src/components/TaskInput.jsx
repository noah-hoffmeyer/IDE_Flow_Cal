import React, { useState } from 'react';

export default function TaskInput({ onAdd, categories }) {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd({ text: text.trim(), time: time.trim(), categoryId });
      setText('');
      setTime('');
      setCategoryId('');
    }
  };

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a new task..."
      />
      <input
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        className="task-input-time"
        placeholder="Time (optional)"
      />
      {categories && categories.length > 0 && (
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">No Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      )}
      <button type="submit">Add</button>
    </form>
  );
}
