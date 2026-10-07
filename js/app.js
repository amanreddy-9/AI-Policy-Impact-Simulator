/**
 * app.js
 * Main application entry point.
 * Initializes the dashboard after all scripts are loaded.
 */

(function () {
  'use strict';

  let dashboard = null;

  function boot() {
    // Verify dependencies
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded!');
      return;
    }
    if (typeof INDIA_DATA === 'undefined') {
      console.error('india_data.js not loaded!');
      return;
    }

    // Boot dashboard
    dashboard = new Dashboard();
    dashboard.init();

    // Expose globally for debugging
    window._dashboard = dashboard;

    console.log('%c AI Policy Impact Simulator', 'color:#00d4ff;font-size:18px;font-weight:bold');
    console.log('%c India-oriented · Monte Carlo · RL Optimizer · Causal Inference', 'color:#8b5cf6;font-size:12px');
    console.log('Dashboard initialized. Use window._dashboard to inspect state.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
