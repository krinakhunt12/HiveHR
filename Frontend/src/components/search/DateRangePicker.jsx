import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const DateRangePicker = ({ 
  value = { from: '', to: '' }, 
  onChange,
  placeholder = "Select date range"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState(value);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDisplayText = () => {
    if (value.from && value.to) {
      return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    }
    if (value.from) {
      return `From ${formatDate(value.from)}`;
    }
    return placeholder;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
      // Start new selection
      setSelectedRange({ from: dateString, to: '' });
    } else if (selectedRange.from && !selectedRange.to) {
      // Complete selection
      const from = new Date(selectedRange.from);
      const to = new Date(dateString);
      
      if (to < from) {
        // If end date is before start date, swap them
        setSelectedRange({ from: dateString, to: selectedRange.from });
      } else {
        setSelectedRange(prev => ({ ...prev, to: dateString }));
      }
    }
  };

  const applySelection = () => {
    onChange(selectedRange);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedRange({ from: '', to: '' });
    onChange({ from: '', to: '' });
    setIsOpen(false);
  };

  const isDateInRange = (date) => {
    if (!selectedRange.from) return false;
    
    const currentDate = new Date(date).toISOString().split('T')[0];
    const from = selectedRange.from;
    const to = selectedRange.to || selectedRange.from;
    
    return currentDate >= from && currentDate <= to;
  };

  const isDateSelected = (date) => {
    const currentDate = new Date(date).toISOString().split('T')[0];
    return currentDate === selectedRange.from || currentDate === selectedRange.to;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    const days = [];
    const daysInMonth = lastDay.getDate();
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, -i);
      days.unshift(date);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days (to fill the grid)
    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const dateString = date.toISOString().split('T')[0];
          const isSelected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                h-8 text-sm rounded transition-colors
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isSelected ? 'bg-gray-900 text-white' : ''}
                ${inRange && !isSelected ? 'bg-gray-100' : ''}
                ${isToday && !isSelected ? 'border border-gray-900' : ''}
                hover:bg-gray-200
              `}
              disabled={!isCurrentMonth}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className={value.from ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayText()}
          </span>
        </div>
        {value.from && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-300 z-40 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar */}
          {renderCalendar()}

          {/* Quick Selection */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Today', days: 0 },
                { label: 'Last 7 days', days: -7 },
                { label: 'Last 30 days', days: -30 },
                { label: 'This month', getRange: () => {
                  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                  return { from: start, to: end };
                }}
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    let range;
                    if (option.getRange) {
                      range = option.getRange();
                    } else {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() + option.days);
                      range = { from: start, to: end };
                    }
                    setSelectedRange({
                      from: range.from.toISOString().split('T')[0],
                      to: range.to.toISOString().split('T')[0]
                    });
                  }}
                  className="text-xs px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={clearSelection}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={applySelection}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;