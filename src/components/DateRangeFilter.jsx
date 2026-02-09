/**
 * Date Range Filter Component
 * Allows selecting date range with presets
 */

import React, { useCallback, useMemo } from 'react';
import { formatDate, getDateRangeFromPreset } from '../utils/dateUtils';
import { DATE_PRESETS } from '../utils/constants';

/**
 * Date range picker with preset buttons
 */
function DateRangeFilter({ dateRange, onChange, onPresetSelect }) {
  // Format dates for input fields
  const startDateStr = useMemo(() => {
    if (!dateRange?.start) return '';
    return dateRange.start.toISOString().split('T')[0];
  }, [dateRange?.start]);

  const endDateStr = useMemo(() => {
    if (!dateRange?.end) return '';
    return dateRange.end.toISOString().split('T')[0];
  }, [dateRange?.end]);

  // Handle start date change
  const handleStartChange = useCallback((e) => {
    const newStart = new Date(e.target.value);
    newStart.setHours(0, 0, 0, 0);
    
    if (dateRange?.end && newStart > dateRange.end) {
      // If start is after end, adjust end
      onChange({ start: newStart, end: newStart });
    } else {
      onChange({ ...dateRange, start: newStart });
    }
  }, [dateRange, onChange]);

  // Handle end date change
  const handleEndChange = useCallback((e) => {
    const newEnd = new Date(e.target.value);
    newEnd.setHours(23, 59, 59, 999);
    
    if (dateRange?.start && newEnd < dateRange.start) {
      // If end is before start, adjust start
      onChange({ start: newEnd, end: newEnd });
    } else {
      onChange({ ...dateRange, end: newEnd });
    }
  }, [dateRange, onChange]);

  // Handle preset button click
  const handlePresetClick = useCallback((preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  }, [onPresetSelect]);

  // Preset definitions
  const presets = [
    { key: DATE_PRESETS.THIS_WEEK, label: 'This Week' },
    { key: DATE_PRESETS.LAST_WEEK, label: 'Last Week' },
    { key: DATE_PRESETS.LAST_7_DAYS, label: 'Last 7 Days' },
    { key: DATE_PRESETS.THIS_MONTH, label: 'This Month' },
    { key: DATE_PRESETS.LAST_30_DAYS, label: 'Last 30 Days' }
  ];

  return (
    <div className="date-range-filter">
      {/* Date Inputs */}
      <div className="date-range-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date" className="date-label">From</label>
          <input
            type="date"
            id="start-date"
            className="date-input"
            value={startDateStr}
            onChange={handleStartChange}
            max={endDateStr}
            aria-label="Start date"
          />
        </div>
        
        <span className="date-separator">to</span>
        
        <div className="date-input-group">
          <label htmlFor="end-date" className="date-label">To</label>
          <input
            type="date"
            id="end-date"
            className="date-input"
            value={endDateStr}
            onChange={handleEndChange}
            min={startDateStr}
            max={new Date().toISOString().split('T')[0]}
            aria-label="End date"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="date-presets">
        {presets.map(preset => (
          <button
            key={preset.key}
            type="button"
            className="date-preset-btn"
            onClick={() => handlePresetClick(preset.key)}
            aria-label={`Set date range to ${preset.label}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Current Range Display */}
      <div className="date-range-display">
        <span className="date-range-text">
          {formatDate(dateRange?.start)} - {formatDate(dateRange?.end)}
        </span>
      </div>
    </div>
  );
}

export default DateRangeFilter;
