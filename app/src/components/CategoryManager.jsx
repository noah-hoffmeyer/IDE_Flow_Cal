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
    <div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Category name" />
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <ul style={{listStyle:'none',padding:0}}>
        {categories.map((cat, idx) => (
          <li key={cat.id} style={{marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
            <span style={{display:'inline-block',width:16,height:16,background:cat.color,borderRadius:4,marginRight:4}}></span>
            {editIdx === idx ? (
              <>
                <input value={editName} onChange={e=>setEditName(e.target.value)} style={{width:90}} />
                <input type="color" value={editColor} onChange={e=>setEditColor(e.target.value)} />
                <button onClick={saveEdit}>Save</button>
                <button onClick={()=>setEditIdx(-1)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{cat.name}</span>
                <button onClick={()=>startEdit(idx)}>Edit</button>
                <button onClick={()=>remove(idx)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
