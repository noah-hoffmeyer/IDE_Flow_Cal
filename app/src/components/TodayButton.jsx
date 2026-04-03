import React from 'react';

export default function TodayButton({ onClick }) {
  return (
    <button className="today-btn" onClick={onClick}>
      Today
    </button>
  );
}
