/**
 * knowledge_graph.js — v2 (Proposal-aligned)
 * Static knowledge graph: entities, relations, policy levers.
 * Entities now include: schemes, occupations, income bands, social categories.
 * Policy levers aligned with proposal: MSP, PM-KISAN, MGNREGA days, GST.
 */

const KNOWLEDGE_GRAPH = {

  nodes: [
    // ── Policy Levers (aligned with proposal §7.4 actions) ─────────────────
    { id:'mgnrega_days', type:'policy',  label:'MGNREGA Days\nGuaranteed',    icon:'🛠️', desc:'Days of employment guaranteed per household per year under MGNREGA' },
    { id:'msp_hike',     type:'policy',  label:'MSP Increase\n(% above cost)', icon:'🌾', desc:'Minimum Support Price increase above cost of production for kharif/rabi crops' },
    { id:'pmkisan',      type:'policy',  label:'PM-KISAN\nTransfer Amount',   icon:'🧑‍🌾', desc:'Direct income support to small/marginal farmer families (₹k/yr)' },
    { id:'gst_rate',     type:'policy',  label:'GST Effective\nRate (%)',      icon:'📦', desc:'Weighted average effective GST rate across consumption basket' },
    { id:'health_pct',   type:'policy',  label:'Healthcare\nBudget (% GDP)',  icon:'🏥', desc:'Public health expenditure as % of GDP' },
    { id:'edu_pct',      type:'policy',  label:'Education\nBudget (% GDP)',   icon:'📚', desc:'Education allocation as % of GDP' },

    // ── Socioeconomic Outcomes ──────────────────────────────────────────────
    { id:'income',      type:'outcome', label:'Disposable\nIncome',     icon:'💰', desc:'Household disposable income per capita (₹/year)' },
    { id:'employment',  type:'outcome', label:'Employment\nRate',       icon:'👷', desc:'Worker population ratio (WPR)' },
    { id:'consumption', type:'outcome', label:'Consumption\nExpenditure',icon:'🛒', desc:'Monthly per-capita consumption expenditure' },
    { id:'health_acc',  type:'outcome', label:'Healthcare\nAccess',     icon:'💊', desc:'% population with adequate healthcare access' },
    { id:'literacy',    type:'outcome', label:'Literacy\nRate',         icon:'✏️', desc:'Adult literacy rate' },
    { id:'hdi',         type:'outcome', label:'HDI Score',              icon:'📊', desc:'Human Development Index composite score' },
    { id:'poverty',     type:'outcome', label:'Poverty Rate\n(Headcount)',icon:'📉', desc:'% population below poverty line' },
    { id:'gini',        type:'outcome', label:'Gini\nCoefficient',      icon:'⚖️', desc:'Income inequality measure' },

    // ── Indian Schemes & Programmes (scheme entities) ───────────────────────
    { id:'mgnrega_scheme', type:'scheme', label:'MGNREGA\nScheme',     icon:'🔨', desc:'Mahatma Gandhi National Rural Employment Guarantee Act' },
    { id:'pmgsy',          type:'scheme', label:'PMGSY\n(Rural Roads)', icon:'🛤️', desc:'Pradhan Mantri Gram Sadak Yojana — rural connectivity' },
    { id:'pmjay',          type:'scheme', label:'PM-JAY\n(Ayushman)',   icon:'🏥', desc:'Pradhan Mantri Jan Arogya Yojana — health insurance' },
    { id:'midday_meal',    type:'scheme', label:'Mid-Day\nMeal Scheme', icon:'🍱', desc:'School nutrition programme' },
    { id:'pds',            type:'scheme', label:'PDS / NFSA\nFood Security',icon:'🌾', desc:'Public Distribution System under National Food Security Act' },

    // ── Occupational Groups (Census/NSSO categories) ────────────────────────
    { id:'occ_small_farmers', type:'occupation', label:'Small/Marginal\nFarmers',   icon:'👨‍🌾', desc:'Farmers with <2 ha landholding — 41% of workforce' },
    { id:'occ_agri_labour',   type:'occupation', label:'Agricultural\nLabourers',   icon:'⛏️',  desc:'Wage labourers in agriculture — 21% of workforce' },
    { id:'occ_daily_wage',    type:'occupation', label:'Daily Wage\nWorkers',       icon:'🧱', desc:'Urban casual daily wage workers — 14% of workforce' },
    { id:'occ_formal',        type:'occupation', label:'Formal Sector\nWorkers',    icon:'💼', desc:'Salaried employees in organised sector — 8% of workforce' },
    { id:'occ_self_rural',    type:'occupation', label:'Self-Employed\n(Rural)',    icon:'🏪', desc:'Rural non-farm self-employed — 11% of workforce' },

    // ── Social Categories ────────────────────────────────────────────────────
    { id:'cat_sc',    type:'context', label:'Scheduled\nCastes (SC)',   icon:'🤝', desc:'SC population — 16.6% of India' },
    { id:'cat_st',    type:'context', label:'Scheduled\nTribes (ST)',   icon:'🌿', desc:'ST population — 8.6% of India' },
    { id:'cat_women', type:'context', label:'Women\n& Girls',           icon:'👩', desc:'Female population — 48.2%' },

    // ── Data Sources ─────────────────────────────────────────────────────────
    { id:'census',    type:'data', label:'Census of\nIndia 2011/21',   icon:'📋', desc:'Decennial Census data' },
    { id:'nsso_plfs', type:'data', label:'NSSO / PLFS\nSurveys',       icon:'📊', desc:'Periodic Labour Force Survey, National Sample Survey' },
    { id:'nfhs',      type:'data', label:'NFHS-5\n(2019-21)',          icon:'🏥', desc:'National Family Health Survey' },
    { id:'secc',      type:'data', label:'SECC\n2011',                 icon:'🏘️', desc:'Socio-Economic and Caste Census' },

    // ── Engines ──────────────────────────────────────────────────────────────
    { id:'causal_engine', type:'engine', label:'Causal Inference\nEngine', icon:'⚙️', desc:'DiD / PSM / Causal Forests via DoWhy/EconML' },
    { id:'sim_engine',    type:'engine', label:'Monte Carlo\nSimulation',  icon:'🎲', desc:'100K statistical agents, no LLM per round' },
    { id:'rl_engine',     type:'engine', label:'RL Policy\nOptimizer (PPO)',icon:'🤖', desc:'Proximal Policy Optimization — Stable-Baselines3 style' },
    { id:'kg_builder',    type:'engine', label:'GraphRAG\nKG Builder',     icon:'🧠', desc:'One-time LLM-based entity/relation extraction into graph' },
  ],

  edges: [
    // ── Policy → Outcome causal links ──────────────────────────────────────
    { from:'mgnrega_days', to:'employment',  weight:0.72, label:'↑ WPR',       color:'#00d4ff' },
    { from:'mgnrega_days', to:'income',      weight:0.48, label:'↑ wages',      color:'#00d4ff' },
    { from:'mgnrega_days', to:'poverty',     weight:-0.52,label:'↓ poverty',    color:'#00d4ff' },
    { from:'mgnrega_days', to:'gini',        weight:-0.22,label:'↓ gini',       color:'#00d4ff' },

    { from:'msp_hike',     to:'income',      weight:0.58, label:'↑ farm income',color:'#f59e0b' },
    { from:'msp_hike',     to:'employment',  weight:0.24, label:'↑ agri emp.',  color:'#f59e0b' },
    { from:'msp_hike',     to:'poverty',     weight:-0.36,label:'↓ rural pov.', color:'#f59e0b' },
    { from:'msp_hike',     to:'gini',        weight:0.04, label:'⚠ slight ↑',  color:'#f59e0b' },

    { from:'pmkisan',      to:'income',      weight:0.42, label:'↑ income',     color:'#10b981' },
    { from:'pmkisan',      to:'poverty',     weight:-0.48,label:'↓ poverty',    color:'#10b981' },
    { from:'pmkisan',      to:'health_acc',  weight:0.22, label:'↑ health',     color:'#10b981' },
    { from:'pmkisan',      to:'gini',        weight:-0.18,label:'↓ gini',       color:'#10b981' },

    { from:'gst_rate',     to:'income',      weight:-0.38,label:'↓ disposable', color:'#ef4444' },
    { from:'gst_rate',     to:'employment',  weight:-0.22,label:'↓ SME emp.',   color:'#ef4444' },
    { from:'gst_rate',     to:'poverty',     weight:0.28, label:'↑ poverty',    color:'#ef4444' },
    { from:'gst_rate',     to:'gini',        weight:0.12, label:'↑ inequality', color:'#ef4444' },

    { from:'health_pct',   to:'health_acc',  weight:0.75, label:'↑ access',    color:'#8b5cf6' },
    { from:'health_pct',   to:'hdi',         weight:0.40, label:'↑ HDI',       color:'#8b5cf6' },
    { from:'health_pct',   to:'poverty',     weight:-0.16,label:'↓ poverty',   color:'#8b5cf6' },

    { from:'edu_pct',      to:'literacy',    weight:0.65, label:'↑ literacy',  color:'#3b82f6' },
    { from:'edu_pct',      to:'employment',  weight:0.36, label:'↑ employ.',   color:'#3b82f6' },
    { from:'edu_pct',      to:'income',      weight:0.48, label:'↑ earnings',  color:'#3b82f6' },
    { from:'edu_pct',      to:'hdi',         weight:0.50, label:'↑ HDI',       color:'#3b82f6' },
    { from:'edu_pct',      to:'gini',        weight:-0.26,label:'↓ inequality',color:'#3b82f6' },

    // ── Outcome interactions ───────────────────────────────────────────────
    { from:'employment',  to:'income',      weight:0.55, label:'→ income',    color:'rgba(255,255,255,0.15)' },
    { from:'income',      to:'hdi',         weight:0.40, label:'→ HDI',       color:'rgba(255,255,255,0.15)' },
    { from:'literacy',    to:'employment',  weight:0.32, label:'→ employ.',   color:'rgba(255,255,255,0.15)' },
    { from:'poverty',     to:'gini',        weight:0.48, label:'→ gini',      color:'rgba(255,255,255,0.15)' },
    { from:'health_acc',  to:'hdi',         weight:0.35, label:'→ HDI',       color:'rgba(255,255,255,0.15)' },
    { from:'consumption', to:'hdi',         weight:0.28, label:'→ HDI',       color:'rgba(255,255,255,0.15)' },

    // ── Data → Engine ────────────────────────────────────────────────────
    { from:'census',    to:'kg_builder',    weight:1.0, label:'ingest', color:'rgba(255,255,255,0.1)' },
    { from:'nsso_plfs', to:'kg_builder',    weight:1.0, label:'ingest', color:'rgba(255,255,255,0.1)' },
    { from:'nfhs',      to:'kg_builder',    weight:1.0, label:'ingest', color:'rgba(255,255,255,0.1)' },
    { from:'secc',      to:'kg_builder',    weight:1.0, label:'ingest', color:'rgba(255,255,255,0.1)' },
    { from:'kg_builder',to:'causal_engine', weight:1.0, label:'segments', color:'#8b5cf6' },
    { from:'causal_engine',to:'sim_engine', weight:1.0, label:'effects', color:'#8b5cf6' },
    { from:'sim_engine',   to:'rl_engine',  weight:1.0, label:'env',    color:'#00d4ff' },
  ],

  // ── Policy Lever UI configuration (updated for proposal) ─────────────────
  levers: [
    { id:'mgnrega_days', label:'MGNREGA Days Guaranteed', unit:'days/yr', min:50,  max:365, step:5,   defaultVal:100, color:'#00d4ff', icon:'🛠️',
      fiscalCost: 1200, fiscalUnit:'₹ cr/day', helpText:'100 days = current guarantee; 365 = full-year guarantee' },
    { id:'msp_hike',     label:'MSP Increase',            unit:'% above cost', min:0, max:50, step:1, defaultVal:5,   color:'#f59e0b', icon:'🌾',
      fiscalCost: 4500, fiscalUnit:'₹ cr/1%', helpText:'Current: 50% above A2+FL cost for kharif (announced 2018)' },
    { id:'pmkisan',      label:'PM-KISAN Transfer',       unit:'₹k/yr',  min:6,   max:24,  step:1,   defaultVal:6,   color:'#10b981', icon:'🧑‍🌾',
      fiscalCost: 8800, fiscalUnit:'₹ cr/₹1k', helpText:'Current: ₹6,000/yr to ~110M farmer families' },
    { id:'gst_rate',     label:'GST Effective Rate',      unit:'%',       min:5,   max:28,  step:1,   defaultVal:14,  color:'#ec4899', icon:'📦',
      fiscalCost: -6500, fiscalUnit:'₹ cr/1%', helpText:'Lower = less regressive burden; current weighted avg ~14%', inverse:true },
    { id:'health_pct',   label:'Healthcare Budget',       unit:'% GDP',   min:0.5, max:5.0, step:0.1, defaultVal:1.8, color:'#8b5cf6', icon:'🏥',
      fiscalCost: 15000, fiscalUnit:'₹ cr/0.1% GDP', helpText:'India current: ~1.8% GDP; WHO recommends ≥5%' },
    { id:'edu_pct',      label:'Education Budget',        unit:'% GDP',   min:1.0, max:8.0, step:0.1, defaultVal:3.2, color:'#3b82f6', icon:'📚',
      fiscalCost: 18000, fiscalUnit:'₹ cr/0.1% GDP', helpText:'NEP 2020 target: 6% of GDP; current ~3.2%' },
  ],

  objectives: [
    { id:'inequality', label:'Minimize Inequality',      icon:'⚖️', desc:'Minimize Gini coefficient — maximize outcomes of worst-off subgroup (Rawlsian)' },
    { id:'employment', label:'Maximize Employment',      icon:'👷', desc:'Maximize Worker Population Ratio — prioritise job creation' },
    { id:'hdi',        label:'Maximize HDI',             icon:'📈', desc:'Composite Human Development Index — education + health + income' },
    { id:'poverty',    label:'Minimize Poverty',         icon:'🌱', desc:'Minimize headcount poverty ratio — prioritise poorest quintile' },
    { id:'farmers',    label:'Maximize Farmer Welfare',  icon:'🌾', desc:'Maximize disposable income for small/marginal farmers specifically' },
  ],
};
