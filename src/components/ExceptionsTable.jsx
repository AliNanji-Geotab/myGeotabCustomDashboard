/**
 * Exceptions Table Component
 * Shows detailed list of exceptions with driver info, location, and video links
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDate, formatTime, formatDuration, getDuration } from '../utils/dateUtils';
import { formatDistance, formatDriverName, formatAddress, truncateText } from '../utils/formatters';
import { PAGE_SIZES, VIDEO_URL_PATTERNS } from '../utils/constants';
import { useGeotabApi } from '../hooks/useGeotabApi';

/**
 * Exceptions table with pagination and expandable details
 */
function ExceptionsTable({ exceptions, loading, isMetric, api }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [addresses, setAddresses] = useState({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  const { getAddresses, navigateToExceptions } = useGeotabApi(api);
  const pageSize = PAGE_SIZES.MEDIUM;

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil((exceptions?.length || 0) / pageSize);
  }, [exceptions?.length, pageSize]);

  const paginatedExceptions = useMemo(() => {
    if (!exceptions) return [];
    const start = (currentPage - 1) * pageSize;
    return exceptions.slice(start, start + pageSize);
  }, [exceptions, currentPage, pageSize]);

  // Load addresses for current page exceptions
  useEffect(() => {
    async function loadAddresses() {
      if (!paginatedExceptions || paginatedExceptions.length === 0) return;

      // Find exceptions without addresses that have coordinates
      const needsAddresses = paginatedExceptions.filter(
        exc => !addresses[exc.id] && exc.latitude && exc.longitude
      );

      if (needsAddresses.length === 0) return;

      setLoadingAddresses(true);
      
      try {
        const coordinates = needsAddresses.map(exc => ({
          x: exc.longitude,
          y: exc.latitude
        }));

        const results = await getAddresses(coordinates);
        
        const newAddresses = {};
        needsAddresses.forEach((exc, index) => {
          if (results?.[index]) {
            newAddresses[exc.id] = results[index];
          }
        });

        setAddresses(prev => ({ ...prev, ...newAddresses }));
      } catch (err) {
        console.error('Error loading addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadAddresses();
  }, [paginatedExceptions, getAddresses, addresses]);

  // Reset to first page when exceptions change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [exceptions]);

  // Toggle row expansion
  const toggleRow = useCallback((id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Navigate to exception in MyGeotab
  const handleViewException = useCallback((exceptionId) => {
    navigateToExceptions(null, exceptionId);
  }, [navigateToExceptions]);

  // Check if exception has video
  const getVideoUrl = useCallback((exception) => {
    // Check for video URL in various fields
    const possibleFields = [
      exception.mediaUrl,
      exception.videoUrl,
      exception.externalReference
    ];

    for (const url of possibleFields) {
      if (url && typeof url === 'string') {
        // Check if it matches known video providers
        for (const pattern of Object.values(VIDEO_URL_PATTERNS)) {
          if (url.includes(pattern)) {
            return url;
          }
        }
        // Check for generic video URLs
        if (url.includes('video') || url.includes('.mp4') || url.includes('media')) {
          return url;
        }
      }
    }
    return null;
  }, []);

  if (loading) {
    return (
      <div className="exceptions-table exceptions-table--loading">
        <div className="table-skeleton">
          <div className="skeleton skeleton-header"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton-row"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!exceptions || exceptions.length === 0) {
    return (
      <div className="exceptions-table exceptions-table--empty">
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <p>No exceptions recorded during this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exceptions-table">
      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-expand"></th>
              <th className="col-driver">Driver</th>
              <th className="col-rule">Rule</th>
              <th className="col-location">Location</th>
              <th className="col-date">Date</th>
              <th className="col-time">Time</th>
              <th className="col-duration">Duration</th>
              <th className="col-distance">Distance</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExceptions.map(exception => {
              const driver = formatDriverName(exception.driverInfo);
              const duration = getDuration(exception.activeFrom, exception.activeTo);
              const address = addresses[exception.id];
              const videoUrl = getVideoUrl(exception);
              const isExpanded = expandedRows.has(exception.id);

              return (
                <React.Fragment key={exception.id}>
                  <tr 
                    className={`table-row ${isExpanded ? 'table-row--expanded' : ''}`}
                    onClick={() => toggleRow(exception.id)}
                  >
                    <td className="col-expand">
                      <button 
                        className="expand-btn"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </td>
                    <td className="col-driver" data-label="Driver">
                      <div className="driver-name">
                        <span className="driver-first">{driver.firstName}</span>
                        <span className="driver-last">{driver.lastName}</span>
                      </div>
                    </td>
                    <td className="col-rule" data-label="Rule">
                      <span className="rule-name" title={exception.ruleName}>
                        {truncateText(exception.ruleName, 30)}
                      </span>
                    </td>
                    <td className="col-location" data-label="Location">
                      {loadingAddresses && !address ? (
                        <span className="loading-text">Loading...</span>
                      ) : (
                        <span className="location-text" title={formatAddress(address)}>
                          {truncateText(formatAddress(address), 35)}
                        </span>
                      )}
                    </td>
                    <td className="col-date" data-label="Date">
                      {formatDate(exception.activeFrom)}
                    </td>
                    <td className="col-time" data-label="Time">
                      {formatTime(exception.activeFrom)}
                    </td>
                    <td className="col-duration" data-label="Duration">
                      {formatDuration(duration)}
                    </td>
                    <td className="col-distance" data-label="Distance">
                      {exception.distance != null 
                        ? formatDistance(exception.distance, isMetric) 
                        : '--'}
                    </td>
                    <td className="col-actions" data-label="Actions">
                      <div className="action-buttons">
                        <button
                          className="action-btn action-btn--view"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewException(exception.id);
                          }}
                          title="View in MyGeotab"
                          aria-label="View exception details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {videoUrl && (
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn action-btn--video"
                            onClick={(e) => e.stopPropagation()}
                            title="View Video"
                            aria-label="View exception video"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="table-row table-row--details">
                      <td colSpan="9">
                        <div className="exception-details">
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">Exception ID</span>
                              <span className="detail-value">{exception.id}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Rule</span>
                              <span className="detail-value">{exception.ruleName}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Start</span>
                              <span className="detail-value">
                                {formatDate(exception.activeFrom)} {formatTime(exception.activeFrom, true)}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">End</span>
                              <span className="detail-value">
                                {exception.activeTo 
                                  ? `${formatDate(exception.activeTo)} ${formatTime(exception.activeTo, true)}`
                                  : 'Ongoing'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Coordinates</span>
                              <span className="detail-value">
                                {exception.latitude && exception.longitude
                                  ? `${exception.latitude.toFixed(5)}, ${exception.longitude.toFixed(5)}`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Full Address</span>
                              <span className="detail-value">{formatAddress(address)}</span>
                            </div>
                            {exception.severity && (
                              <div className="detail-item">
                                <span className="detail-label">Severity</span>
                                <span className="detail-value">{exception.severity}</span>
                              </div>
                            )}
                            {exception.state && (
                              <div className="detail-item">
                                <span className="detail-label">State</span>
                                <span className="detail-value">{exception.state}</span>
                              </div>
                            )}
                          </div>
                          <div className="detail-actions">
                            <button
                              className="detail-btn"
                              onClick={() => handleViewException(exception.id)}
                            >
                              Open in MyGeotab
                            </button>
                            {videoUrl && (
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-btn detail-btn--video"
                              >
                                View Video
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
          Showing {paginatedExceptions.length} of {exceptions.length} exceptions
        </span>
      </div>
    </div>
  );
}

export default ExceptionsTable;
