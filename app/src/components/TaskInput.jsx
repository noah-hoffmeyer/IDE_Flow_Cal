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
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task..."
        style={{ flex: 1 }}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ width: 'auto', minWidth: '100px' }}
      />
      {categories && categories.length > 0 && (
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ width: 'auto', minWidth: '120px' }}
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}
      <button type="submit" style={{ width: 'auto', minWidth: '80px' }}>
        Add
      </button>
    </form>
  );
}
