/**
 * Date utility functions for the Device Dashboard
 */

/**
 * Get the start of the current week (Monday)
 * @param {Date} date - Reference date
 * @returns {Date} Monday of the week at 00:00:00
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the current week (Sunday)
 * @param {Date} date - Reference date
 * @returns {Date} Sunday of the week at 23:59:59
 */
export function getWeekEnd(date = new Date()) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get the default date range (current week Mon-Sun)
 * @returns {{ start: Date, end: Date }}
 */
export function getDefaultDateRange() {
  return {
    start: getWeekStart(),
    end: getWeekEnd()
  };
}

/**
 * Get date range based on preset
 * @param {string} preset - Preset identifier
 * @returns {{ start: Date, end: Date }}
 */
export function getDateRangeFromPreset(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  switch (preset) {
    case 'thisWeek':
      return {
        start: getWeekStart(now),
        end: getWeekEnd(now)
      };
    
    case 'lastWeek': {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return {
        start: getWeekStart(lastWeek),
        end: getWeekEnd(lastWeek)
      };
    }
    
    case 'last7Days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    }
    
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { start, end: today };
    }
    
    case 'last30Days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    }
    
    default:
      return getDefaultDateRange();
  }
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string|object} format - Format string or Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, format = {}) {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Handle string format patterns
  if (typeof format === 'string') {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      case 'MMM D':
        return `${monthNames[d.getMonth()]} ${day}`;
      case 'MMM D, YYYY':
        return `${monthNames[d.getMonth()]} ${day}, ${year}`;
      default:
        // If unrecognized, fall through to default behavior
        break;
    }
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(typeof format === 'object' ? format : {})
  };
  
  return d.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Format time for display
 * @param {Date|string} date - Date to format
 * @param {boolean} includeSeconds - Include seconds in output
 * @returns {string}
 */
export function formatTime(date, includeSeconds = false) {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' })
  };
  
  return d.toLocaleTimeString(undefined, options);
}

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Calculate duration between two dates
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {number} Duration in milliseconds
 */
export function getDuration(start, end) {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  return endDate.getTime() - startDate.getTime();
}

/**
 * Format duration for display
 * @param {number} ms - Duration in milliseconds
 * @param {boolean} short - Use short format (1h 30m vs 1 hour 30 minutes)
 * @returns {string}
 */
export function formatDuration(ms, short = true) {
  if (!ms || ms < 0) return short ? '0m' : '0 minutes';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (short) {
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
  
  return parts.length > 0 ? parts.join(' ') : '0 minutes';
}

/**
 * Get unique days from a list of dates
 * @param {Array<Date|string>} dates - Array of dates
 * @returns {number} Count of unique days
 */
export function getUniqueDaysCount(dates) {
  const uniqueDays = new Set();
  
  dates.forEach(date => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    uniqueDays.add(dayKey);
  });
  
  return uniqueDays.size;
}

/**
 * Check if a date is within a range
 * @param {Date} date - Date to check
 * @param {Date} start - Range start
 * @param {Date} end - Range end
 * @returns {boolean}
 */
export function isDateInRange(date, start, end) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= start && d <= end;
}

/**
 * Convert date to ISO string for API calls
 * @param {Date} date - Date to convert
 * @returns {string}
 */
export function toISOString(date) {
  if (!date) return null;
  return date.toISOString();
}
