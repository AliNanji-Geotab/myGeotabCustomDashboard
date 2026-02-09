/**
 * MyGeotab Add-In Entry Point
 * Device Dashboard - Shows device-specific analytics
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/dashboard.css';

// MyGeotab Add-In registration
// eslint-disable-next-line no-undef
geotab.addin.deviceDashboard = function() {
  let root = null;
  let apiRef = null;
  let stateRef = null;

  return {
    /**
     * Initialize is called when the Add-In is first loaded
     */
    initialize: function(api, state, callback) {
      apiRef = api;
      stateRef = state;
      
      // Required: call callback to signal initialization complete
      if (callback) {
        callback();
      }
    },

    /**
     * Focus is called when the Add-In page becomes active
     */
    focus: function(api, state) {
      apiRef = api;
      stateRef = state;

      const container = document.getElementById('deviceDashboardRoot');
      
      if (container) {
        // Clear any loading state
        container.innerHTML = '';
        
        // Create React root and render
        root = createRoot(container);
        root.render(
          <App 
            api={api} 
            state={state}
          />
        );
      }
    },

    /**
     * Blur is called when navigating away from the Add-In
     */
    blur: function(api, state) {
      // Cleanup React component
      if (root) {
        root.unmount();
        root = null;
      }
    }
  };
};

// For local development without MyGeotab
if (typeof window !== 'undefined' && !window.geotab) {
  console.log('Running in development mode without MyGeotab');
  
  // Mock geotab object for development
  window.geotab = {
    addin: {}
  };
  
  // Create mock API for testing
  const mockApi = {
    call: (method, params, success, error) => {
      console.log('Mock API call:', method, params);
      // Return empty results for development
      setTimeout(() => {
        if (method === 'Get') {
          success([]);
        } else {
          success({});
        }
      }, 500);
    },
    multiCall: (calls, success, error) => {
      console.log('Mock multiCall:', calls);
      setTimeout(() => {
        success(calls.map(() => []));
      }, 500);
    },
    getSession: (callback) => {
      callback({ userName: 'dev@test.com', database: 'demo' });
    }
  };

  // Initialize and focus for development
  const container = document.getElementById('deviceDashboardRoot');
  if (container) {
    container.innerHTML = '';
    const root = createRoot(container);
    root.render(
      <App 
        api={mockApi} 
        state={{ language: 'en' }}
      />
    );
  }
}
