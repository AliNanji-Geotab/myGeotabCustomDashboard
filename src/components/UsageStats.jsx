/**
 * Usage Stats Component
 * Displays stat cards for device usage metrics
 */

import React from 'react';
import { 
  formatDistance, 
  formatFuelLevel, 
  formatFuelEconomy, 
  formatOdometer,
  formatNumber
} from '../utils/formatters';
import { formatDuration } from '../utils/dateUtils';

/**
 * Single stat card component
 */
function StatCard({ label, value, icon, loading, className = '' }) {
  if (loading) {
    return (
      <div className={`stat-card stat-card--loading ${className}`}>
        <div className="stat-icon skeleton skeleton-icon"></div>
        <div className="stat-content">
          <div className="skeleton skeleton-value"></div>
          <div className="skeleton skeleton-label"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`stat-card ${className}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/**
 * Usage statistics grid
 */
function UsageStats({ stats, loading, isMetric }) {
  // Icons for stats (simple SVG icons)
  const icons = {
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    fuel: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
        <path d="M15 10h3a2 2 0 012 2v6a2 2 0 01-2 2h-1" />
        <path d="M15 6l3 3" />
        <rect x="6" y="8" width="6" height="4" />
      </svg>
    ),
    distance: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L12 22" />
        <path d="M17 7l-5-5-5 5" />
        <path d="M7 17l5 5 5-5" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    gauge: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 6v6l4 2" />
        <path d="M12 6a6 6 0 016 6" />
      </svg>
    ),
    odometer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
        <path d="M8 12h8" />
      </svg>
    )
  };

  // Prepare stat values
  const statCards = [
    {
      key: 'daysDriven',
      label: 'Days Driven',
      value: stats?.daysDriven != null ? formatNumber(stats.daysDriven) : '--',
      icon: icons.calendar
    },
    {
      key: 'fuelLevel',
      label: 'Current Fuel Level',
      value: stats?.fuelLevel != null ? formatFuelLevel(stats.fuelLevel) : '--',
      icon: icons.fuel
    },
    {
      key: 'distanceDriven',
      label: 'Distance Driven',
      value: stats?.distanceDriven != null 
        ? formatDistance(stats.distanceDriven, isMetric) 
        : '--',
      icon: icons.distance
    },
    {
      key: 'timeDriven',
      label: 'Time Driven',
      value: stats?.timeDriven != null 
        ? formatDuration(stats.timeDriven) 
        : '--',
      icon: icons.clock
    },
    {
      key: 'fuelEconomy',
      label: 'Fuel Economy',
      value: stats?.fuelEconomy != null 
        ? formatFuelEconomy(stats.fuelEconomy, isMetric) 
        : '--',
      icon: icons.gauge
    },
    {
      key: 'odometer',
      label: 'Odometer',
      value: stats?.odometer != null 
        ? formatOdometer(stats.odometer, isMetric) 
        : '--',
      icon: icons.odometer
    }
  ];

  return (
    <div className="usage-stats">
      <div className="stats-grid">
        {statCards.map(stat => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}

export default UsageStats;
