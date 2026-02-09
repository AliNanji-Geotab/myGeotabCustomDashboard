/**
 * Fuel-Ups Table Component
 * Shows list of fuel fill-up events with driver info and metrics
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatDateTime, formatDate, formatTime } from '../utils/dateUtils';
import { 
  formatFuelVolume, 
  formatFuelEconomy, 
  formatOdometer, 
  formatDriverName,
  formatAddress,
  truncateText 
} from '../utils/formatters';
import { PAGE_SIZES } from '../utils/constants';

/**
 * Fuel-ups table with pagination
 */
function FuelUpsTable({ fuelUps, loading, isMetric }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = PAGE_SIZES.MEDIUM;

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil((fuelUps?.length || 0) / pageSize);
  }, [fuelUps?.length, pageSize]);

  const paginatedFuelUps = useMemo(() => {
    if (!fuelUps) return [];
    const start = (currentPage - 1) * pageSize;
    return fuelUps.slice(start, start + pageSize);
  }, [fuelUps, currentPage, pageSize]);

  // Reset to first page when fuel-ups change
  useEffect(() => {
    setCurrentPage(1);
  }, [fuelUps]);

  // Calculate total fuel added
  const totalFuelAdded = useMemo(() => {
    if (!fuelUps) return 0;
    return fuelUps.reduce((sum, fu) => sum + (fu.fuelAdded || fu.volume || 0), 0);
  }, [fuelUps]);

  if (loading) {
    return (
      <div className="fuelups-table fuelups-table--loading">
        <div className="table-skeleton">
          <div className="skeleton skeleton-header"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton-row"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!fuelUps || fuelUps.length === 0) {
    return (
      <div className="fuelups-table fuelups-table--empty">
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
            <path d="M15 10h3a2 2 0 012 2v6a2 2 0 01-2 2h-1" />
            <path d="M15 6l3 3" />
            <rect x="6" y="8" width="6" height="4" />
          </svg>
          <p>No fuel-ups recorded during this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fuelups-table">
      {/* Summary */}
      <div className="table-summary">
        <div className="summary-item">
          <span className="summary-value">{fuelUps.length}</span>
          <span className="summary-label">Fuel-Ups</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">
            {formatFuelVolume(totalFuelAdded, isMetric)}
          </span>
          <span className="summary-label">Total Fuel Added</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-driver">Driver</th>
              <th className="col-datetime">Date & Time</th>
              <th className="col-location">Location</th>
              <th className="col-economy">Fuel Economy</th>
              <th className="col-fuel">Fuel Added</th>
              <th className="col-odometer">Odometer</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFuelUps.map((fuelUp, index) => {
              const driver = formatDriverName(fuelUp.driverInfo);
              const fuelAdded = fuelUp.fuelAdded || fuelUp.volume || 0;
              const fuelEconomy = fuelUp.fuelEconomy || fuelUp.economy;
              const location = fuelUp.location || fuelUp.address;
              
              return (
                <tr key={fuelUp.id || index} className="table-row">
                  <td className="col-driver" data-label="Driver">
                    <div className="driver-name">
                      <span className="driver-first">{driver.firstName}</span>
                      <span className="driver-last">{driver.lastName}</span>
                    </div>
                  </td>
                  <td className="col-datetime" data-label="Date & Time">
                    <div className="datetime">
                      <span className="date">{formatDate(fuelUp.dateTime || fuelUp.date)}</span>
                      <span className="time">{formatTime(fuelUp.dateTime || fuelUp.date)}</span>
                    </div>
                  </td>
                  <td className="col-location" data-label="Location">
                    <span className="location-text" title={formatAddress(location)}>
                      {truncateText(formatAddress(location), 35)}
                    </span>
                  </td>
                  <td className="col-economy" data-label="Fuel Economy">
                    {fuelEconomy != null 
                      ? formatFuelEconomy(fuelEconomy, isMetric) 
                      : '--'}
                  </td>
                  <td className="col-fuel" data-label="Fuel Added">
                    {fuelAdded > 0 
                      ? formatFuelVolume(fuelAdded, isMetric) 
                      : '--'}
                  </td>
                  <td className="col-odometer" data-label="Odometer">
                    {fuelUp.odometer != null 
                      ? formatOdometer(fuelUp.odometer, isMetric) 
                      : '--'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Total count */}
      <div className="table-footer">
        <span className="table-count">
          Showing {paginatedFuelUps.length} of {fuelUps.length} fuel-ups
        </span>
      </div>
    </div>
  );
}

export default FuelUpsTable;
