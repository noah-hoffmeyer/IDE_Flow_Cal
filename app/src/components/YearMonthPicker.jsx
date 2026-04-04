import React, { useState } from 'react';

function YearMonthPicker({ onSelect, onClose }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  const handleSelect = () => {
    onSelect(new Date(selectedYear, selectedMonth, 1));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Date</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="date-picker-container">
            {/* Year Selection */}
            <div className="picker-section">
              <label>Year: {selectedYear}</label>
              <input
                type="range"
                min={years[0]}
                max={years[years.length - 1]}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="year-slider"
              />
              <div className="year-quick-select">
                <button
                  onClick={() => setSelectedYear(currentYear)}
                  className={`year-btn ${selectedYear === currentYear ? 'active' : ''}`}
                >
                  This Year
                </button>
                <button
                  onClick={() => setSelectedYear(currentYear - 1)}
                  className={`year-btn ${selectedYear === currentYear - 1 ? 'active' : ''}`}
                >
                  Last Year
                </button>
                <button
                  onClick={() => setSelectedYear(currentYear + 1)}
                  className={`year-btn ${selectedYear === currentYear + 1 ? 'active' : ''}`}
                >
                  Next Year
                </button>
              </div>
            </div>

            {/* Month Selection */}
            <div className="picker-section">
              <label>Month</label>
              <div className="month-grid">
                {monthNames.map((month, idx) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(idx)}
                    className={`month-btn ${selectedMonth === idx ? 'active' : ''}`}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="date-preview">
              <p className="preview-label">Selected:</p>
              <p className="preview-value">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn modal-btn-default">
            Cancel
          </button>
          <button onClick={handleSelect} className="modal-btn modal-btn-primary">
            Go to Date
          </button>
        </div>
      </div>
    </div>
  );
}

export default YearMonthPicker;
