/**
 * Exceptions Timeline Component
 * Shows exception counts by day in a bar chart
 */

import React from 'react';
import { formatDate } from '../utils/dateUtils';

/**
 * Exceptions Timeline Chart
 */
function ExceptionsTimeline({ exceptions, dateRange, loading }) {
  if (loading) {
    return (
      <div className="exceptions-timeline">
        <div className="timeline-summary">
          <div className="skeleton skeleton-value"></div>
          <div className="skeleton skeleton-label"></div>
        </div>
        <div className="timeline-chart">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton-bar"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!exceptions || exceptions.length === 0) {
    return (
      <div className="exceptions-timeline exceptions-timeline--empty">
        <div className="empty-state">
          <p>No exceptions recorded during this period.</p>
        </div>
      </div>
    );
  }

  // Group exceptions by day
  const exceptionsByDay = {};
  exceptions.forEach(exc => {
    const date = new Date(exc.activeFrom);
    const dateKey = formatDate(date, 'YYYY-MM-DD');
    
    if (!exceptionsByDay[dateKey]) {
      exceptionsByDay[dateKey] = {
        date: date,
        count: 0
      };
    }
    exceptionsByDay[dateKey].count++;
  });

  // Sort by date
  const sortedDays = Object.values(exceptionsByDay).sort((a, b) => a.date - b.date);

  // Calculate max count for scaling
  const maxCount = Math.max(...sortedDays.map(d => d.count));

  // Calculate total
  const totalExceptions = exceptions.length;
  const avgPerDay = sortedDays.length > 0 ? (totalExceptions / sortedDays.length).toFixed(1) : 0;

  return (
    <div className="exceptions-timeline">
      {/* Summary */}
      <div className="timeline-summary">
        <div className="timeline-summary-item">
          <div className="timeline-summary-value">{totalExceptions}</div>
          <div className="timeline-summary-label">Total Exceptions</div>
        </div>
        <div className="timeline-summary-item">
          <div className="timeline-summary-value">{avgPerDay}</div>
          <div className="timeline-summary-label">Avg per Day</div>
        </div>
        <div className="timeline-summary-item">
          <div className="timeline-summary-value">{maxCount}</div>
          <div className="timeline-summary-label">Max in One Day</div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="timeline-chart">
        {sortedDays.map((day, index) => {
          const heightPercentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          
          return (
            <div key={index} className="timeline-bar-wrapper">
              <div className="timeline-bar-container">
                <div 
                  className="timeline-bar"
                  style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                  title={`${formatDate(day.date)}: ${day.count} exceptions`}
                >
                  <span className="timeline-bar-count">{day.count}</span>
                </div>
              </div>
              <div className="timeline-bar-label">
                {formatDate(day.date, 'MMM D')}
              </div>
            </div>
          );
        })}
      </div>

      {sortedDays.length === 0 && (
        <div className="timeline-empty">
          <p>No daily data available</p>
        </div>
      )}
    </div>
  );
}

export default ExceptionsTimeline;
