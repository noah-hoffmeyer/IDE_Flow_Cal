import React from 'react';
import Day from './Day';
import WeatherIcon from './WeatherIcon';

export default function Timeline({ days, selectedDate, onSelectDate, weather }) {
  const todayStr = new Date().toDateString();
  return (
    <div className="timeline-container">
      <div className="timeline-days">
        {days.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === todayStr;
          const dateKey = date.toISOString().split('T')[0];
          const w = weather && weather[dateKey];
          return (
            <div
              key={date.toISOString()}
              className={`timeline-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
              onClick={() => onSelectDate(date)}
              tabIndex={0}
              aria-label={`Select ${date.toLocaleDateString()}`}
            >
              <Day date={date}>
                {w ? (
                  <div className="weather-summary">
                    <WeatherIcon icon={w.icon} alt={w.text} />
                    <span className="weather-text">{w.text}</span>
                  </div>
                ) : (
                  <div className="weather-summary no-data">No data</div>
                )}
              </Day>
            </div>
          );
        })}
      </div>
    </div>
  );
}
