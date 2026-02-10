/**
 * Idle Time Summary Component
 * Shows total idle time, percentage, and cost estimate
 */

import React from 'react';
import { formatPercentage } from '../utils/formatters';
import { formatDuration } from '../utils/dateUtils';

/**
 * Idle Time Summary
 */
function IdleTimeSummary({ trips, loading, isMetric }) {
  if (loading) {
    return (
      <div className="idle-time-summary">
        <div className="idle-stats-grid">
          <div className="idle-stat-card">
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-label"></div>
          </div>
          <div className="idle-stat-card">
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-label"></div>
          </div>
          <div className="idle-stat-card">
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-label"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="idle-time-summary idle-time-summary--empty">
        <div className="empty-state">
          <p>No trip data available for idle time analysis.</p>
        </div>
      </div>
    );
  }

  // Calculate idle time (in seconds from API, convert to ms)
  const parseTimeSpan = (timeSpan) => {
    if (!timeSpan || timeSpan === '00:00:00') return 0;
    const parts = timeSpan.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const totalIdleSeconds = trips.reduce((sum, t) => {
    if (t.idlingDuration != null) {
      return sum + parseTimeSpan(t.idlingDuration);
    }
    return sum;
  }, 0);

  const totalDrivingSeconds = trips.reduce((sum, t) => {
    if (t.drivingDuration != null) {
      return sum + parseTimeSpan(t.drivingDuration);
    }
    return sum;
  }, 0);

  const totalIdleMs = totalIdleSeconds * 1000;
  const totalDrivingMs = totalDrivingSeconds * 1000;
  const totalTimeMs = totalIdleMs + totalDrivingMs;

  const idlePercentage = totalTimeMs > 0 ? (totalIdleMs / totalTimeMs) * 100 : 0;

  // Estimate fuel cost (rough approximation)
  // Assume: 0.5-1 liter per hour of idling
  // Fuel price: $1.50/liter (adjustable)
  const idleHours = totalIdleSeconds / 3600;
  const fuelUsedIdling = idleHours * 0.75; // liters (average 0.75L/hr)
  const fuelPrice = isMetric ? 1.50 : 4.00; // per liter or per gallon
  const estimatedCost = fuelUsedIdling * fuelPrice;

  // Count trips with significant idling (>5 minutes)
  const tripsWithIdling = trips.filter(t => parseTimeSpan(t.idlingDuration) > 300).length;

  return (
    <div className="idle-time-summary">
      <div className="idle-stats-grid">
        <div className="idle-stat-card">
          <div className="idle-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="idle-stat-content">
            <div className="idle-stat-value">{formatDuration(totalIdleMs)}</div>
            <div className="idle-stat-label">Total Idle Time</div>
          </div>
        </div>

        <div className="idle-stat-card">
          <div className="idle-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2v20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <div className="idle-stat-content">
            <div className="idle-stat-value">{formatPercentage(idlePercentage, false, 1)}</div>
            <div className="idle-stat-label">% of Driving Time</div>
          </div>
        </div>

        <div className="idle-stat-card">
          <div className="idle-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="idle-stat-content">
            <div className="idle-stat-value">
              {isMetric ? `$${estimatedCost.toFixed(2)}` : `$${estimatedCost.toFixed(2)}`}
            </div>
            <div className="idle-stat-label">Est. Fuel Cost</div>
            <div className="idle-stat-detail">~{fuelUsedIdling.toFixed(1)}L wasted</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="idle-progress">
        <div className="idle-progress-label">
          <span>Idle vs Driving Time</span>
          <span>{tripsWithIdling} trips with idling &gt;5min</span>
        </div>
        <div className="idle-progress-bar">
          <div 
            className="idle-progress-fill idle-progress-fill--idle"
            style={{ width: `${idlePercentage}%` }}
            title={`Idle: ${formatPercentage(idlePercentage)}`}
          ></div>
          <div 
            className="idle-progress-fill idle-progress-fill--driving"
            style={{ width: `${100 - idlePercentage}%` }}
            title={`Driving: ${formatPercentage(100 - idlePercentage)}`}
          ></div>
        </div>
      </div>

      {idlePercentage > 25 && (
        <div className="idle-warning">
          ⚠️ High idle time detected. Consider reducing idling to save fuel and reduce emissions.
        </div>
      )}
    </div>
  );
}

export default IdleTimeSummary;
