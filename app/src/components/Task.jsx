import React from 'react';

export default function Task({ task, onEdit, onDelete, onToggleComplete }) {
  return (
    <div className={`task${task.completed ? ' completed' : ''}`}> 
      <span>{task.text}</span>
      <button onClick={() => onEdit(task)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onToggleComplete(task.id)}>
        {task.completed ? 'Undo' : 'Complete'}
      </button>
    </div>
  );
}
