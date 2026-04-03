
import React, { useState, useEffect } from 'react';
import Timeline from './components/Timeline';
import TodayButton from './components/TodayButton';
import TaskInput from './components/TaskInput';
import Task from './components/Task';
import CategoryManager from './components/CategoryManager';

// Helper functions
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
        (err) => reject(err)
      );
    }
  });
}
function forecastToIcon(text) {
  if (!text) return 'unknown';
  const t = text.toLowerCase();
  if (t.includes('sunny') || t.includes('clear')) return 'sun';
  if (t.includes('cloud')) return 'cloud';
  if (t.includes('rain') || t.includes('showers') || t.includes('drizzle')) return 'rain';
  if (t.includes('snow')) return 'snow';
  if (t.includes('fog') || t.includes('mist')) return 'fog';
  return 'unknown';
}
function formatDate(date) {
  return date.toISOString().split('T')[0];
}
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('tasks_by_date') || '{}');
  } catch {
    return {};
  }
}
function saveTasks(tasksByDate) {
  localStorage.setItem('tasks_by_date', JSON.stringify(tasksByDate));
}
function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem('categories') || '[]');
  } catch {
    return [];
  }
}
function saveCategories(categories) {
  localStorage.setItem('categories', JSON.stringify(categories));
}
function getDaysRange(centerDate, numDays = 7) {
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthNav, setMonthNav] = useState(false);
  const [yearNav, setYearNav] = useState(false);
  const [weatherLoc, setWeatherLoc] = useState(() => {
    const saved = localStorage.getItem('weather_loc');
    return saved ? JSON.parse(saved) : null;
  });
  const [tasksByDate, setTasksByDate] = useState(() => loadTasks());
  const [weather, setWeather] = useState({});
  const [categories, setCategories] = useState(() => loadCategories());
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const days = getDaysRange(selectedDate, 7);

  useEffect(() => { saveCategories(categories); }, [categories]);
  useEffect(() => { saveTasks(tasksByDate); }, [tasksByDate]);
  useEffect(() => { if (weatherLoc) localStorage.setItem('weather_loc', JSON.stringify(weatherLoc)); }, [weatherLoc]);
  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        let coords;
        if (weatherLoc && weatherLoc.lat && weatherLoc.lon) {
          coords = weatherLoc;
        } else {
          try {
            coords = await getUserLocation();
          } catch {
            coords = { lat: 40.7128, lon: -74.006 };
          }
        }
        const pointsResp = await fetch(
          `https://api.weather.gov/points/${coords.lat},${coords.lon}`,
          {
            headers: {
              'User-Agent': 'timeline-todo-app (contact@myweatherapp.com)',
              'Accept': 'application/geo+json',
            },
          }
        );
        if (!pointsResp.ok) throw new Error('Failed to get grid endpoint');
        const pointsData = await pointsResp.json();
        const forecastUrl = pointsData.properties.forecast;
        const forecastResp = await fetch(forecastUrl, {
          headers: {
            'User-Agent': 'timeline-todo-app (contact@myweatherapp.com)',
            'Accept': 'application/geo+json',
          },
        });
        if (!forecastResp.ok) throw new Error('Failed to get forecast');
        const forecastData = await forecastResp.json();
        const dayWeather = {};
        for (const day of days) {
          const key = formatDate(day);
          const period = forecastData.properties.periods.find(
            p => p.isDaytime && p.startTime.startsWith(key)
          );
          if (period) {
            dayWeather[key] = {
              icon: forecastToIcon(period.shortForecast),
              text: period.shortForecast,
            };
          }
        }
        if (!cancelled) setWeather(dayWeather);
      } catch (err) {
        if (!cancelled) setWeatherError(err.message);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }
    fetchWeather();
    return () => { cancelled = true; };
  }, [weatherLoc, days]);

  const handleToday = () => setSelectedDate(new Date());
  const addTask = ({ text, time, categoryId }) => {
    const dateKey = formatDate(selectedDate);
    const newTask = {
      id: Date.now().toString(),
      text,
      time: time || '',
      completed: false,
      categoryId: categoryId || null,
    };
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask],
    }));
  };
  const editTask = (task) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(t => t.id === task.id ? task : t),
    }));
  };
  const deleteTask = (taskId) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(t => t.id !== taskId),
    }));
  };
  const toggleComplete = (taskId) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };
  const allTasks = tasksByDate[formatDate(selectedDate)] || [];
  const timed = allTasks.filter(t => t.time).sort((a, b) => a.time.localeCompare(b.time));
  const untimed = allTasks.filter(t => !t.time);
  const tasks = [...timed, ...untimed];
  const moveUntimedTask = (fromIdx, toIdx) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate(prev => {
      const arr = prev[dateKey] ? [...prev[dateKey]] : [];
      const timedTasks = arr.filter(t => t.time);
      const untimedTasks = arr.filter(t => !t.time);
      const [moved] = untimedTasks.splice(fromIdx, 1);
      untimedTasks.splice(toIdx, 0, moved);
      return {
        ...prev,
        [dateKey]: [...timedTasks, ...untimedTasks],
      };
    });
  };
  const moveTaskToDay = (taskId, newDate) => {
    const fromKey = formatDate(selectedDate);
    const toKey = formatDate(newDate);
    setTasksByDate(prev => {
      const fromArr = prev[fromKey] ? [...prev[fromKey]] : [];
      const toArr = prev[toKey] ? [...prev[toKey]] : [];
      const idx = fromArr.findIndex(t => t.id === taskId);
      if (idx === -1) return prev;
      const [task] = fromArr.splice(idx, 1);
      return {
        ...prev,
        [fromKey]: fromArr,
        [toKey]: [...toArr, task],
      };
    });
  };

  return (
    <div className="app-container">
      <header>
        <h1 tabIndex="0" aria-label="Timeline Todo and Calendar App">Timeline Todo + Calendar</h1>
      </header>
      <div className="header-controls">
        <TodayButton onClick={handleToday} />
        <button className="nav-btn" onClick={()=>setMonthNav(m=>!m)}>Month</button>
        <button className="nav-btn" onClick={()=>setYearNav(y=>!y)}>Year</button>
        <form className="weather-loc-form" onSubmit={e=>{e.preventDefault();}}>
          <input
            type="number"
            step="0.0001"
            placeholder="Lat"
            value={weatherLoc?.lat || ''}
            onChange={e=>setWeatherLoc(w=>({...w,lat:parseFloat(e.target.value)}))}
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Lon"
            value={weatherLoc?.lon || ''}
            onChange={e=>setWeatherLoc(w=>({...w,lon:parseFloat(e.target.value)}))}
          />
          <button type="button" onClick={()=>setWeatherLoc(null)}>Use My Location</button>
        </form>
      </div>
      {monthNav && (
        <div className="modal-overlay" onClick={()=>setMonthNav(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>Jump to Month</h3>
            <input type="month" onChange={e=>{
              const [y,m]=e.target.value.split('-');
              setSelectedDate(new Date(Number(y),Number(m)-1,1));
              setMonthNav(false);
            }} />
            <button onClick={()=>setMonthNav(false)}>Close</button>
          </div>
        </div>
      )}
      {yearNav && (
        <div className="modal-overlay" onClick={()=>setYearNav(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>Jump to Year</h3>
            <input type="number" min="1970" max="2100" placeholder="Year" onChange={e=>{
              const y=Number(e.target.value);
              if (y>1970 && y<2100) setSelectedDate(new Date(y,0,1));
              setYearNav(false);
            }} />
            <button onClick={()=>setYearNav(false)}>Close</button>
          </div>
        </div>
      )}
      <section className="section-card">
        <div className="section-title">Categories</div>
        <CategoryManager categories={categories} setCategories={setCategories} />
      </section>
      <main>
        <Timeline
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          weather={weather}
        />
        {weatherLoading && <div>Loading weather...</div>}
        {weatherError && <div className="weather-error">Weather error: {weatherError}</div>}
        <section className="section-card section-card-margin">
          <div className="section-title">Tasks for {selectedDate.toLocaleDateString()}</div>
          <TaskInput onAdd={addTask} categories={categories} />
          <div>
            {tasks.map((task, idx) => {
              const isUntimed = !task.time;
              return (
                <Task
                  key={task.id}
                  task={task}
                  onEdit={editTask}
                  onDelete={deleteTask}
                  onToggleComplete={toggleComplete}
                  draggable={isUntimed}
                  onDragStart={isUntimed ? (e) => {
                    e.dataTransfer.setData('text/plain', idx - timed.length);
                  } : undefined}
                  onDragOver={isUntimed ? (e) => e.preventDefault() : undefined}
                  onDrop={isUntimed ? (e) => {
                    e.preventDefault();
                    const from = Number(e.dataTransfer.getData('text/plain'));
                    const to = idx - timed.length;
                    if (from !== to) moveUntimedTask(from, to);
                  } : undefined}
                  days={days}
                  onMoveDay={isUntimed ? (newDate) => moveTaskToDay(task.id, newDate) : undefined}
                  categories={categories}
                  date={selectedDate}
                />
              );
            })}
            {tasks.length === 0 && <div className="empty-state">No tasks for this day.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
