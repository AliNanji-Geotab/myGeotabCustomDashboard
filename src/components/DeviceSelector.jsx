/**
 * Device Selector Component
 * Dropdown to select which device to view
 */

import React, { useMemo, useCallback } from 'react';

/**
 * Device selector dropdown with search
 */
function DeviceSelector({ devices, selectedDeviceId, onChange, loading }) {
  // Sort devices alphabetically by name
  const sortedDevices = useMemo(() => {
    if (!devices) return [];
    return [...devices].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
  }, [devices]);

  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  if (loading) {
    return (
      <div className="device-selector device-selector--loading">
        <div className="skeleton skeleton-input"></div>
      </div>
    );
  }

  return (
    <div className="device-selector">
      <label htmlFor="device-select" className="device-selector-label">
        Device
      </label>
      <select
        id="device-select"
        className="device-selector-dropdown"
        value={selectedDeviceId || ''}
        onChange={handleChange}
        aria-label="Select device"
      >
        <option value="" disabled>
          Select a device...
        </option>
        {sortedDevices.map(device => (
          <option key={device.id} value={device.id}>
            {device.name}
            {device.serialNumber ? ` (${device.serialNumber})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DeviceSelector;
