/**
 * Device Header Component
 * Displays asset name with make/model/year subtitle
 */

import React from 'react';
import { formatVehicleInfo } from '../utils/formatters';

/**
 * Device Header with name and vehicle info
 */
function DeviceHeader({ device, loading }) {
  if (loading) {
    return (
      <div className="device-header device-header--loading">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="device-header">
        <h1 className="device-name">Select a Device</h1>
        <p className="device-info">Choose a device from the dropdown to view its dashboard</p>
      </div>
    );
  }

  const vehicleInfo = formatVehicleInfo(device);

  return (
    <div className="device-header">
      <h1 className="device-name">{device.name}</h1>
      <p className="device-info">
        {vehicleInfo}
        {device.serialNumber && (
          <span className="device-serial"> | SN: {device.serialNumber}</span>
        )}
      </p>
    </div>
  );
}

export default DeviceHeader;
