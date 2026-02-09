/**
 * Constants for the Device Dashboard Add-In
 */

// Diagnostic IDs for StatusData queries
export const DIAGNOSTICS = {
  FUEL_LEVEL: 'DiagnosticFuelLevelId',
  ODOMETER: 'DiagnosticOdometerAdjustmentId',
  ENGINE_HOURS: 'DiagnosticEngineHoursAdjustmentId',
  BATTERY_VOLTAGE: 'DiagnosticStateOfChargeId',
  FUEL_USED: 'DiagnosticFuelUsedId'
};

// Colors for charts and visualizations
export const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  neutral: '#64748B',
  
  // Usage breakdown colors
  driving: '#10B981',
  idle: '#F59E0B',
  stopped: '#E5E7EB',
  
  // Exception severity colors
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Chart palette - Vibrant & Colorful
  chartPalette: [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#8B5CF6', // Violet
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#EF4444', // Red
    '#3B82F6'  // Blue
  ]
};

// Conversion factors
export const CONVERSIONS = {
  KM_TO_MILES: 0.621371,
  LITERS_TO_GALLONS: 0.264172,
  LITERS_PER_100KM_TO_MPG: 235.215
};

// Default date range presets
export const DATE_PRESETS = {
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek',
  LAST_7_DAYS: 'last7Days',
  THIS_MONTH: 'thisMonth',
  LAST_30_DAYS: 'last30Days'
};

// Table page sizes
export const PAGE_SIZES = {
  SMALL: 5,
  MEDIUM: 10,
  LARGE: 25
};

// Video URL patterns for exceptions
export const VIDEO_URL_PATTERNS = {
  LYTX: 'lytx.com',
  SAMSARA: 'cloud.samsara.com',
  SURFSIGHT: 'surfsight.net'
};

// Exception rule categories for grouping
export const EXCEPTION_CATEGORIES = {
  SAFETY: ['Speeding', 'Harsh Braking', 'Harsh Acceleration', 'Harsh Cornering', 'Seatbelt'],
  COMPLIANCE: ['HOS', 'ELD', 'DVIR'],
  PRODUCTIVITY: ['Idling', 'After Hours', 'Unauthorized Use'],
  MAINTENANCE: ['Engine Light', 'Low Fuel', 'Battery']
};
