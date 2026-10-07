/**
 * india_data.js  — v2 (Proposal-aligned)
 * Synthetic but realistic Indian socioeconomic baseline data.
 * Expanded with: occupational groups, historical policy episodes,
 * agent-population demographics, and fiscal cost metadata.
 * Sources modelled on: Census 2011/2021, NSSO/PLFS 2022-23, NFHS-5, SECC,
 * RBI/MoSPI statistics, Economic Survey data.
 */

const INDIA_DATA = {

  // ── States ────────────────────────────────────────────────────────────────
  states: [
    { id:'AP',  name:'Andhra Pradesh',     abbr:'AP',  region:'South',     pop:49.5,  area:162975,
      b:{ hdi:0.649, emp:0.537, income:142, health:0.712, lit:0.671, pov:0.099, gini:0.346, rural:0.706, agri_share:0.52 }},
    { id:'AR',  name:'Arunachal Pradesh',  abbr:'AR',  region:'Northeast', pop:1.4,   area:83743,
      b:{ hdi:0.603, emp:0.488, income:103, health:0.548, lit:0.659, pov:0.347, gini:0.298, rural:0.777, agri_share:0.58 }},
    { id:'AS',  name:'Assam',              abbr:'AS',  region:'Northeast', pop:31.2,  area:78438,
      b:{ hdi:0.614, emp:0.483, income:82,  health:0.558, lit:0.728, pov:0.296, gini:0.305, rural:0.861, agri_share:0.61 }},
    { id:'BR',  name:'Bihar',              abbr:'BR',  region:'East',      pop:104.1, area:94163,
      b:{ hdi:0.574, emp:0.428, income:40,  health:0.478, lit:0.617, pov:0.399, gini:0.271, rural:0.889, agri_share:0.72 }},
    { id:'CT',  name:'Chhattisgarh',       abbr:'CG',  region:'Central',   pop:25.5,  area:135192,
      b:{ hdi:0.613, emp:0.502, income:88,  health:0.558, lit:0.707, pov:0.368, gini:0.314, rural:0.768, agri_share:0.65 }},
    { id:'GA',  name:'Goa',                abbr:'GA',  region:'West',      pop:1.5,   area:3702,
      b:{ hdi:0.761, emp:0.598, income:390, health:0.875, lit:0.887, pov:0.053, gini:0.381, rural:0.378, agri_share:0.11 }},
    { id:'GJ',  name:'Gujarat',            abbr:'GJ',  region:'West',      pop:60.4,  area:196024,
      b:{ hdi:0.672, emp:0.541, income:198, health:0.724, lit:0.792, pov:0.149, gini:0.358, rural:0.574, agri_share:0.38 }},
    { id:'HR',  name:'Haryana',            abbr:'HR',  region:'North',     pop:25.4,  area:44212,
      b:{ hdi:0.708, emp:0.519, income:228, health:0.762, lit:0.758, pov:0.112, gini:0.374, rural:0.650, agri_share:0.42 }},
    { id:'HP',  name:'Himachal Pradesh',   abbr:'HP',  region:'North',     pop:6.9,   area:55673,
      b:{ hdi:0.725, emp:0.607, income:174, health:0.808, lit:0.838, pov:0.082, gini:0.328, rural:0.900, agri_share:0.48 }},
    { id:'JH',  name:'Jharkhand',          abbr:'JH',  region:'East',      pop:33.0,  area:79716,
      b:{ hdi:0.599, emp:0.463, income:63,  health:0.507, lit:0.668, pov:0.362, gini:0.282, rural:0.758, agri_share:0.67 }},
    { id:'KA',  name:'Karnataka',          abbr:'KA',  region:'South',     pop:61.1,  area:191791,
      b:{ hdi:0.682, emp:0.544, income:194, health:0.741, lit:0.757, pov:0.165, gini:0.371, rural:0.615, agri_share:0.44 }},
    { id:'KL',  name:'Kerala',             abbr:'KL',  region:'South',     pop:33.4,  area:38852,
      b:{ hdi:0.779, emp:0.547, income:204, health:0.895, lit:0.944, pov:0.071, gini:0.402, rural:0.476, agri_share:0.22 }},
    { id:'MP',  name:'Madhya Pradesh',     abbr:'MP',  region:'Central',   pop:72.6,  area:308252,
      b:{ hdi:0.606, emp:0.478, income:79,  health:0.538, lit:0.700, pov:0.317, gini:0.307, rural:0.722, agri_share:0.68 }},
    { id:'MH',  name:'Maharashtra',        abbr:'MH',  region:'West',      pop:112.4, area:307713,
      b:{ hdi:0.696, emp:0.535, income:203, health:0.762, lit:0.823, pov:0.172, gini:0.414, rural:0.549, agri_share:0.36 }},
    { id:'MN',  name:'Manipur',            abbr:'MN',  region:'Northeast', pop:2.9,   area:22327,
      b:{ hdi:0.696, emp:0.472, income:97,  health:0.661, lit:0.769, pov:0.229, gini:0.311, rural:0.701, agri_share:0.55 }},
    { id:'ML',  name:'Meghalaya',          abbr:'ML',  region:'Northeast', pop:3.0,   area:22429,
      b:{ hdi:0.636, emp:0.518, income:88,  health:0.582, lit:0.748, pov:0.321, gini:0.295, rural:0.797, agri_share:0.60 }},
    { id:'MZ',  name:'Mizoram',            abbr:'MZ',  region:'Northeast', pop:1.1,   area:21081,
      b:{ hdi:0.705, emp:0.522, income:114, health:0.698, lit:0.915, pov:0.201, gini:0.332, rural:0.479, agri_share:0.45 }},
    { id:'NL',  name:'Nagaland',           abbr:'NL',  region:'Northeast', pop:2.0,   area:16579,
      b:{ hdi:0.679, emp:0.488, income:109, health:0.612, lit:0.800, pov:0.188, gini:0.283, rural:0.706, agri_share:0.52 }},
    { id:'OR',  name:'Odisha',             abbr:'OR',  region:'East',      pop:41.9,  area:155707,
      b:{ hdi:0.606, emp:0.477, income:72,  health:0.558, lit:0.729, pov:0.325, gini:0.296, rural:0.834, agri_share:0.64 }},
    { id:'PB',  name:'Punjab',             abbr:'PB',  region:'North',     pop:27.7,  area:50362,
      b:{ hdi:0.723, emp:0.536, income:205, health:0.788, lit:0.768, pov:0.083, gini:0.363, rural:0.626, agri_share:0.46 }},
    { id:'RJ',  name:'Rajasthan',          abbr:'RJ',  region:'North',     pop:68.5,  area:342239,
      b:{ hdi:0.629, emp:0.491, income:93,  health:0.598, lit:0.667, pov:0.224, gini:0.325, rural:0.750, agri_share:0.55 }},
    { id:'SK',  name:'Sikkim',             abbr:'SK',  region:'Northeast', pop:0.6,   area:7096,
      b:{ hdi:0.716, emp:0.563, income:224, health:0.782, lit:0.820, pov:0.082, gini:0.331, rural:0.748, agri_share:0.40 }},
    { id:'TN',  name:'Tamil Nadu',         abbr:'TN',  region:'South',     pop:72.1,  area:130058,
      b:{ hdi:0.708, emp:0.553, income:185, health:0.792, lit:0.802, pov:0.115, gini:0.378, rural:0.516, agri_share:0.30 }},
    { id:'TG',  name:'Telangana',          abbr:'TG',  region:'South',     pop:35.0,  area:112077,
      b:{ hdi:0.669, emp:0.545, income:166, health:0.728, lit:0.666, pov:0.137, gini:0.359, rural:0.611, agri_share:0.40 }},
    { id:'TR',  name:'Tripura',            abbr:'TR',  region:'Northeast', pop:3.7,   area:10486,
      b:{ hdi:0.658, emp:0.458, income:86,  health:0.623, lit:0.876, pov:0.163, gini:0.293, rural:0.736, agri_share:0.52 }},
    { id:'UP',  name:'Uttar Pradesh',      abbr:'UP',  region:'North',     pop:199.8, area:240928,
      b:{ hdi:0.596, emp:0.432, income:55,  health:0.482, lit:0.678, pov:0.298, gini:0.302, rural:0.779, agri_share:0.62 }},
    { id:'UK',  name:'Uttarakhand',        abbr:'UK',  region:'North',     pop:10.1,  area:53483,
      b:{ hdi:0.684, emp:0.517, income:144, health:0.718, lit:0.797, pov:0.177, gini:0.334, rural:0.697, agri_share:0.50 }},
    { id:'WB',  name:'West Bengal',        abbr:'WB',  region:'East',      pop:91.3,  area:88752,
      b:{ hdi:0.641, emp:0.487, income:100, health:0.638, lit:0.767, pov:0.199, gini:0.335, rural:0.682, agri_share:0.52 }},
  ],

  // ── Demographic Subgroups (aligned with proposal) ─────────────────────────
  subgroups: [
    { id:'overall',       label:'Overall',               mult: { mgnrega_days:1.00, msp_hike:1.00, pmkisan:1.00, gst_rate:-0.02, health_pct:1.00, edu_pct:1.00 } },
    { id:'small_farmers', label:'Small/Marginal Farmers', mult: { mgnrega_days:1.45, msp_hike:1.80, pmkisan:2.20, gst_rate:-0.03, health_pct:0.90, edu_pct:0.85 } },
    { id:'agri_labour',   label:'Agricultural Labourers', mult: { mgnrega_days:1.80, msp_hike:0.60, pmkisan:0.50, gst_rate:-0.04, health_pct:1.10, edu_pct:0.80 } },
    { id:'daily_wage',    label:'Daily Wage (Urban)',     mult: { mgnrega_days:0.40, msp_hike:0.20, pmkisan:0.10, gst_rate:-0.05, health_pct:1.05, edu_pct:0.90 } },
    { id:'formal_sector', label:'Formal Sector Workers',  mult: { mgnrega_days:0.10, msp_hike:0.15, pmkisan:0.05, gst_rate:-0.02, health_pct:0.85, edu_pct:1.20 } },
    { id:'women',         label:'Women',                  mult: { mgnrega_days:1.35, msp_hike:0.90, pmkisan:1.10, gst_rate:-0.03, health_pct:1.40, edu_pct:1.50 } },
    { id:'scst',          label:'SC/ST Communities',      mult: { mgnrega_days:1.55, msp_hike:0.85, pmkisan:1.30, gst_rate:-0.04, health_pct:1.20, edu_pct:1.40 } },
  ],

  // ── Occupational Groups (Census/NSSO categories) ──────────────────────────
  occupationalGroups: [
    { id:'small_farmers',  label:'Small/Marginal Farmers',  share:0.41, primaryPolicy:'msp_hike',   primaryState:'PB', secondaryState:'BR',
      stateShares: { PB:0.62, HR:0.58, UP:0.65, BR:0.71, MP:0.68, RJ:0.58, TN:0.38, AP:0.52 }},
    { id:'agri_labour',    label:'Agricultural Labourers',  share:0.21, primaryPolicy:'mgnrega_days', primaryState:'BR', secondaryState:'OR',
      stateShares: { BR:0.28, UP:0.24, WB:0.22, OR:0.26, TN:0.18, AP:0.21, KA:0.17, MH:0.15 }},
    { id:'daily_wage',     label:'Daily Wage Workers',      share:0.14, primaryPolicy:'gst_rate',    primaryState:'MH', secondaryState:'GJ',
      stateShares: { MH:0.16, GJ:0.14, TN:0.13, KA:0.12, HR:0.11, AP:0.12, WB:0.11, KL:0.09 }},
    { id:'formal_sector',  label:'Formal Sector Workers',   share:0.08, primaryPolicy:'edu_pct',     primaryState:'KL', secondaryState:'TN',
      stateShares: { KL:0.14, TN:0.12, KA:0.11, MH:0.10, HR:0.09, GJ:0.09, AP:0.08, PB:0.08 }},
    { id:'self_emp_rural', label:'Self-Employed (Rural)',   share:0.11, primaryPolicy:'pmkisan',     primaryState:'UP', secondaryState:'MP',
      stateShares: { UP:0.14, MP:0.13, RJ:0.12, CT:0.13, AS:0.11, OR:0.12, WB:0.11, BR:0.10 }},
    { id:'other',          label:'Other / Unclassified',    share:0.05, primaryPolicy:'health_pct',  primaryState:'AR', secondaryState:'NL',
      stateShares: {} },
  ],

  // ── Causal Weights: policy lever → outcome (elasticities) ─────────────────
  // Updated for new proposal-aligned levers
  causalWeights: {
    mgnrega_days: {
      employment_rate:    0.72,   // +1% days → +0.72% emp
      income_pc:          0.48,
      poverty_rate:      -0.52,
      hdi:                0.20,
      gini:              -0.22,
      healthcare_access:  0.12,
      lit:                0.05,
    },
    msp_hike: {
      income_pc:          0.58,   // helps farmers most
      employment_rate:    0.24,
      poverty_rate:      -0.36,
      hdi:                0.18,
      gini:               0.04,   // can increase inequality (larger farmers benefit more)
      healthcare_access:  0.10,
      lit:                0.04,
    },
    pmkisan: {
      income_pc:          0.42,   // direct transfer — high income effect for small farmers
      poverty_rate:      -0.48,
      healthcare_access:  0.22,
      hdi:                0.22,
      gini:              -0.18,
      employment_rate:    0.14,
      lit:                0.08,
    },
    gst_rate: {
      income_pc:         -0.38,   // higher GST → lower disposable income
      employment_rate:   -0.22,
      poverty_rate:       0.28,
      hdi:               -0.16,
      gini:               0.12,
      healthcare_access: -0.10,
      lit:               -0.06,
    },
    health_pct: {
      healthcare_access:  0.75,
      hdi:                0.40,
      poverty_rate:      -0.16,
      income_pc:          0.14,
      gini:              -0.10,
      employment_rate:    0.08,
      lit:                0.04,
    },
    edu_pct: {
      lit:                0.65,
      employment_rate:    0.36,
      income_pc:          0.48,
      hdi:                0.50,
      gini:              -0.26,
      healthcare_access:  0.10,
      poverty_rate:      -0.22,
    },
  },

  // ── Historical Policy Episodes (grounding causal estimates) ───────────────
  historicalEpisodes: [
    {
      id: 'demonetisation',
      label: 'Demonetisation',
      year: '2016',
      icon: '💵',
      color: '#ef4444',
      policy: 'Withdrawal of ₹500 & ₹1000 notes (8 Nov 2016)',
      method: 'DiD — treated = cash-intensive informal sector districts',
      source: 'PLFS 2016–17, NSSO 73rd Round, CMIE CPHS panel data',
      duration: '12 months (acute phase: 3 months)',
      subgroupEffects: {
        'Daily Wage Workers':      { income: -0.18, employment: -0.14, consumption: -0.20 },
        'Small/Marginal Farmers':  { income: -0.09, employment: -0.06, consumption: -0.12 },
        'Agricultural Labourers':  { income: -0.16, employment: -0.13, consumption: -0.18 },
        'Formal Sector Workers':   { income: -0.02, employment:  0.01, consumption: -0.04 },
        'Self-Employed (Rural)':   { income: -0.14, employment: -0.10, consumption: -0.15 },
      },
      nationalEffect: { income: -0.08, employment: -0.07, gdp_growth: -0.021 },
      description: 'Most severe impact on cash-dependent informal workers and daily wage labourers. Formal sector nearly insulated. Rural districts with high unbanked population saw most acute distress.',
    },
    {
      id: 'gst_rollout',
      label: 'GST Rollout',
      year: '2017',
      icon: '📦',
      color: '#f59e0b',
      policy: 'Goods & Services Tax unified rollout (1 Jul 2017)',
      method: 'PSM — matched treated SMEs vs. large corporates pre/post rollout',
      source: 'MSME Ministry data, RBI SME credit survey, PLFS 2017–18',
      duration: '18 months (transition phase)',
      subgroupEffects: {
        'Daily Wage Workers':      { income: -0.06, employment: -0.08, consumption: -0.05 },
        'Small/Marginal Farmers':  { income: -0.03, employment: -0.02, consumption: -0.04 },
        'Formal Sector Workers':   { income:  0.02, employment:  0.03, consumption:  0.01 },
        'Self-Employed (Rural)':   { income: -0.10, employment: -0.07, consumption: -0.08 },
        'Agricultural Labourers':  { income: -0.04, employment: -0.05, consumption: -0.05 },
      },
      nationalEffect: { income: -0.03, employment: -0.02, gdp_growth: -0.005 },
      description: 'SME and informal trade most disrupted. Digital tax filing burden disproportionately affected small businesses. Formal large-corporates benefited from input tax credit integration.',
    },
    {
      id: 'mgnrega_2009',
      label: 'MGNREGA Expansion',
      year: '2009',
      icon: '🛠️',
      color: '#10b981',
      policy: 'MGNREGA budget doubled post-GFC; 100 days guarantee enforced',
      method: 'Causal Forests (HTE) — variation in MGNREGA implementation intensity',
      source: 'NSSO 66th Round, MoRD administrative data, ASER 2009–11',
      duration: '3 years (2009–12)',
      subgroupEffects: {
        'Agricultural Labourers':  { income:  0.14, employment:  0.18, consumption:  0.12 },
        'Small/Marginal Farmers':  { income:  0.08, employment:  0.11, consumption:  0.09 },
        'Women':                   { income:  0.16, employment:  0.22, consumption:  0.13 },
        'SC/ST Communities':       { income:  0.18, employment:  0.20, consumption:  0.15 },
        'Formal Sector Workers':   { income:  0.01, employment:  0.00, consumption:  0.02 },
      },
      nationalEffect: { income: 0.06, employment: 0.09, poverty_reduction: -0.04 },
      description: 'Strongest positive effects on agricultural labourers and women, especially in backward districts. Documented upward wage pressure on private agricultural employment.',
    },
    {
      id: 'msp_2018',
      label: 'MSP Hike (2018)',
      year: '2018',
      icon: '🌾',
      color: '#8b5cf6',
      policy: 'MSP increased by 50% above cost-of-production for kharif crops',
      method: 'DiD — treated = MSP-procured crop districts vs. non-MSP districts',
      source: 'CACP reports, NSSO 77th Round, PLFS 2018–19, State procurement data',
      duration: '2 seasons (2018–19 kharif/rabi)',
      subgroupEffects: {
        'Small/Marginal Farmers':  { income:  0.12, employment:  0.05, consumption:  0.10 },
        'Agricultural Labourers':  { income:  0.04, employment:  0.06, consumption:  0.05 },
        'Daily Wage Workers':      { income:  0.02, employment:  0.02, consumption:  0.03 },
        'Formal Sector Workers':   { income:  0.00, employment:  0.00, consumption:  0.01 },
        'Self-Employed (Rural)':   { income:  0.06, employment:  0.03, consumption:  0.07 },
      },
      nationalEffect: { income: 0.04, employment: 0.02, gini_change: +0.008 },
      description: 'Benefits concentrated in wheat/rice belt states (PB, HR, MP). Marginal farmers in non-procured crops (coarse cereals, pulses) saw limited gains. Some widening of intra-rural inequality.',
    },
  ],

  // ── Synthetic Agent Population demographics ───────────────────────────────
  agentPopulation: {
    total: 100000,
    description: 'Statistical agents whose demographic mix is calibrated to Census/NSSO/PLFS distributions.',
    breakdown: [
      { category:'Gender',    groups: [{ label:'Male', share:0.518 }, { label:'Female', share:0.482 }] },
      { category:'Residence', groups: [{ label:'Rural', share:0.651 }, { label:'Urban', share:0.349 }] },
      { category:'Social',    groups: [{ label:'General', share:0.504 }, { label:'OBC', share:0.270 }, { label:'SC', share:0.166 }, { label:'ST', share:0.086 }] },
      { category:'Income Quintile', groups: [
        { label:'Q1 (<₹5k/mo)', share:0.200 },
        { label:'Q2 (₹5-10k)',  share:0.200 },
        { label:'Q3 (₹10-20k)', share:0.200 },
        { label:'Q4 (₹20-40k)', share:0.200 },
        { label:'Q5 (>₹40k)',   share:0.200 },
      ]},
      { category:'Occupation', groups: [
        { label:'Small/Marginal Farmers', share:0.41 },
        { label:'Agri Labourers',         share:0.21 },
        { label:'Daily Wage (Urban)',     share:0.14 },
        { label:'Formal Sector',          share:0.08 },
        { label:'Self-Employed Rural',    share:0.11 },
        { label:'Other',                  share:0.05 },
      ]},
    ],
  },

  // ── Policy Baseline (proposal-aligned levers) ─────────────────────────────
  policyBaseline: {
    mgnrega_days: 100,   // days guaranteed/yr
    msp_hike:     5,     // % above baseline
    pmkisan:      6,     // ₹k/yr (current ₹6,000/yr)
    gst_rate:     14,    // effective weighted avg GST %
    health_pct:   1.8,   // % of GDP
    edu_pct:      3.2,   // % of GDP
  },

  // ── Fiscal cost per lever (₹ crore per unit increase) ─────────────────────
  fiscalCost: {
    mgnrega_days: 1200,   // ₹ cr per additional day guaranteed (national)
    msp_hike:     4500,   // ₹ cr per 1% MSP hike (procurement cost)
    pmkisan:      8800,   // ₹ cr per ₹1k increase in transfer
    gst_rate:    -6500,   // negative = revenue gain per 1% rate increase
    health_pct:  15000,   // ₹ cr per 0.1% GDP increase
    edu_pct:     18000,   // ₹ cr per 0.1% GDP increase
  },

  // ── National baseline ─────────────────────────────────────────────────────
  national: {
    population: 1380,
    gdp_per_capita: 2389,
    hdi: 0.633,
    employment_rate: 0.495,
    literacy_rate: 0.744,
    poverty_rate: 0.228,
    gini: 0.356,
    fiscal_deficit_pct: 5.9,  // % of GDP
  },

  regions: {
    North:     ['HR','HP','PB','RJ','UK','UP'],
    South:     ['AP','KA','KL','TN','TG'],
    East:      ['BR','JH','OR','WB'],
    West:      ['GA','GJ','MH'],
    Central:   ['CT','MP'],
    Northeast: ['AR','AS','MN','ML','MZ','NL','SK','TR'],
  },
};

function getState(id) { return INDIA_DATA.states.find(s => s.id === id); }
function nationalAvg(metric) {
  const states = INDIA_DATA.states;
  return states.reduce((acc, s) => acc + (s.b[metric] || 0), 0) / states.length;
}
