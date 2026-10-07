/**
 * charts.js
 * Chart.js chart builders for all dashboard visualizations.
 */

// Global Chart.js defaults for dark theme
function applyChartDefaults() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#8899bb';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

// ── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = {
  cyan:   '#00d4ff',
  purple: '#8b5cf6',
  green:  '#10b981',
  orange: '#f59e0b',
  pink:   '#ec4899',
  red:    '#ef4444',
  blue:   '#3b82f6',
  teal:   '#14b8a6',
};

const SUBGROUP_COLORS = {
  overall: '#00d4ff',
  women:   '#ec4899',
  scst:    '#f59e0b',
  rural:   '#10b981',
  q1:      '#8b5cf6',
  youth:   '#3b82f6',
};

const CHART_INSTANCES = {};

function destroyChart(id) {
  if (CHART_INSTANCES[id]) {
    CHART_INSTANCES[id].destroy();
    delete CHART_INSTANCES[id];
  }
}

// ── 1. State Choropleth (Bar Chart of States) ─────────────────────────────
function buildStateBar(canvasId, stateResults, metric = 'hdi') {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const sorted = [...stateResults].sort((a, b) => {
    const aVal = a.simulated && a.simulated[metric] ? a.simulated[metric].mean : a.b[metric] || 0;
    const bVal = b.simulated && b.simulated[metric] ? b.simulated[metric].mean : b.b[metric] || 0;
    return bVal - aVal;
  });

  const labels = sorted.map(s => s.abbr);
  const values = sorted.map(s => {
    const v = s.simulated && s.simulated[metric] ? s.simulated[metric].mean : s.b[metric] || 0;
    return parseFloat(v.toFixed(4));
  });
  const baselines = sorted.map(s => parseFloat((s.b[metric] || 0).toFixed(4)));

  // Color gradient based on value
  const max = Math.max(...values);
  const min = Math.min(...values);
  const colors = values.map(v => {
    const t = (v - min) / (max - min + 0.001);
    const r = Math.round(0 + t * 0);
    const g = Math.round(100 + t * 155);
    const b = Math.round(120 + t * 135);
    return `rgba(${r},${g},${b},0.75)`;
  });

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Simulated',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.75','1')),
          borderWidth: 1,
          borderRadius: 3,
        },
        {
          label: 'Baseline',
          data: baselines,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          borderRadius: 3,
          type: 'bar',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          backgroundColor: 'rgba(13,20,37,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { maxRotation: 90, font: { size: 9 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          beginAtZero: false,
        },
      },
      animation: { duration: 800, easing: 'easeOutQuart' },
    },
  });
}

// ── 2. Subgroup Radar Chart ───────────────────────────────────────────────
function buildSubgroupRadar(canvasId, subgroupData) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const metrics = ['hdi', 'emp', 'health', 'lit'];
  const metricLabels = ['HDI', 'Employment', 'Healthcare', 'Literacy'];

  const datasets = subgroupData.map((sg, i) => {
    const color = Object.values(SUBGROUP_COLORS)[i] || '#ffffff';
    const data = metrics.map(m => {
      const v = sg.simulated && sg.simulated[m] ? sg.simulated[m].mean : 0;
      return parseFloat((v * 100).toFixed(1));
    });
    return {
      label: sg.label,
      data,
      backgroundColor: color + '22',
      borderColor: color,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointRadius: 3,
    };
  });

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'radar',
    data: { labels: metricLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 10 } } },
        tooltip: { backgroundColor: 'rgba(13,20,37,0.95)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1 },
      },
      scales: {
        r: {
          beginAtZero: false,
          min: 40,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#4a5568', backdropColor: 'transparent', stepSize: 15 },
          pointLabels: { color: '#8899bb', font: { size: 11 } },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
        },
      },
      animation: { duration: 800 },
    },
  });
}

// ── 3. Monte Carlo Distribution (Histogram) ───────────────────────────────
function buildDistributionChart(canvasId, stats, metricLabel) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !stats || !stats.histogram) return;

  const hist = stats.histogram;
  const labels = hist.map(h => h.x.toFixed(3));
  const values = hist.map(h => parseFloat((h.y * 100).toFixed(2)));

  // Gradient fill
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(0,212,255,0.7)');
  gradient.addColorStop(1, 'rgba(139,92,246,0.1)');

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: metricLabel,
        data: values,
        backgroundColor: gradient,
        borderColor: '#00d4ff',
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,20,37,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          callbacks: {
            title: ([ctx]) => `Value: ${ctx.label}`,
            label: ctx => `Frequency: ${ctx.raw.toFixed(1)}%`,
          },
        },
        annotation: {
          annotations: {
            mean: {
              type: 'line',
              xMin: stats.mean.toFixed(3),
              xMax: stats.mean.toFixed(3),
              borderColor: '#f59e0b',
              borderWidth: 2,
              label: { content: 'Mean', enabled: true, color: '#f59e0b', font: { size: 10 } },
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 8, font: { size: 9 } },
          title: { display: true, text: metricLabel, color: '#8899bb', font: { size: 10 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: { display: true, text: 'Frequency (%)', color: '#8899bb', font: { size: 10 } },
        },
      },
      animation: { duration: 600 },
    },
  });
}

// ── 4. RL Convergence Line Chart ──────────────────────────────────────────
function buildRLConvergenceChart(canvasId, rewardHistory) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !rewardHistory || !rewardHistory.length) return;

  const labels = rewardHistory.map(h => h.round);
  const rewards = rewardHistory.map(h => parseFloat(h.reward.toFixed(5)));
  const best    = rewardHistory.map(h => parseFloat(h.best.toFixed(5)));

  const ctx = canvas.getContext('2d');
  const gradCurrent = ctx.createLinearGradient(0, 0, 0, 250);
  gradCurrent.addColorStop(0, 'rgba(0,212,255,0.3)');
  gradCurrent.addColorStop(1, 'rgba(0,212,255,0.0)');

  const gradBest = ctx.createLinearGradient(0, 0, 0, 250);
  gradBest.addColorStop(0, 'rgba(16,185,129,0.3)');
  gradBest.addColorStop(1, 'rgba(16,185,129,0.0)');

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Current Reward',
          data: rewards,
          borderColor: '#00d4ff',
          backgroundColor: gradCurrent,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Best Reward',
          data: best,
          borderColor: '#10b981',
          backgroundColor: gradBest,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
          borderDash: [6, 3],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          backgroundColor: 'rgba(13,20,37,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          title: { display: true, text: 'Optimization Round', color: '#8899bb', font: { size: 10 } },
          ticks: { maxTicksLimit: 10 },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          title: { display: true, text: 'Policy Reward', color: '#8899bb', font: { size: 10 } },
        },
      },
      animation: { duration: 800, easing: 'easeOutQuart' },
    },
  });
}

// ── 5. Causal Effect Forest Plot (Horizontal Bar) ─────────────────────────
function buildForestPlot(canvasId, hteResults, metric) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !hteResults || !hteResults.length) return;

  const labels = hteResults.map(r => r.label);
  const ates   = hteResults.map(r => parseFloat((r.ate * 100).toFixed(2)));
  const ciLow  = hteResults.map(r => parseFloat(((r.ate - r.ci_lower) * 100).toFixed(2)));
  const ciHigh = hteResults.map(r => parseFloat(((r.ci_upper - r.ate) * 100).toFixed(2)));
  const colors = hteResults.map(r => {
    const id = r.subgroup;
    return SUBGROUP_COLORS[id] || '#00d4ff';
  });

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Treatment Effect (%)',
        data: ates,
        backgroundColor: colors.map(c => c + 'aa'),
        borderColor: colors,
        borderWidth: 1.5,
        borderRadius: 3,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,20,37,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` ATE: ${ctx.raw > 0 ? '+' : ''}${ctx.raw}% | ${hteResults[ctx.dataIndex]?.effect_label || ''}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          title: { display: true, text: 'Treatment Effect (%)', color: '#8899bb', font: { size: 10 } },
        },
        y: { grid: { display: false } },
      },
      animation: { duration: 700 },
    },
  });
}

// ── 6. Time-Series Projection (Line with CI Band) ─────────────────────────
function buildProjectionChart(canvasId, bands, metricLabel) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas || !bands || !bands.length) return;

  const labels = bands.map(b => b.year);
  const means  = bands.map(b => parseFloat(b.mean.toFixed(4)));
  const lowers = bands.map(b => parseFloat(b.lower.toFixed(4)));
  const uppers = bands.map(b => parseFloat(b.upper.toFixed(4)));

  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(139,92,246,0.3)');
  grad.addColorStop(1, 'rgba(139,92,246,0.0)');

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '95% CI Upper',
          data: uppers,
          borderColor: 'transparent',
          backgroundColor: 'rgba(139,92,246,0.1)',
          fill: '+1',
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: metricLabel,
          data: means,
          borderColor: '#8b5cf6',
          backgroundColor: grad,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#8b5cf6',
          fill: false,
          tension: 0.4,
        },
        {
          label: '95% CI Lower',
          data: lowers,
          borderColor: 'transparent',
          backgroundColor: 'rgba(139,92,246,0.1)',
          fill: '-1',
          pointRadius: 0,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,20,37,0.95)',
          borderColor: 'rgba(139,92,246,0.3)',
          borderWidth: 1,
          filter: item => item.datasetIndex === 1,
        },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' } },
      },
      animation: { duration: 900 },
    },
  });
}

// ── 7. Donut Chart (Policy Budget Allocation) ─────────────────────────────
function buildBudgetDonut(canvasId, policy) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const levers = KNOWLEDGE_GRAPH.levers;
  const labels = levers.map(l => l.label.replace('\n', ' '));
  const values = levers.map(l => parseFloat((policy[l.id] || 0).toFixed(2)));
  const colors = levers.map(l => l.color);

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + 'bb'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 10 } } },
        tooltip: {
          backgroundColor: 'rgba(13,20,37,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
        },
      },
      animation: { duration: 600, animateRotate: true },
      cutout: '68%',
    },
  });
}

// ── 8. National Metrics Radar ─────────────────────────────────────────────
function buildNationalRadar(canvasId, national, baseline) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const metrics = ['hdi','emp','health','lit'];
  const metricLabels = ['HDI','Employment','Healthcare','Literacy'];

  const simVals  = metrics.map(m => parseFloat(((national[m]?.mean || 0) * 100).toFixed(1)));
  const baseVals = metrics.map(m => {
    const map = { hdi: INDIA_DATA.national.hdi, emp: INDIA_DATA.national.employment_rate, health: 0.65, lit: INDIA_DATA.national.literacy_rate };
    return parseFloat(((map[m] || 0) * 100).toFixed(1));
  });

  CHART_INSTANCES[canvasId] = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: metricLabels,
      datasets: [
        {
          label: 'Simulated',
          data: simVals,
          backgroundColor: 'rgba(0,212,255,0.15)',
          borderColor: '#00d4ff',
          borderWidth: 2,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 4,
        },
        {
          label: 'Baseline',
          data: baseVals,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.3)',
          borderWidth: 1.5,
          pointBackgroundColor: 'rgba(255,255,255,0.5)',
          pointRadius: 3,
          borderDash: [4, 3],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { backgroundColor: 'rgba(13,20,37,0.95)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1 },
      },
      scales: {
        r: {
          min: 40, max: 100,
          grid: { color: 'rgba(255,255,255,0.07)' },
          ticks: { color: '#4a5568', backdropColor: 'transparent', stepSize: 15 },
          pointLabels: { color: '#8899bb', font: { size: 11 } },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
        },
      },
      animation: { duration: 800 },
    },
  });
}
