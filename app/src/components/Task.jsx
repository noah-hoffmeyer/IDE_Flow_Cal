import React, { useState } from 'react';

export default function Task({ task, onEdit, onDelete, onToggleComplete, draggable, onDragStart, onDragOver, onDrop, days, onMoveDay, categories }) {
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
      className={`task${task.completed ? ' completed' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        ...(draggable ? { cursor: 'grab' } : {}),
        ...(isOverdue ? { border: '2px solid #e55353', background: '#fff3f3' } : {}),
      }}
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
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <>
          {cat && <span style={{display:'inline-block',width:14,height:14,background:cat.color,borderRadius:3,marginRight:6}} title={cat.name}></span>}
          {task.time && <span style={{marginRight:8, fontWeight:'bold'}}>{task.time}</span>}
          <span>{task.text}</span>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={() => onDelete(task.id)}>Delete</button>
          <button onClick={() => onToggleComplete(task.id)}>
            {task.completed ? 'Undo' : 'Complete'}
          </button>
          {/* Move to another day (prototype, only untimed) */}
          {draggable && days && onMoveDay && (
            <select
              value=""
              onChange={e => {
                if (e.target.value) onMoveDay(new Date(e.target.value));
              }}
              style={{ marginLeft: 8 }}
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
  );
}
