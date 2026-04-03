import React from 'react';
import Day from './Day';
import WeatherIcon from './WeatherIcon';

export default function Timeline({ days, selectedDate, onSelectDate, weather }) {
  const todayStr = new Date().toDateString();
  return (
    <div className="timeline-container" style={{overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
      <div className="timeline-days">
        {days.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === todayStr;
          const dateKey = date.toISOString().split('T')[0];
          const w = weather && weather[dateKey];
          return (
            <div
              key={date.toISOString()}
              style={{
                border: isSelected ? '2px solid #007bff' : isToday ? '2px solid #28a745' : '2px solid transparent',
                background: isToday ? '#e6f9ec' : undefined,
                cursor: 'pointer',
                transition: 'border 0.2s',
                minWidth: 180,
              }}
              onClick={() => onSelectDate(date)}
            >
              <Day date={date}>
                {w ? (
                  <div style={{marginTop:8,display:'flex',alignItems:'center',gap:4}}>
                    <WeatherIcon icon={w.icon} alt={w.text} />
                    <span style={{fontSize:'0.9em'}}>{w.text}</span>
                  </div>
                ) : (
                  <div style={{marginTop:8, color:'#bbb', fontSize:'0.9em'}}>No data</div>
                )}
              </Day>
            </div>
          );
        })}
      </div>
    </div>
  );
}
