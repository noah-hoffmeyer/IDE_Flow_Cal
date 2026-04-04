import React, { useState } from 'react';
import '../styles/MiniCalendar.css';

function MiniCalendar({ selectedDate, onSelectDate }) {
  const [displayMonth, setDisplayMonth] = useState(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    return d;
  });

  const today = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(displayMonth);
  const startDate = new Date(firstDay);
  startDate.setDate(1 - firstDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === displayMonth.getMonth();
  };

  const handlePrevMonth = () => {
    const d = new Date(displayMonth);
    d.setMonth(displayMonth.getMonth() - 1);
    setDisplayMonth(d);
  };

  const handleNextMonth = () => {
    const d = new Date(displayMonth);
    d.setMonth(displayMonth.getMonth() + 1);
    setDisplayMonth(d);
  };

  return (
    <div className="mini-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>←</button>
        <h3 className="calendar-title">
          {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </h3>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>→</button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((date, idx) => (
          <button
            key={idx}
            className={`calendar-day ${isCurrentMonth(date) ? '' : 'other-month'} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
            onClick={() => onSelectDate(date)}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MiniCalendar;
