/**
 * Formatting utilities for the Device Dashboard
 */

import { CONVERSIONS } from './constants';

/**
 * Format distance based on user's unit preference
 * @param {number} km - Distance in kilometers
 * @param {boolean} isMetric - True for metric, false for imperial
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatDistance(km, isMetric = true, decimals = 1) {
  if (km === null || km === undefined) return 'N/A';
  
  const value = isMetric ? km : km * CONVERSIONS.KM_TO_MILES;
  const unit = isMetric ? 'km' : 'mi';
  
  return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Format fuel volume based on user's unit preference
 * @param {number} liters - Volume in liters
 * @param {boolean} isMetric - True for metric, false for imperial
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatFuelVolume(liters, isMetric = true, decimals = 1) {
  if (liters === null || liters === undefined) return 'N/A';
  
  const value = isMetric ? liters : liters * CONVERSIONS.LITERS_TO_GALLONS;
  const unit = isMetric ? 'L' : 'gal';
  
  return `${formatNumber(value, decimals)} ${unit}`;
}

/**
 * Format fuel economy based on user's unit preference
 * @param {number} litersPerHundredKm - Fuel economy in L/100km
 * @param {boolean} isMetric - True for metric (L/100km), false for imperial (MPG)
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatFuelEconomy(litersPerHundredKm, isMetric = true, decimals = 1) {
  if (litersPerHundredKm === null || litersPerHundredKm === undefined || litersPerHundredKm <= 0) {
    return 'N/A';
  }
  
  if (isMetric) {
    return `${formatNumber(litersPerHundredKm, decimals)} L/100km`;
  }
  
  // Convert to MPG
  const mpg = CONVERSIONS.LITERS_PER_100KM_TO_MPG / litersPerHundredKm;
  return `${formatNumber(mpg, decimals)} MPG`;
}

/**
 * Format a number with thousand separators and decimals
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format percentage
 * @param {number} value - Value (0-100 or 0-1)
 * @param {boolean} isDecimal - True if value is 0-1, false if 0-100
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatPercentage(value, isDecimal = false, decimals = 0) {
  if (value === null || value === undefined) return 'N/A';
  
  const percent = isDecimal ? value * 100 : value;
  return `${formatNumber(percent, decimals)}%`;
}

/**
 * Format odometer reading
 * @param {number} km - Odometer in kilometers
 * @param {boolean} isMetric - True for metric, false for imperial
 * @returns {string}
 */
export function formatOdometer(km, isMetric = true) {
  if (km === null || km === undefined) return 'N/A';
  
  const value = isMetric ? km : km * CONVERSIONS.KM_TO_MILES;
  const unit = isMetric ? 'km' : 'mi';
  
  return `${formatNumber(value, 0)} ${unit}`;
}

/**
 * Format fuel level as percentage
 * @param {number} level - Fuel level (0-100 or 0-1)
 * @param {boolean} isDecimal - True if value is 0-1
 * @returns {string}
 */
export function formatFuelLevel(level, isDecimal = false) {
  if (level === null || level === undefined) return 'N/A';
  
  const percent = isDecimal ? level * 100 : level;
  return `${Math.round(percent)}%`;
}

/**
 * Format speed based on user's unit preference
 * @param {number} kmh - Speed in km/h
 * @param {boolean} isMetric - True for metric, false for imperial
 * @returns {string}
 */
export function formatSpeed(kmh, isMetric = true) {
  if (kmh === null || kmh === undefined) return 'N/A';
  
  const value = isMetric ? kmh : kmh * CONVERSIONS.KM_TO_MILES;
  const unit = isMetric ? 'km/h' : 'mph';
  
  return `${formatNumber(value, 0)} ${unit}`;
}

/**
 * Format vehicle info string (year make model)
 * @param {object} device - Device object with vehicle properties
 * @returns {string}
 */
export function formatVehicleInfo(device) {
  if (!device) return '';
  
  const parts = [];
  
  if (device.vehicleYear) {
    parts.push(device.vehicleYear);
  }
  
  if (device.make) {
    parts.push(device.make);
  } else if (device.engineVehicleMake) {
    parts.push(device.engineVehicleMake);
  }
  
  if (device.model) {
    parts.push(device.model);
  } else if (device.engineVehicleModel) {
    parts.push(device.engineVehicleModel);
  }
  
  return parts.join(' ') || 'Vehicle details unavailable';
}

/**
 * Format driver name
 * @param {object} driver - Driver/user object
 * @returns {{ firstName: string, lastName: string, fullName: string }}
 */
export function formatDriverName(driver) {
  if (!driver) {
    return { firstName: 'Unknown', lastName: '', fullName: 'Unknown Driver' };
  }
  
  const firstName = driver.firstName || '';
  const lastName = driver.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || driver.name || 'Unknown Driver';
  
  return { firstName: firstName || 'Unknown', lastName, fullName };
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format address from coordinates or address object
 * @param {object} address - Address object from GetAddresses
 * @returns {string}
 */
export function formatAddress(address) {
  if (!address) return 'Location unavailable';
  
  if (typeof address === 'string') return address;
  
  const parts = [];
  
  if (address.streetAddress || address.formattedAddress) {
    return address.formattedAddress || address.streetAddress;
  }
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.region || address.state) parts.push(address.region || address.state);
  
  return parts.join(', ') || 'Location unavailable';
}

/**
 * Get raw distance value for calculations
 * @param {number} km - Distance in kilometers
 * @param {boolean} isMetric - True for metric, false for imperial
 * @returns {number}
 */
export function getDistanceValue(km, isMetric = true) {
  if (km === null || km === undefined) return 0;
  return isMetric ? km : km * CONVERSIONS.KM_TO_MILES;
}

/**
 * Get distance unit label
 * @param {boolean} isMetric - True for metric, false for imperial
 * @returns {string}
 */
export function getDistanceUnit(isMetric = true) {
  return isMetric ? 'km' : 'mi';
}

/**
 * Get fuel unit label
 * @param {boolean} isMetric - True for metric, false for imperial
 * @returns {string}
 */
export function getFuelUnit(isMetric = true) {
  return isMetric ? 'L' : 'gal';
}
