/**
 * Hook for detecting and managing user's unit preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { useGeotabApi } from './useGeotabApi';

/**
 * Hook to detect user's measurement system preference
 * @param {object} api - Geotab API object
 * @returns {{ isMetric: boolean, loading: boolean, error: string|null }}
 */
export function useUnits(api) {
  const [isMetric, setIsMetric] = useState(true); // Default to metric
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getSession, get } = useGeotabApi(api);

  useEffect(() => {
    let mounted = true;

    async function detectUnits() {
      if (!api) {
        setLoading(false);
        return;
      }

      try {
        // Get current session to find username
        const session = await getSession();
        
        if (!mounted) return;

        // Get user details to check their settings
        const users = await get('User', { name: session.userName });
        
        if (!mounted) return;

        if (users && users.length > 0) {
          const user = users[0];
          
          // Check user's isMetric property
          // If not explicitly set, default based on locale
          if (typeof user.isMetric === 'boolean') {
            setIsMetric(user.isMetric);
          } else {
            // Fallback: detect from browser locale
            const locale = navigator.language || 'en-US';
            const imperialLocales = ['en-US', 'en-LR', 'en-MM']; // US, Liberia, Myanmar
            setIsMetric(!imperialLocales.some(l => locale.startsWith(l.split('-')[0]) && locale.includes(l.split('-')[1])));
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error detecting units:', err);
        setError('Failed to detect unit preferences');
        // Keep default (metric) on error
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    detectUnits();

    return () => {
      mounted = false;
    };
  }, [api, getSession, get]);

  /**
   * Manually set unit preference
   */
  const setUnitPreference = useCallback((metric) => {
    setIsMetric(metric);
  }, []);

  /**
   * Toggle between metric and imperial
   */
  const toggleUnits = useCallback(() => {
    setIsMetric(prev => !prev);
  }, []);

  return {
    isMetric,
    loading,
    error,
    setUnitPreference,
    toggleUnits
  };
}

export default useUnits;
