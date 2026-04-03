import React, { useState } from 'react';

export default function Task({ task, onEdit, onDelete, onToggleComplete, draggable, onDragStart, onDragOver, onDrop, days, onMoveDay, categories, date }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditText(task.text);
    setEditing(false);
  };
  const handleSave = () => {
    if (editText.trim()) {
      onEdit({ ...task, text: editText.trim() });
      setEditing(false);
    }
  };
  // Find category object
  const cat = categories && task.categoryId ? categories.find(c => c.id === task.categoryId) : null;
  // Overdue logic: incomplete, date < today
  let isOverdue = false;
  if (!task.completed && date) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const taskDate = new Date(date);
    taskDate.setHours(0,0,0,0);
    isOverdue = taskDate < today;
  }
  return (
    <div
      className={`task${task.completed ? ' completed' : ''}${isOverdue ? ' overdue' : ''}${draggable ? ' draggable' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      tabIndex={0}
      aria-label={task.text}
    >
      {editing ? (
        <>
          <input
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
          />
          <button className="icon-btn" aria-label="Save" onClick={handleSave}>💾</button>
          <button className="icon-btn" aria-label="Cancel" onClick={handleCancel}>✖️</button>
        </>
      ) : (
        <>
          {cat && <span className="cat-dot" style={{'--cat-color': cat.color}} title={cat.name}></span>}
          {task.time && <span className="task-time">{task.time}</span>}
          <span className="task-text">{task.text}</span>
          <button className="icon-btn" aria-label="Edit" onClick={handleEdit}>✏️</button>
          <button className="icon-btn" aria-label="Delete" onClick={() => onDelete(task.id)}>🗑️</button>
          <button className="icon-btn" aria-label={task.completed ? 'Undo Complete' : 'Mark Complete'} onClick={() => onToggleComplete(task.id)}>
            {task.completed ? '↩️' : '✔️'}
          </button>
          {draggable && days && onMoveDay && (
            <select
              className="move-select"
              value=""
              onChange={e => {
                if (e.target.value) onMoveDay(new Date(e.target.value));
              }}
            >
              <option value="">Move to...</option>
              {days.map(d => (
                <option key={d.toISOString()} value={d.toISOString()}>
                  {d.toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </div>
  );
}
