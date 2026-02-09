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
  primary: '#0078D4',
  success: '#107C10',
  warning: '#FFB900',
  danger: '#D83B01',
  neutral: '#605E5C',
  
  // Usage breakdown colors
  driving: '#0078D4',
  idle: '#FFB900',
  stopped: '#E1DFDD',
  
  // Exception severity colors
  critical: '#D83B01',
  warning: '#FFB900',
  info: '#0078D4',
  
  // Chart palette
  chartPalette: [
    '#0078D4', // Blue
    '#D83B01', // Red/Orange
    '#FFB900', // Yellow
    '#107C10', // Green
    '#5C2D91', // Purple
    '#008272', // Teal
    '#E81123', // Red
    '#00BCF2', // Light Blue
    '#FF8C00', // Dark Orange
    '#00B294'  // Sea Green
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
