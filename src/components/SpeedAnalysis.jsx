/**
 * Speed Analysis Component
 * Shows max speed, average speed, and speed distribution
 */

import React from 'react';
import { formatSpeed } from '../utils/formatters';
import { formatDuration } from '../utils/dateUtils';

/**
 * Speed Analysis Chart
 */
function SpeedAnalysis({ trips, loading, isMetric }) {
  if (loading) {
    return (
      <div className="speed-analysis">
        <div className="speed-stats-grid">
          <div className="speed-stat-card">
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-label"></div>
          </div>
          <div className="speed-stat-card">
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-label"></div>
          </div>
        </div>
        <div className="speed-distribution">
          <div className="skeleton skeleton-header"></div>
        </div>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="speed-analysis speed-analysis--empty">
        <div className="empty-state">
          <p>No trip data available for speed analysis.</p>
        </div>
      </div>
    );
  }

  // Calculate max speed
  const maxSpeed = Math.max(...trips.map(t => t.maximumSpeed || 0));
  
  // Calculate average speed
  const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
  const totalDrivingTime = trips.reduce((sum, t) => {
    if (t.drivingDuration != null) {
      return sum + (t.drivingDuration * 1000); // Convert to ms
    }
    return sum;
  }, 0);
  const avgSpeed = totalDrivingTime > 0 ? (totalDistance / (totalDrivingTime / 1000 / 3600)) : 0;

  // Calculate speed distribution from speedRange data
  // speedRange1Duration, speedRange2Duration, speedRange3Duration are in "HH:MM:SS" format
  const parseTimeSpan = (timeSpan) => {
    if (!timeSpan || timeSpan === '00:00:00') return 0;
    const parts = timeSpan.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const speedRange1Time = trips.reduce((sum, t) => sum + parseTimeSpan(t.speedRange1Duration), 0);
  const speedRange2Time = trips.reduce((sum, t) => sum + parseTimeSpan(t.speedRange2Duration), 0);
  const speedRange3Time = trips.reduce((sum, t) => sum + parseTimeSpan(t.speedRange3Duration), 0);
  
  const totalSpeedTime = speedRange1Time + speedRange2Time + speedRange3Time;

  // Define speed ranges (these are typical Geotab defaults)
  // Range 1: 0-50 km/h, Range 2: 50-90 km/h, Range 3: 90+ km/h
  const speedRanges = [
    { 
      label: isMetric ? '0-50 km/h' : '0-31 mph',
      time: speedRange1Time,
      percentage: totalSpeedTime > 0 ? (speedRange1Time / totalSpeedTime) * 100 : 0,
      color: 'success'
    },
    { 
      label: isMetric ? '50-90 km/h' : '31-56 mph',
      time: speedRange2Time,
      percentage: totalSpeedTime > 0 ? (speedRange2Time / totalSpeedTime) * 100 : 0,
      color: 'warning'
    },
    { 
      label: isMetric ? '90+ km/h' : '56+ mph',
      time: speedRange3Time,
      percentage: totalSpeedTime > 0 ? (speedRange3Time / totalSpeedTime) * 100 : 0,
      color: 'danger'
    }
  ];

  return (
    <div className="speed-analysis">
      {/* Speed Stats */}
      <div className="speed-stats-grid">
        <div className="speed-stat-card">
          <div className="speed-stat-value">
            {formatSpeed(maxSpeed, isMetric)}
          </div>
          <div className="speed-stat-label">Max Speed</div>
        </div>
        <div className="speed-stat-card">
          <div className="speed-stat-value">
            {formatSpeed(avgSpeed, isMetric)}
          </div>
          <div className="speed-stat-label">Average Speed</div>
        </div>
      </div>

      {/* Speed Distribution */}
      {totalSpeedTime > 0 && (
        <div className="speed-distribution">
          <div className="speed-distribution-header">
            <span className="speed-distribution-title">Speed Distribution</span>
            <span className="speed-distribution-subtitle">
              Total driving time: {formatDuration(totalSpeedTime * 1000)}
            </span>
          </div>
          <div className="speed-distribution-bars">
            {speedRanges.map((range, index) => (
              <div key={index} className="speed-range-row">
                <div className="speed-range-label">{range.label}</div>
                <div className="speed-range-bar-wrapper">
                  <div 
                    className={`speed-range-bar speed-range-bar--${range.color}`}
                    style={{ width: `${range.percentage}%` }}
                  ></div>
                </div>
                <div className="speed-range-stats">
                  <span className="speed-range-percentage">
                    {range.percentage.toFixed(1)}%
                  </span>
                  <span className="speed-range-time">
                    {formatDuration(range.time * 1000)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeedAnalysis;
