/**
 * Usage Breakdown Component
 * Shows driving, idle, and stopped time as horizontal progress bars
 */

import React from 'react';
import { formatPercentage } from '../utils/formatters';

/**
 * Single breakdown bar item
 */
function BreakdownItem({ label, percentage, colorClass, loading }) {
  if (loading) {
    return (
      <div className="breakdown-item breakdown-item--loading">
        <div className="breakdown-header">
          <div className="skeleton skeleton-label-sm"></div>
          <div className="skeleton skeleton-percent"></div>
        </div>
        <div className="breakdown-bar">
          <div className="skeleton skeleton-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="breakdown-item">
      <div className="breakdown-header">
        <span className="breakdown-label">
          <span className={`breakdown-color-dot breakdown-color-dot--${colorClass}`}></span>
          {label}
        </span>
        <span className="breakdown-percentage">
          {formatPercentage(percentage, false, 1)}
        </span>
      </div>
      <div className="breakdown-bar">
        <div 
          className={`breakdown-bar-fill breakdown-bar-fill--${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`${label}: ${formatPercentage(percentage)}`}
        ></div>
      </div>
    </div>
  );
}

/**
 * Stacked breakdown bar
 */
function StackedBar({ breakdown, loading }) {
  if (loading || !breakdown) {
    return (
      <div className="stacked-bar stacked-bar--loading">
        <div className="skeleton skeleton-stacked"></div>
      </div>
    );
  }

  const { driving = 0, idle = 0, stopped = 0 } = breakdown;

  return (
    <div className="stacked-bar" role="img" aria-label="Usage breakdown visualization">
      {driving > 0 && (
        <div 
          className="stacked-segment stacked-segment--driving"
          style={{ width: `${driving}%` }}
          title={`Driving: ${formatPercentage(driving, false, 1)}`}
        ></div>
      )}
      {idle > 0 && (
        <div 
          className="stacked-segment stacked-segment--idle"
          style={{ width: `${idle}%` }}
          title={`Idle: ${formatPercentage(idle, false, 1)}`}
        ></div>
      )}
      {stopped > 0 && (
        <div 
          className="stacked-segment stacked-segment--stopped"
          style={{ width: `${stopped}%` }}
          title={`Stopped: ${formatPercentage(stopped, false, 1)}`}
        ></div>
      )}
    </div>
  );
}

/**
 * Usage breakdown display
 */
function UsageBreakdown({ breakdown, loading }) {
  const items = [
    { 
      key: 'driving', 
      label: 'Driving', 
      percentage: breakdown?.driving || 0, 
      colorClass: 'driving'
    },
    { 
      key: 'idle', 
      label: 'Idle', 
      percentage: breakdown?.idle || 0, 
      colorClass: 'idle'
    },
    { 
      key: 'stopped', 
      label: 'Stopped', 
      percentage: breakdown?.stopped || 0, 
      colorClass: 'stopped'
    }
  ];

  return (
    <div className="usage-breakdown">
      {/* Stacked visualization bar */}
      <StackedBar breakdown={breakdown} loading={loading} />
      
      {/* Legend with individual bars */}
      <div className="breakdown-legend">
        {items.map(item => (
          <BreakdownItem
            key={item.key}
            label={item.label}
            percentage={item.percentage}
            colorClass={item.colorClass}
            loading={loading}
          />
        ))}
      </div>

      {/* No data message */}
      {!loading && (!breakdown || (breakdown.driving === 0 && breakdown.idle === 0)) && (
        <div className="breakdown-empty">
          <p>No driving activity recorded for this period.</p>
        </div>
      )}
    </div>
  );
}

export default UsageBreakdown;
