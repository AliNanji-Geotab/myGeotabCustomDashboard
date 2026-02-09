/**
 * Exceptions Chart Component
 * Bar chart showing exception counts by rule type
 */

import React, { useMemo } from 'react';
import { COLORS } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

/**
 * Simple bar chart using CSS (no Chart.js dependency for simplicity)
 * For production, you could use Zenith's Chart component
 */
function ExceptionsChart({ data, loading }) {
  // Calculate max value for scaling
  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(d => d.count));
  }, [data]);

  // Get total exceptions
  const totalExceptions = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.count, 0);
  }, [data]);

  if (loading) {
    return (
      <div className="exceptions-chart exceptions-chart--loading">
        <div className="chart-container">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="chart-bar-row">
              <div className="skeleton skeleton-label"></div>
              <div className="skeleton skeleton-bar"></div>
              <div className="skeleton skeleton-count"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="exceptions-chart exceptions-chart--empty">
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <p>No exceptions during this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exceptions-chart">
      {/* Summary */}
      <div className="chart-summary">
        <span className="summary-count">{formatNumber(totalExceptions)}</span>
        <span className="summary-label">Total Exceptions</span>
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        {data.slice(0, 10).map((item, index) => {
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const color = COLORS.chartPalette[index % COLORS.chartPalette.length];
          
          return (
            <div key={item.name} className="chart-bar-row">
              <div className="chart-bar-label" title={item.name}>
                {truncateName(item.name, 25)}
              </div>
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                  role="progressbar"
                  aria-valuenow={item.count}
                  aria-valuemin="0"
                  aria-valuemax={maxCount}
                  aria-label={`${item.name}: ${item.count} exceptions`}
                >
                </div>
              </div>
              <div className="chart-bar-count">
                {formatNumber(item.count)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more indicator */}
      {data.length > 10 && (
        <div className="chart-more">
          <span>+{data.length - 10} more exception types</span>
        </div>
      )}
    </div>
  );
}

/**
 * Truncate long names
 */
function truncateName(name, maxLength) {
  if (!name) return 'Unknown';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
}

export default ExceptionsChart;
