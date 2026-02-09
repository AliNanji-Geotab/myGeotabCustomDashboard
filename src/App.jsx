/**
 * Main Dashboard Application Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useGeotabApi } from './hooks/useGeotabApi';
import { useUnits } from './hooks/useUnits';
import { useDeviceData } from './hooks/useDeviceData';
import { getDefaultDateRange, getDateRangeFromPreset } from './utils/dateUtils';

// Components
import DeviceHeader from './components/DeviceHeader';
import DeviceSelector from './components/DeviceSelector';
import DateRangeFilter from './components/DateRangeFilter';
import UsageStats from './components/UsageStats';
import UsageBreakdown from './components/UsageBreakdown';
import ExceptionsChart from './components/ExceptionsChart';
import ExceptionsTable from './components/ExceptionsTable';
import FuelUpsTable from './components/FuelUpsTable';

/**
 * Main Dashboard App
 */
function App({ api, state }) {
  // State for device and date selection
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  
  // Hooks
  const { get } = useGeotabApi(api);
  const { isMetric, loading: unitsLoading } = useUnits(api);
  const {
    loading: dataLoading,
    error: dataError,
    device,
    usageStats,
    usageBreakdown,
    exceptions,
    exceptionsByRule,
    fuelUps,
    refresh
  } = useDeviceData(api, selectedDeviceId, dateRange);

  /**
   * Fetch all devices on mount
   */
  useEffect(() => {
    async function loadDevices() {
      try {
        setDevicesLoading(true);
        const deviceList = await get('Device');
        setDevices(deviceList || []);
        
        // Auto-select first device if none selected
        if (!selectedDeviceId && deviceList?.length > 0) {
          setSelectedDeviceId(deviceList[0].id);
        }
      } catch (err) {
        console.error('Error loading devices:', err);
      } finally {
        setDevicesLoading(false);
      }
    }

    if (api) {
      loadDevices();
    }
  }, [api, get, selectedDeviceId]);

  /**
   * Handle device selection change
   */
  const handleDeviceChange = useCallback((deviceId) => {
    setSelectedDeviceId(deviceId);
  }, []);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
  }, []);

  /**
   * Handle preset selection
   */
  const handlePresetSelect = useCallback((preset) => {
    const range = getDateRangeFromPreset(preset);
    setDateRange(range);
  }, []);

  // Show loading state
  if (devicesLoading || unitsLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Show error if no devices
  if (devices.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </svg>
        </div>
        <h2>No Devices Found</h2>
        <p>There are no devices available in this database.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <DeviceHeader device={device} loading={dataLoading} />
        
        <div className="dashboard-filters">
          <DeviceSelector
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onChange={handleDeviceChange}
            loading={devicesLoading}
          />
          
          <DateRangeFilter
            dateRange={dateRange}
            onChange={handleDateRangeChange}
            onPresetSelect={handlePresetSelect}
          />
        </div>
      </header>

      {/* Error Message */}
      {dataError && (
        <div className="dashboard-error">
          <span className="error-icon">!</span>
          <span>{dataError}</span>
          <button onClick={refresh} className="retry-button">Retry</button>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Usage Stats Cards */}
        <section className="dashboard-section">
          <UsageStats 
            stats={usageStats} 
            loading={dataLoading}
            isMetric={isMetric}
          />
        </section>

        {/* Usage Breakdown */}
        <section className="dashboard-section">
          <h2 className="section-title">Usage Breakdown</h2>
          <UsageBreakdown 
            breakdown={usageBreakdown} 
            loading={dataLoading}
          />
        </section>

        {/* Exceptions Chart */}
        <section className="dashboard-section">
          <h2 className="section-title">Exceptions by Type</h2>
          <ExceptionsChart 
            data={exceptionsByRule} 
            loading={dataLoading}
          />
        </section>

        {/* Exceptions Table */}
        <section className="dashboard-section">
          <h2 className="section-title">Exception Details</h2>
          <ExceptionsTable 
            exceptions={exceptions}
            loading={dataLoading}
            isMetric={isMetric}
            api={api}
          />
        </section>

        {/* Fuel-Ups Table */}
        <section className="dashboard-section">
          <h2 className="section-title">Fuel-Ups</h2>
          <FuelUpsTable 
            fuelUps={fuelUps}
            loading={dataLoading}
            isMetric={isMetric}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Device Dashboard Add-In</p>
      </footer>
    </div>
  );
}

export default App;
