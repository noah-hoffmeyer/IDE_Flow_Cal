import React, { useState } from 'react';

function TaskEditModal({ task, categories, onSave, onClose }) {
  const [text, setText] = useState(task?.text || '');
  const [time, setTime] = useState(task?.time || '');
  const [categoryId, setCategoryId] = useState(task?.categoryId || '');

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({
      ...task,
      text: text.trim(),
      time: time.trim(),
      categoryId,
    });
    onClose();
  };

  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.color : '#cbd5e0';
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Task Description</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter task description..."
              className="modal-textarea"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Time (Optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="modal-input"
              />
            </div>

            {categories && categories.length > 0 && (
              <div className="form-group">
                <label>Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="modal-select"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categoryId && (
                  <div className="category-preview">
                    <div
                      className="category-preview-dot"
                      style={{ backgroundColor: getCategoryColor(categoryId) }}
                    ></div>
                    <span>{getCategoryName(categoryId)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="task-preview">
            <p>Preview:</p>
            <div className="preview-box">
              {time && <span className="preview-time">{time}</span>}
              <span className="preview-text">{text || 'Enter task text...'}</span>
              {categoryId && (
                <div
                  className="preview-cat-dot"
                  style={{ backgroundColor: getCategoryColor(categoryId) }}
                  title={getCategoryName(categoryId)}
                ></div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn modal-btn-default">
            Cancel
          </button>
          <button onClick={handleSave} className="modal-btn modal-btn-primary">
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditModal;
