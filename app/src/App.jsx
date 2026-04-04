import React, { useState, useEffect } from 'react';
import MiniCalendar from './components/MiniCalendar';
import TaskInput from './components/TaskInput';
import CategoriesModal from './components/CategoriesModal';
import TaskEditModal from './components/TaskEditModal';
import YearMonthPicker from './components/YearMonthPicker';

// Helper functions
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

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err)
      );
    }
  });
}

function forecastToIcon(text) {
  if (!text) return '☁️';
  const t = text.toLowerCase();
  if (t.includes('sunny') || t.includes('clear')) return '☀️';
  if (t.includes('cloud')) return '☁️';
  if (t.includes('rain') || t.includes('showers')) return '🌧️';
  if (t.includes('snow')) return '❄️';
  if (t.includes('fog')) return '🌫️';
  return '☁️';
}

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState(() => loadTasks());
  const [categories, setCategories] = useState(() => loadCategories());
  const [weather, setWeather] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherLoc, setWeatherLoc] = useState(() => {
    const saved = localStorage.getItem('weather_loc');
    return saved ? JSON.parse(saved) : null;
  });
  const [monthNav, setMonthNav] = useState(false);
  const [yearNav, setYearNav] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  // Save to localStorage when state changes
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveTasks(tasksByDate);
  }, [tasksByDate]);

  useEffect(() => {
    if (weatherLoc) {
      localStorage.setItem('weather_loc', JSON.stringify(weatherLoc));
    }
  }, [weatherLoc]);

  // Fetch weather data
  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        let coords;
        if (weatherLoc && weatherLoc.lat && weatherLoc.lon) {
          coords = weatherLoc;
        } else {
          try {
            coords = await getUserLocation();
          } catch {
            coords = { lat: 40.7128, lon: -74.006 }; // NYC fallback
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

        if (!pointsResp.ok) throw new Error('Failed to get forecast');

        const pointsData = await pointsResp.json();
        const forecastUrl = pointsData.properties.forecast;

        const forecastResp = await fetch(forecastUrl, {
          headers: {
            'User-Agent': 'timeline-todo-app (contact@myweatherapp.com)',
            'Accept': 'application/geo+json',
          },
        });

        if (!forecastResp.ok) throw new Error('Failed to get weather');

        const forecastData = await forecastResp.json();
        const dateKey = formatDate(selectedDate);
        const period = forecastData.properties.periods.find(
          (p) => p.isDaytime && p.startTime.startsWith(dateKey)
        );

        if (!cancelled) {
          setWeather(
            period
              ? {
                  icon: forecastToIcon(period.shortForecast),
                  text: period.shortForecast,
                }
              : {}
          );
        }
      } catch (err) {
        if (!cancelled) {
          setWeather({ error: true });
        }
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, weatherLoc]);

  // Task management functions
  const addTask = ({ text, time, categoryId }) => {
    const dateKey = formatDate(selectedDate);
    const newTask = {
      id: Date.now().toString(),
      text,
      time: time || '',
      completed: false,
      categoryId: categoryId || null,
    };
    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask],
    }));
  };

  const editTask = (task) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((t) => (t.id === task.id ? task : t)),
    }));
  };

  const deleteTask = (taskId) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((t) => t.id !== taskId),
    }));
  };

  const toggleComplete = (taskId) => {
    const dateKey = formatDate(selectedDate);
    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Get tasks for selected date
  const allTasks = tasksByDate[formatDate(selectedDate)] || [];
  const timed = allTasks.filter((t) => t.time).sort((a, b) => a.time.localeCompare(b.time));
  const untimed = allTasks.filter((t) => !t.time);
  const tasks = [...timed, ...untimed];

  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.color : '#cbd5e0';
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : '';
  };

  const dateStr = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weekdayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="app-container">
      <header>
        <h1>📅 Calendar Tasks</h1>
      </header>

      <div className="header-controls">
        <button className="nav-btn" onClick={handleToday}>
          Today
        </button>
        <button className="nav-btn" onClick={() => setMonthNav(true)}>
          Month
        </button>
        <button className="nav-btn" onClick={() => setShowYearMonthPicker(true)}>
          Date
        </button>
        <button className="nav-btn" onClick={() => setShowCategoriesModal(true)}>
          Categories
        </button>

        {showYearMonthPicker && (
          <YearMonthPicker
            onSelect={setSelectedDate}
            onClose={() => setShowYearMonthPicker(false)}
          />
        )}

        {monthNav && (
          <div className="modal-overlay" onClick={() => setMonthNav(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Jump to Month</h3>
              <input
                type="month"
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-');
                  setSelectedDate(new Date(Number(y), Number(m) - 1, 1));
                  setMonthNav(false);
                }}
              />
              <button onClick={() => setMonthNav(false)}>Close</button>
            </div>
          </div>
        )}

        {showCategoriesModal && (
          <CategoriesModal
            categories={categories}
            setCategories={setCategories}
            onClose={() => setShowCategoriesModal(false)}
          />
        )}

        <form
          className="weather-loc-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            type="number"
            step="0.0001"
            placeholder="Latitude"
            value={weatherLoc?.lat || ''}
            onChange={(e) =>
              setWeatherLoc((w) => ({
                ...(w || {}),
                lat: parseFloat(e.target.value),
              }))
            }
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            value={weatherLoc?.lon || ''}
            onChange={(e) =>
              setWeatherLoc((w) => ({
                ...(w || {}),
                lon: parseFloat(e.target.value),
              }))
            }
          />
          <button type="button" onClick={() => setWeatherLoc(null)}>
            Use My Location
          </button>
        </form>
      </div>

      <main>
        {/* Left Sidebar - Calendar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <span className="sidebar-title">Calendar</span>
            <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </div>

        {/* Center - Main Content */}
        <div className="main-content">
          <div className="date-header">
            <div className="date-display">{dateStr}</div>
            <div className="date-weekday">{weekdayStr}</div>
          </div>

          <TaskInput onAdd={addTask} categories={categories} />

          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">No tasks for this day. Add one to get started!</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                  />
                  {task.time && <div className="task-time">{task.time}</div>}
                  <div className="task-text">{task.text}</div>
                  {task.categoryId && (
                    <div
                      className="cat-dot"
                      style={{ backgroundColor: getCategoryColor(task.categoryId) }}
                      title={getCategoryName(task.categoryId)}
                    />
                  )}
                  <div className="task-actions">
                    <button onClick={() => setEditingTask(task)} className="task-action-btn edit">
                      Edit
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="task-action-btn delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {editingTask && (
            <TaskEditModal
              task={editingTask}
              categories={categories}
              onSave={(updatedTask) => {
                editTask(updatedTask);
                setEditingTask(null);
              }}
              onClose={() => setEditingTask(null)}
            />
          )}
        </div>

        {/* Right Sidebar - Weather & Info */}
        <div className="right-sidebar">
          <div className="weather-widget">
            <div className="weather-title">Today's Weather</div>
            {weatherLoading ? (
              <div className="weather-loading">Loading...</div>
            ) : weather.error ? (
              <div className="weather-text">Unable to load weather</div>
            ) : weather.icon ? (
              <>
                <div className="weather-icon">{weather.icon}</div>
                <div className="weather-text">{weather.text}</div>
              </>
            ) : (
              <div className="weather-text">No weather data</div>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <div className="weather-title" style={{ marginBottom: '0.8rem' }}>
              Quick Info
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.6' }}>
              <div>📍 Use the location fields above to update weather location</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
