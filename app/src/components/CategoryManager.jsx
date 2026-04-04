import React, { useState } from 'react';

function CategoryManager({ categories, setCategories }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#007bff');
  const [editIdx, setEditIdx] = useState(-1);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#007bff');

  const add = () => {
    if (!name.trim()) return;
    setCategories([...categories, { id: Date.now().toString(), name: name.trim(), color }]);
    setName('');
  };
  const remove = (idx) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };
  const startEdit = (idx) => {
    setEditIdx(idx);
    setEditName(categories[idx].name);
    setEditColor(categories[idx].color);
  };
  const saveEdit = () => {
    if (!editName.trim()) return;
    setCategories(categories.map((cat, i) => i === editIdx ? { ...cat, name: editName, color: editColor } : cat));
    setEditIdx(-1);
  };
  return (
    <div className="cat-manager">
      <div className="cat-input-row">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Category name" className="cat-name-input" />
        <div className="cat-color-picker-wrapper">
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="cat-color-picker" />
        </div>
        <button className="icon-btn cat-add-btn" aria-label="Add Category" onClick={add}>+</button>
      </div>
      <ul className="cat-list">
        {categories.map((cat, idx) => (
          <li key={cat.id} className="cat-list-item">
            <span className="cat-dot" style={{'--cat-color': cat.color}}></span>
            {editIdx === idx ? (
              <>
                <input value={editName} onChange={e=>setEditName(e.target.value)} className="cat-edit-input" />
                <div className="cat-color-picker-wrapper">
                  <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} className="cat-color-picker" />
                </div>
                <button className="icon-btn" aria-label="Save" onClick={saveEdit}>✓</button>
                <button className="icon-btn" aria-label="Cancel" onClick={()=>setEditIdx(-1)}>✕</button>
              </>
            ) : (
              <>
                <span className="cat-name">{cat.name}</span>
                <button className="icon-btn" aria-label="Edit" onClick={()=>startEdit(idx)}>✎</button>
                <button className="icon-btn" aria-label="Delete" onClick={()=>remove(idx)}>⊘</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
