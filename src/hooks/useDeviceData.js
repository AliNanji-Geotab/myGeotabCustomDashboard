/**
 * Hook for fetching device-specific data for the dashboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeotabApi } from './useGeotabApi';
import { DIAGNOSTICS } from '../utils/constants';
import { toISOString, getUniqueDaysCount, getDuration } from '../utils/dateUtils';

/**
 * Hook to fetch all data for a specific device
 * @param {object} api - Geotab API object
 * @param {string} deviceId - Selected device ID
 * @param {object} dateRange - { start: Date, end: Date }
 * @returns {object} Device data and loading states
 */
export function useDeviceData(api, deviceId, dateRange) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [device, setDevice] = useState(null);
  const [trips, setTrips] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [fuelUps, setFuelUps] = useState([]);
  const [rules, setRules] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuelLevel, setFuelLevel] = useState(null);
  const [odometer, setOdometer] = useState(null);
  
  // Computed stats
  const [usageStats, setUsageStats] = useState(null);
  const [usageBreakdown, setUsageBreakdown] = useState(null);
  const [exceptionsByRule, setExceptionsByRule] = useState([]);
  
  const { multiCall, getAddresses, getAllWithFeed } = useGeotabApi(api);
  const abortControllerRef = useRef(null);

  /**
   * Fetch all device data
   */
  const fetchData = useCallback(async () => {
    if (!api || !deviceId || !dateRange?.start || !dateRange?.end) {
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const fromDate = toISOString(dateRange.start);
      const toDate = toISOString(dateRange.end);
      
      // Recent date for current status queries (last 7 days for odometer/fuel)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      const recentFromDate = toISOString(recentDate);
      const nowDate = toISOString(new Date());

      console.log('Fetching data for device:', deviceId, 'from:', fromDate, 'to:', toDate);

      // Fetch trips separately using getAllWithFeed to ensure we get all trips
      const tripsPromise = getAllWithFeed('Trip', {
        deviceSearch: { id: deviceId },
        fromDate,
        toDate
      });

      // Make other API calls in parallel
      const [tripsResult, otherResults] = await Promise.all([
        tripsPromise,
        multiCall([
          // 0: Device details
          ['Get', { typeName: 'Device', search: { id: deviceId } }],
          
          // 1: Exception events in date range
          ['Get', { 
            typeName: 'ExceptionEvent', 
            search: { 
              deviceSearch: { id: deviceId }, 
              fromDate, 
              toDate 
            } 
          }],
          
          // 2: Fill-up events
          ['Get', { 
            typeName: 'FillUp', 
            search: { 
              deviceSearch: { id: deviceId }, 
              fromDate, 
              toDate 
            } 
          }],
          
          // 3: Current fuel level (most recent)
          ['Get', { 
            typeName: 'StatusData', 
            search: { 
              diagnosticSearch: { id: DIAGNOSTICS.FUEL_LEVEL },
              deviceSearch: { id: deviceId },
              fromDate: recentFromDate,
              toDate: nowDate
            },
            resultsLimit: 1
          }],
          
          // 4: Current odometer (most recent)
          ['Get', { 
            typeName: 'StatusData', 
            search: { 
              diagnosticSearch: { id: DIAGNOSTICS.ODOMETER },
              deviceSearch: { id: deviceId },
              fromDate: recentFromDate,
              toDate: nowDate
            },
            resultsLimit: 1
          }],
          
          // 5: All rules (for exception names)
          ['Get', { typeName: 'Rule' }],
          
          // 6: All drivers
          ['Get', { typeName: 'User', search: { isDriver: true } }]
        ])
      ]);

      // Process results
      const [
        deviceResult,
        exceptionsResult,
        fuelUpsResult,
        fuelLevelResult,
        odometerResult,
        rulesResult,
        driversResult
      ] = otherResults;

      console.log('Trips fetched:', tripsResult?.length || 0);
      console.log('Sample trip:', tripsResult?.[0]);

      // Set device
      const deviceData = deviceResult?.[0] || null;
      setDevice(deviceData);

      // Set trips
      setTrips(tripsResult || []);

      // Set exceptions with rule names
      const rulesMap = new Map(rulesResult?.map(r => [r.id, r]) || []);
      const driversMap = new Map(driversResult?.map(d => [d.id, d]) || []);
      
      setRules(rulesResult || []);
      setDrivers(driversResult || []);

      // Enrich exceptions with rule and driver info
      const enrichedExceptions = (exceptionsResult || []).map(exc => ({
        ...exc,
        ruleName: rulesMap.get(exc.rule?.id)?.name || 'Unknown Rule',
        ruleDetails: rulesMap.get(exc.rule?.id),
        driverInfo: driversMap.get(exc.driver?.id)
      }));
      setExceptions(enrichedExceptions);

      // Enrich fuel-ups with driver info
      const enrichedFuelUps = (fuelUpsResult || []).map(fu => ({
        ...fu,
        driverInfo: driversMap.get(fu.driver?.id)
      }));
      setFuelUps(enrichedFuelUps);

      // Set fuel level (convert from 0-1 to percentage if needed)
      if (fuelLevelResult?.[0]) {
        const level = fuelLevelResult[0].data;
        setFuelLevel(level > 1 ? level : level * 100);
      } else {
        setFuelLevel(null);
      }

      // Set odometer
      setOdometer(odometerResult?.[0]?.data || deviceData?.odometer || null);

      // Calculate usage stats
      calculateUsageStats(tripsResult || [], deviceData, odometerResult?.[0]?.data, fuelLevelResult?.[0]?.data);
      
      // Calculate usage breakdown
      calculateUsageBreakdown(tripsResult || [], dateRange);
      
      // Calculate exceptions by rule
      calculateExceptionsByRule(enrichedExceptions);

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching device data:', err);
        setError('Failed to load device data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [api, deviceId, dateRange, multiCall, getAllWithFeed]);

  /**
   * Calculate usage statistics
   */
  const calculateUsageStats = useCallback((tripsData, deviceData, currentOdometer, currentFuelLevel) => {
    if (!tripsData || tripsData.length === 0) {
      setUsageStats({
        daysDriven: 0,
        fuelLevel: currentFuelLevel ? (currentFuelLevel > 1 ? currentFuelLevel : currentFuelLevel * 100) : null,
        distanceDriven: 0,
        timeDriven: 0,
        fuelEconomy: null,
        odometer: currentOdometer || deviceData?.odometer || null
      });
      return;
    }

    // Count unique days driven
    const tripDates = tripsData.map(t => new Date(t.start || t.startDateTime));
    const daysDriven = getUniqueDaysCount(tripDates);

    // Sum distance and time
    const distanceDriven = tripsData.reduce((sum, t) => sum + (t.distance || 0), 0);
    
    // drivingDuration is in seconds (TimeSpan format from API), convert to milliseconds
    const timeDriven = tripsData.reduce((sum, t) => {
      if (t.drivingDuration != null) {
        // drivingDuration is in seconds
        return sum + (t.drivingDuration * 1000);
      }
      if (t.start && t.stop) {
        return sum + getDuration(t.start, t.stop);
      }
      return sum;
    }, 0);

    // Calculate fuel economy (if fuel data available)
    const fuelUsed = tripsData.reduce((sum, t) => sum + (t.fuelUsed || 0), 0);
    let fuelEconomy = null;
    if (fuelUsed > 0 && distanceDriven > 0) {
      fuelEconomy = (fuelUsed / distanceDriven) * 100; // L/100km
    }

    setUsageStats({
      daysDriven,
      fuelLevel: currentFuelLevel ? (currentFuelLevel > 1 ? currentFuelLevel : currentFuelLevel * 100) : null,
      distanceDriven,
      timeDriven,
      fuelEconomy,
      odometer: currentOdometer || deviceData?.odometer || null
    });
  }, []);

  /**
   * Calculate usage breakdown (driving, idle, stopped percentages)
   */
  const calculateUsageBreakdown = useCallback((tripsData, range) => {
    if (!tripsData || tripsData.length === 0 || !range?.start || !range?.end) {
      setUsageBreakdown({ driving: 0, idle: 0, stopped: 100 });
      return;
    }

    // Total period in milliseconds
    const totalPeriod = getDuration(range.start, range.end);
    
    if (totalPeriod <= 0) {
      setUsageBreakdown({ driving: 0, idle: 0, stopped: 100 });
      return;
    }

    // Sum driving time and idle time from trips
    // Geotab API returns drivingDuration and idlingDuration in SECONDS
    let drivingTimeMs = 0;
    let idleTimeMs = 0;

    tripsData.forEach(trip => {
      // Driving duration - in seconds, convert to ms
      if (trip.drivingDuration != null && trip.drivingDuration > 0) {
        drivingTimeMs += trip.drivingDuration * 1000;
      } else if (trip.start && trip.stop) {
        // Fallback: calculate from start/stop times
        drivingTimeMs += getDuration(trip.start, trip.stop);
      }

      // Idle time - in seconds, convert to ms
      if (trip.idlingDuration != null && trip.idlingDuration > 0) {
        idleTimeMs += trip.idlingDuration * 1000;
      }
    });

    console.log('Usage breakdown calculation:', {
      totalPeriodMs: totalPeriod,
      totalPeriodHours: totalPeriod / (1000 * 60 * 60),
      drivingTimeMs,
      drivingTimeHours: drivingTimeMs / (1000 * 60 * 60),
      idleTimeMs,
      idleTimeHours: idleTimeMs / (1000 * 60 * 60),
      tripsCount: tripsData.length
    });

    const stoppedTimeMs = Math.max(0, totalPeriod - drivingTimeMs - idleTimeMs);

    const drivingPercent = (drivingTimeMs / totalPeriod) * 100;
    const idlePercent = (idleTimeMs / totalPeriod) * 100;
    const stoppedPercent = (stoppedTimeMs / totalPeriod) * 100;

    setUsageBreakdown({
      driving: Math.min(100, Math.max(0, drivingPercent)),
      idle: Math.min(100, Math.max(0, idlePercent)),
      stopped: Math.min(100, Math.max(0, stoppedPercent))
    });
  }, []);

  /**
   * Calculate exceptions grouped by rule
   */
  const calculateExceptionsByRule = useCallback((exceptionsData) => {
    if (!exceptionsData || exceptionsData.length === 0) {
      setExceptionsByRule([]);
      return;
    }

    const grouped = {};
    exceptionsData.forEach(exc => {
      const ruleName = exc.ruleName || 'Unknown';
      if (!grouped[ruleName]) {
        grouped[ruleName] = { name: ruleName, count: 0, ruleId: exc.rule?.id };
      }
      grouped[ruleName].count++;
    });

    const sorted = Object.values(grouped).sort((a, b) => b.count - a.count);
    setExceptionsByRule(sorted);
  }, []);

  /**
   * Get addresses for exceptions (batch geocoding)
   */
  const enrichExceptionsWithAddresses = useCallback(async (exceptionsToEnrich) => {
    if (!exceptionsToEnrich || exceptionsToEnrich.length === 0) return exceptionsToEnrich;

    try {
      // Get coordinates from exceptions that have location data
      const coordinates = exceptionsToEnrich
        .filter(exc => exc.latitude && exc.longitude)
        .map(exc => ({ x: exc.longitude, y: exc.latitude }));

      if (coordinates.length === 0) return exceptionsToEnrich;

      const addresses = await getAddresses(coordinates);
      
      // Map addresses back to exceptions
      let addressIndex = 0;
      return exceptionsToEnrich.map(exc => {
        if (exc.latitude && exc.longitude && addressIndex < addresses.length) {
          return { ...exc, address: addresses[addressIndex++] };
        }
        return exc;
      });
    } catch (err) {
      console.error('Error fetching addresses:', err);
      return exceptionsToEnrich;
    }
  }, [getAddresses]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    // Loading and error states
    loading,
    error,
    
    // Raw data
    device,
    trips,
    exceptions,
    fuelUps,
    rules,
    drivers,
    fuelLevel,
    odometer,
    
    // Computed data
    usageStats,
    usageBreakdown,
    exceptionsByRule,
    
    // Actions
    refresh: fetchData,
    enrichExceptionsWithAddresses
  };
}

export default useDeviceData;
