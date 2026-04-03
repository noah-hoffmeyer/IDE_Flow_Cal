import React, { useState } from 'react';
import Timeline from './components/Timeline';
import TodayButton from './components/TodayButton';
import TaskInput from './components/TaskInput';
import Task from './components/Task';
import WeatherIcon from './components/WeatherIcon';
// Helper to get user's approximate location (browser geolocation)
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

// Helper to map NWS short forecast to icon
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
// Helper to format date as yyyy-mm-dd
function formatDate(date) {
  return date.toISOString().split('T')[0];
}
// LocalStorage helpers
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
  // Returns an array of Date objects: today + next (numDays-1) days
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    days.push(d);
  }
  return days;
}

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthNav, setMonthNav] = useState(false);
  const [yearNav, setYearNav] = useState(false);
  const [weatherLoc, setWeatherLoc] = useState(() => {
    const saved = localStorage.getItem('weather_loc');
    return saved ? JSON.parse(saved) : null;
  });
  const [tasksByDate, setTasksByDate] = useState(() => loadTasks());
  const [weather, setWeather] = useState({}); // { yyyy-mm-dd: { icon, text } }
  const [categories, setCategories] = useState(() => loadCategories());
    // Save categories to localStorage
    React.useEffect(() => {
      saveCategories(categories);
    }, [categories]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  // Timeline days: always 7 days, starting from selectedDate
  const days = getDaysRange(selectedDate, 7);

  // Save to localStorage on change
  React.useEffect(() => {
    saveTasks(tasksByDate);
  }, [tasksByDate]);

  // Save weather location
  React.useEffect(() => {
    if (weatherLoc) localStorage.setItem('weather_loc', JSON.stringify(weatherLoc));
  }, [weatherLoc]);

  // Fetch weather on mount
  React.useEffect(() => {
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
        // Get NWS grid endpoint
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
        // Get forecast
        const forecastResp = await fetch(forecastUrl, {
          headers: {
            'User-Agent': 'timeline-todo-app (contact@myweatherapp.com)',
            'Accept': 'application/geo+json',
          },
        });
        if (!forecastResp.ok) throw new Error('Failed to get forecast');
        const forecastData = await forecastResp.json();
        // Map forecast periods to days
        const dayWeather = {};
        for (const day of days) {
          const key = formatDate(day);
          // Find forecast period for this day (use daytime period)
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

  // CRUD for tasks
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

  // Tasks for selected day
  // Tasks for selected day, sorted: timed by time, untimed after (manual order)
  const allTasks = tasksByDate[formatDate(selectedDate)] || [];
  const timed = allTasks.filter(t => t.time).sort((a, b) => a.time.localeCompare(b.time));
  const untimed = allTasks.filter(t => !t.time);
  const tasks = [...timed, ...untimed];

  // Drag-and-drop for untimed tasks (prototype, only within same day)
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

  // Move task to another day (prototype: only untimed, via dropdown)
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
      <TodayButton onClick={handleToday} />
      <main>
        <Timeline
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          weather={weather}
        />
        {weatherLoading && <div>Loading weather...</div>}
        {weatherError && <div style={{color:'red'}}>Weather error: {weatherError}</div>}
        <section style={{ marginTop: 24 }}>
          <h2>Tasks for {selectedDate.toLocaleDateString()}</h2>
          <TaskInput onAdd={addTask} />
          <div>
            return (
              <div className="app-container">
                <header>
                  <h1>Timeline Todo + Calendar</h1>
                </header>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                  <TodayButton onClick={handleToday} />
                  <button onClick={()=>setMonthNav(m=>!m)}>Month</button>
                  <button onClick={()=>setYearNav(y=>!y)}>Year</button>
                  {/* Weather location input */}
                  <form style={{display:'inline-flex',gap:4,alignItems:'center'}} onSubmit={e=>{e.preventDefault();}}>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Lat"
                      value={weatherLoc?.lat || ''}
                      onChange={e=>setWeatherLoc(w=>({...w,lat:parseFloat(e.target.value)}))}
                      style={{width:70}}
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Lon"
                      value={weatherLoc?.lon || ''}
                      onChange={e=>setWeatherLoc(w=>({...w,lon:parseFloat(e.target.value)}))}
                      style={{width:70}}
                    />
                    <button type="button" onClick={()=>setWeatherLoc(null)}>Use My Location</button>
                  </form>
                </div>
                {/* Month/year navigation overlays */}
                {monthNav && (
                  <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.2)',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setMonthNav(false)}>
                    <div style={{background:'#fff',padding:24,borderRadius:8}} onClick={e=>e.stopPropagation()}>
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
                  <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.2)',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setYearNav(false)}>
                    <div style={{background:'#fff',padding:24,borderRadius:8}} onClick={e=>e.stopPropagation()}>
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
                {/* Category management UI (prototype) */}
                <section style={{margin:'16px 0', padding:'12px', background:'#f6f6f6', borderRadius:8}}>
                  <h3>Categories</h3>
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
                  {weatherError && <div style={{color:'red'}}>Weather error: {weatherError}</div>}
                  <section style={{ marginTop: 24 }}>
                    <h2>Tasks for {selectedDate.toLocaleDateString()}</h2>
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
                      {tasks.length === 0 && <div>No tasks for this day.</div>}
                    </div>
                  </section>
                </main>
              </div>
            );
          }


// CategoryManager component (prototype, moved outside App)
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
