/**
 * Hook for making Geotab API calls with error handling
 */

import { useCallback, useRef } from 'react';

/**
 * Wrapper hook for Geotab API calls
 * @param {object} api - Geotab API object from MyGeotab
 * @returns {object} API helper functions
 */
export function useGeotabApi(api) {
  const apiRef = useRef(api);
  apiRef.current = api;

  /**
   * Make a single API call with promise wrapper
   */
  const call = useCallback((method, params) => {
    return new Promise((resolve, reject) => {
      if (!apiRef.current) {
        reject(new Error('API not initialized'));
        return;
      }

      apiRef.current.call(
        method,
        params,
        (result) => resolve(result),
        (error) => reject(error)
      );
    });
  }, []);

  /**
   * Make multiple API calls in a single request
   */
  const multiCall = useCallback((calls) => {
    return new Promise((resolve, reject) => {
      if (!apiRef.current) {
        reject(new Error('API not initialized'));
        return;
      }

      apiRef.current.multiCall(
        calls,
        (results) => resolve(results),
        (error) => reject(error)
      );
    });
  }, []);

  /**
   * Get entities with search parameters
   */
  const get = useCallback((typeName, search = {}) => {
    return call('Get', { typeName, search });
  }, [call]);

  /**
   * Get entity count
   */
  const getCount = useCallback((typeName, search = {}) => {
    return call('GetCountOf', { typeName, search });
  }, [call]);

  /**
   * Get addresses from coordinates (reverse geocoding)
   */
  const getAddresses = useCallback((coordinates) => {
    // coordinates should be array of { x: longitude, y: latitude }
    return call('GetAddresses', { coordinates });
  }, [call]);

  /**
   * Get current session info
   */
  const getSession = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!apiRef.current) {
        reject(new Error('API not initialized'));
        return;
      }

      apiRef.current.getSession((session) => {
        resolve(session);
      });
    });
  }, []);

  /**
   * Navigate to a MyGeotab page
   */
  const navigate = useCallback((hash) => {
    if (window.parent) {
      window.parent.location.hash = hash;
    }
  }, []);

  /**
   * Navigate to device page
   */
  const navigateToDevice = useCallback((deviceId) => {
    navigate(`device,id:${deviceId}`);
  }, [navigate]);

  /**
   * Navigate to trips history for a device
   */
  const navigateToTrips = useCallback((deviceId) => {
    navigate(`tripsHistory,devices:!(${deviceId})`);
  }, [navigate]);

  /**
   * Navigate to exceptions page
   */
  const navigateToExceptions = useCallback((deviceId, exceptionId) => {
    if (exceptionId) {
      navigate(`exceptions,id:${exceptionId}`);
    } else if (deviceId) {
      navigate(`exceptions,devices:!(${deviceId})`);
    } else {
      navigate('exceptions');
    }
  }, [navigate]);

  /**
   * Navigate to map with device
   */
  const navigateToMap = useCallback((deviceId) => {
    navigate(`map,liveVehicleIds:!(${deviceId})`);
  }, [navigate]);

  return {
    call,
    multiCall,
    get,
    getCount,
    getAddresses,
    getSession,
    navigate,
    navigateToDevice,
    navigateToTrips,
    navigateToExceptions,
    navigateToMap
  };
}

export default useGeotabApi;
