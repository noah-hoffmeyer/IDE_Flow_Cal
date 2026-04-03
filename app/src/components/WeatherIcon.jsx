import React from 'react';

export default function WeatherIcon({ icon, alt }) {
  // icon: 'sun', 'cloud', 'rain', etc.
  // For now, use emoji for simplicity
  const iconMap = {
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    fog: '🌫️',
    unknown: '❓',
  };
  return (
    <span className="weather-icon" title={alt} aria-label={alt}>
      {iconMap[icon] || iconMap.unknown}
    </span>
  );
}
