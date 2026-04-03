import React from 'react';

export default function Day({ date, children }) {
  return (
    <div className="day-cell">
      <div className="day-label">{date.toLocaleDateString()}</div>
      {children}
    </div>
  );
}
