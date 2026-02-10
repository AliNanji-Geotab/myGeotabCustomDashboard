/**
 * Fuel Level Trend Component
 * Shows fuel level changes over time (loaded asynchronously)
 */

import React, { useState, useEffect } from 'react';
import { useGeotabApi } from '../hooks/useGeotabApi';
import { DIAGNOSTICS } from '../utils/constants';
import { toISOString, formatDate } from '../utils/dateUtils';

/**
 * Fuel Level Trend Chart
 */
function FuelLevelTrend({ api, deviceId, dateRange, isMetric }) {
  const [loading, setLoading] = useState(true);
  const [fuelData, setFuelData] = useState([]);
  const [error, setError] = useState(null);
  
  const { call } = useGeotabApi(api);

  useEffect(() => {
    async function fetchFuelData() {
      if (!api || !deviceId || !dateRange?.start || !dateRange?.end) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fromDate = toISOString(dateRange.start);
        const toDate = toISOString(dateRange.end);

        // Fetch fuel level data points over the date range
        const result = await call('Get', {
          typeName: 'StatusData',
          search: {
            diagnosticSearch: { id: DIAGNOSTICS.FUEL_LEVEL },
            deviceSearch: { id: deviceId },
            fromDate,
            toDate
          },
          resultsLimit: 1000 // Limit to 1000 points for performance
        });

        if (result && result.length > 0) {
          // Sort by date
          const sorted = result.sort((a, b) => 
            new Date(a.dateTime) - new Date(b.dateTime)
          );

          // Convert fuel level to percentage if needed
          const processed = sorted.map(point => ({
            date: new Date(point.dateTime),
            level: point.data > 1 ? point.data : point.data * 100
          }));

          setFuelData(processed);
        } else {
          setFuelData([]);
        }
      } catch (err) {
        console.error('Error fetching fuel level data:', err);
        setError('Failed to load fuel trend data');
      } finally {
        setLoading(false);
      }
    }

    // Delay loading by 1 second to not block main page
    const timer = setTimeout(fetchFuelData, 1000);
    return () => clearTimeout(timer);
  }, [api, deviceId, dateRange, call]);

  if (loading) {
    return (
      <div className="fuel-level-trend">
        <div className="fuel-trend-header">
          <div className="skeleton skeleton-label"></div>
        </div>
        <div className="fuel-trend-chart">
          <div className="skeleton skeleton-chart"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fuel-level-trend fuel-level-trend--error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!fuelData || fuelData.length === 0) {
    return (
      <div className="fuel-level-trend fuel-level-trend--empty">
        <div className="empty-state">
          <p>No fuel level data available for this period.</p>
        </div>
      </div>
    );
  }

  // Calculate min/max for Y-axis
  const minLevel = Math.min(...fuelData.map(d => d.level));
  const maxLevel = Math.max(...fuelData.map(d => d.level));
  const range = maxLevel - minLevel;

  // Detect fill-ups (sudden increase > 10%)
  const fillUps = [];
  for (let i = 1; i < fuelData.length; i++) {
    const diff = fuelData[i].level - fuelData[i - 1].level;
    if (diff > 10) {
      fillUps.push({ index: i, amount: diff });
    }
  }

  // Sample data points for display (max 50 points for cleaner chart)
  const sampledData = fuelData.length > 50 
    ? fuelData.filter((_, i) => i % Math.ceil(fuelData.length / 50) === 0)
    : fuelData;

  return (
    <div className="fuel-level-trend">
      <div className="fuel-trend-header">
        <div className="fuel-trend-title">Fuel Level Over Time</div>
        <div className="fuel-trend-stats">
          <span className="fuel-trend-stat">
            <span className="fuel-trend-stat-label">Range:</span>
            <span className="fuel-trend-stat-value">{minLevel.toFixed(0)}% - {maxLevel.toFixed(0)}%</span>
          </span>
          {fillUps.length > 0 && (
            <span className="fuel-trend-stat">
              <span className="fuel-trend-stat-label">Fill-ups detected:</span>
              <span className="fuel-trend-stat-value">{fillUps.length}</span>
            </span>
          )}
        </div>
      </div>

      <div className="fuel-trend-chart">
        <svg viewBox="0 0 800 200" preserveAspectRatio="none">
          {/* Y-axis grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={200 - (y * 2)}
              x2="800"
              y2={200 - (y * 2)}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Line chart */}
          <polyline
            points={sampledData.map((point, i) => {
              const x = (i / (sampledData.length - 1)) * 800;
              const y = 200 - ((point.level / 100) * 200);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fill area under line */}
          <polygon
            points={[
              '0,200',
              ...sampledData.map((point, i) => {
                const x = (i / (sampledData.length - 1)) * 800;
                const y = 200 - ((point.level / 100) * 200);
                return `${x},${y}`;
              }),
              '800,200'
            ].join(' ')}
            fill="var(--color-primary)"
            fillOpacity="0.1"
          />

          {/* Dots on data points */}
          {sampledData.map((point, i) => {
            const x = (i / (sampledData.length - 1)) * 800;
            const y = 200 - ((point.level / 100) * 200);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="var(--color-primary)"
              />
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="fuel-trend-y-axis">
          {[100, 75, 50, 25, 0].map(y => (
            <div key={y} className="fuel-trend-y-label">{y}%</div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="fuel-trend-x-axis">
          <span>{formatDate(fuelData[0].date, 'MMM D')}</span>
          <span>{formatDate(fuelData[fuelData.length - 1].date, 'MMM D')}</span>
        </div>
      </div>
    </div>
  );
}

export default FuelLevelTrend;
