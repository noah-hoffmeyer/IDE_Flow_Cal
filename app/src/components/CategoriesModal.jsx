import React, { useState } from 'react';

function CategoriesModal({ categories, setCategories, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [editIdx, setEditIdx] = useState(-1);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');

  const handleAdd = () => {
    if (!name.trim()) return;
    setCategories([...categories, { id: Date.now().toString(), name: name.trim(), color }]);
    setName('');
    setColor('#6366f1');
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    setCategories(
      categories.map((cat, i) =>
        i === editIdx ? { ...cat, name: editName, color: editColor } : cat
      )
    );
    setEditIdx(-1);
  };

  const handleDelete = (idx) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const handleStartEdit = (idx) => {
    setEditIdx(idx);
    setEditName(categories[idx].name);
    setEditColor(categories[idx].color);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Categories</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Add New Category */}
          <div className="modal-section">
            <h3>Add New Category</h3>
            <div className="modal-form">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="modal-input"
              />
              <div className="color-picker-container">
                <label>Color:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="modal-color-input"
                />
                <div className="color-preview" style={{ backgroundColor: color }}></div>
              </div>
              <button onClick={handleAdd} className="modal-btn modal-btn-primary">
                Add Category
              </button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className="modal-section">
            <h3>Your Categories ({categories.length})</h3>
            {categories.length === 0 ? (
              <p className="empty-message">No categories yet. Create one above!</p>
            ) : (
              <div className="categories-grid">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="category-card">
                    {editIdx === idx ? (
                      <div className="category-edit">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="modal-input-sm"
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="modal-color-input-sm"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="category-action-btn save"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditIdx(-1)}
                          className="category-action-btn cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="category-display">
                          <div
                            className="category-color-dot"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className="category-name">{cat.name}</span>
                        </div>
                        <div className="category-actions">
                          <button
                            onClick={() => handleStartEdit(idx)}
                            className="category-action-btn edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(idx)}
                            className="category-action-btn delete"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn modal-btn-default">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoriesModal;
