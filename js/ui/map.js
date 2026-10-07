/**
 * map.js
 * India State Grid Map renderer.
 * Renders a color-coded tile grid of all Indian states.
 */

class IndiaMap {

  constructor(containerId, tooltipId) {
    this.container = document.getElementById(containerId);
    this.tooltip   = document.getElementById(tooltipId);
    this.metric    = 'hdi';
    this.stateData = null;
    this.colorScaleMin = 0;
    this.colorScaleMax = 1;
  }

  /**
   * Render the state tile grid.
   * @param {Array}  stateData - simulated state results
   * @param {string} metric    - which metric to color-code
   */
  render(stateData, metric = 'hdi') {
    if (!this.container) return;
    this.metric = metric;
    this.stateData = stateData;

    // Compute color scale
    const vals = stateData.map(s => this._getValue(s, metric));
    this.colorScaleMin = Math.min(...vals);
    this.colorScaleMax = Math.max(...vals);

    const grid = this.container;
    grid.innerHTML = '';

    // Arrange states in a rough geographic grid layout
    const layout = IndiaMap._getGridLayout();

    layout.forEach(row => {
      row.forEach(stateId => {
        const tile = document.createElement('div');
        if (!stateId) {
          tile.classList.add('state-tile');
          tile.style.background = 'transparent';
          tile.style.border = 'none';
          tile.style.cursor = 'default';
          grid.appendChild(tile);
          return;
        }

        const st = stateData.find(s => s.id === stateId);
        if (!st) { grid.appendChild(tile); return; }

        const val = this._getValue(st, metric);
        const color = this._getColor(val);
        const change = this._getChange(st, metric);

        tile.classList.add('state-tile');
        tile.style.background = color.bg;
        tile.style.border = `1px solid ${color.border}`;
        tile.style.color = color.text;

        tile.innerHTML = `
          <span class="state-abbr">${st.abbr}</span>
          <span class="state-metric">${this._formatVal(val, metric)}</span>
        `;

        // Tooltip
        tile.addEventListener('mouseenter', (e) => this._showTooltip(e, st, metric, val, change));
        tile.addEventListener('mousemove',  (e) => this._moveTooltip(e));
        tile.addEventListener('mouseleave', () => this._hideTooltip());

        grid.appendChild(tile);
      });
    });
  }

  _getValue(state, metric) {
    const simKey = { hdi:'hdi', employment:'emp', poverty:'pov', income:'income', gini:'gini', health:'health' }[metric] || metric;
    if (state.simulated && state.simulated[simKey] && state.simulated[simKey].mean !== undefined) {
      return state.simulated[simKey].mean;
    }
    const baseKey = { hdi:'hdi', employment:'emp', poverty:'pov', income:'income', gini:'gini', health:'health' }[metric] || metric;
    return state.b[baseKey] || 0;
  }

  _getChange(state, metric) {
    const simKey = { hdi:'hdi', employment:'emp', poverty:'pov', income:'income', gini:'gini', health:'health' }[metric] || metric;
    const baseKey = { hdi:'hdi', employment:'emp', poverty:'pov', income:'income', gini:'gini', health:'health' }[metric] || metric;
    const simVal = state.simulated && state.simulated[simKey] ? state.simulated[simKey].mean : null;
    const baseVal = state.b[baseKey] || 0;
    return simVal !== null ? simVal - baseVal : 0;
  }

  _getColor(val) {
    const t = Math.max(0, Math.min(1, (val - this.colorScaleMin) / (this.colorScaleMax - this.colorScaleMin + 0.001)));

    // Government palette: soft sky blue to deep forest green
    if (t < 0.33) {
      return {
        bg: '#e0f2fe',
        border: '#7dd3fc',
        text: '#0369a1'
      };
    } else if (t < 0.66) {
      return {
        bg: '#dbeafe',
        border: '#93c5fd',
        text: '#1e40af'
      };
    } else {
      return {
        bg: '#dcfce7',
        border: '#86efac',
        text: '#166534'
      };
    }
  }

  _formatVal(val, metric) {
    if (metric === 'income') return `₹${(val/1000).toFixed(0)}k`;
    return (val * 100).toFixed(0) + '%';
  }

  _showTooltip(e, state, metric, val, change) {
    if (!this.tooltip) return;
    const changeSign = change >= 0 ? '+' : '';
    const changeStr  = `${changeSign}${(change * (metric === 'income' ? 1 : 100)).toFixed(metric === 'income' ? 0 : 1)}${metric === 'income' ? ' INR' : '%'}`;
    const metricLabel = { hdi:'HDI', employment:'Employment', poverty:'Poverty', income:'Income/Capita', gini:'Gini Coeff.', health:'Healthcare Access' }[metric] || metric;

    this.tooltip.innerHTML = `
      <strong>${state.name}</strong> (${state.region})<br>
      Pop: <span style="color:#00d4ff">${state.pop}M</span><br>
      ${metricLabel}: <span style="color:#10b981">${this._formatVal(val, metric)}</span><br>
      Change: <span style="color:${change >= 0 ? '#10b981' : '#ef4444'}">${changeStr}</span>
    `;
    this.tooltip.classList.add('visible');
    this._moveTooltip(e);
  }

  _moveTooltip(e) {
    if (!this.tooltip) return;
    const x = e.clientX + 14;
    const y = e.clientY - 10;
    this.tooltip.style.left = Math.min(x, window.innerWidth - 240) + 'px';
    this.tooltip.style.top  = Math.min(y, window.innerHeight - 120) + 'px';
  }

  _hideTooltip() {
    if (this.tooltip) this.tooltip.classList.remove('visible');
  }

  // Geographic-ish grid layout for Indian states (8 columns)
  static _getGridLayout() {
    return [
      // Row 0
      [null, null, null, 'JK', null, null, 'AR', null],
      // Row 1
      [null, 'HP', 'UK', null, 'AS', 'NL', 'MN', 'MZ'],
      // Row 2
      ['PB', 'HR', null, 'BR', 'WB', 'TR', 'ML', null],
      // Row 3
      ['RJ', 'UP', 'MP', 'JH', 'OR', null, null, null],
      // Row 4
      ['GJ', null, 'CG', null, 'MH', null, 'CT', null],
      // Row 5 - Fix: use CT for Chhattisgarh, which conflicts. Let me use correct IDs
      [null, 'MH', null, 'AP', 'TG', null, null, null],
      // Row 6
      ['GA', null, 'KA', null, null, 'TN', null, null],
      // Row 7
      [null, null, 'KL', null, null, null, null, null],
    ];
  }
}

// ── Rebuild map grid with correct state IDs ─────────────────────────────────
// Override with corrected layout
IndiaMap._getGridLayout = function() {
  return [
    [null,  null,  null,  null,  'HP',  'UK',  'AR',  null ],
    [null,  null,  null,  'PB',  'HR',  null,  'AS',  'NL' ],
    ['RJ',  null,  'UP',  null,  'BR',  'WB',  'MN',  'ML' ],
    [null,  'GJ',  null,  'MP',  'JH',  'OR',  'TR',  'MZ' ],
    [null,  null,  null,  'CT',  null,  null,  null,  'SK' ],
    [null,  null,  'MH',  null,  'TG',  'AP',  null,  null ],
    ['GA',  null,  null,  'KA',  null,  null,  null,  null ],
    [null,  null,  null,  'KL',  'TN',  null,  null,  null ],
  ];
};
