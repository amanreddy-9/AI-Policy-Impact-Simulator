# AI Policy Impact Simulator — Complete Master Technical & Operational Documentation

> **System Classification**: Production-Grade Evidence-Based Public Policy Impact Simulator & Optimization Platform  
> **Jurisdiction / Context**: Union Government of India (Union Budget 2024–25 & NITI Aayog Governance Framework)  
> **Document Version**: 2.5.0 (Publication & Officer-Reviewed Benchmark)  
> **Date**: October 2026  

---

## Table of Contents

1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Who Is Benefited? (Target Stakeholders & Use Cases)](#2-who-is-benefited-target-stakeholders--use-cases)
3. [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
4. [Complete Project Structure](#4-complete-project-structure)
5. [Deterministic Mathematical Budget Engine & Econometric Proofs](#5-deterministic-mathematical-budget-engine--econometric-proofs)
   - [Official Baseline Allocations (Union Budget 2024–25)](#official-baseline-allocations-union-budget-202425)
   - [The 9 Core Sectors & 90 Calibrated Levers](#the-9-core-sectors--90-calibrated-levers)
   - [Mathematical Governing Formulas](#mathematical-governing-formulas)
   - [Policy Effectiveness Score Derivation](#policy-effectiveness-score-derivation)
   - [5-Year Fiscal Sustainability Rating Derivation](#5-year-fiscal-sustainability-rating-derivation)
   - [Demographic & Sectoral Elasticity Equations](#demographic--sectoral-elasticity-equations)
6. [AI Intelligence Layer: Groq 120-Billion Parameter Engine](#6-ai-intelligence-layer-groq-120-billion-parameter-engine)
   - [Multi-Tier Model Architecture](#multi-tier-model-architecture)
   - [Prompt Engineering & Officer Persona](#prompt-engineering--officer-persona)
   - [JSON Resilience & Auto-Repair Engine](#json-resilience--auto-repair-engine)
7. [The 11-Section Publication-Grade Policy Assessment Report](#7-the-11-section-publication-grade-policy-assessment-report)
8. [User Interface (UI/UX) & Interactive Walkthrough](#8-user-interface-uiux--interactive-walkthrough)
   - [Custom Policy Maker vs. Existing Central Schemes](#custom-policy-maker-vs-existing-central-schemes)
   - [Real-Time Interactive Slider Controls](#real-time-interactive-slider-controls)
   - [Clickable KPI & Demographic Proof Modals](#clickable-kpi--demographic-proof-modals)
   - [One-Click Detailed Report Download](#one-click-detailed-report-download)
9. [Under-the-Hood Mechanisms & End-to-End Data Flow](#9-under-the-hood-mechanisms--end-to-end-data-flow)
10. [Setup, Deployment, and Operational Runbook](#10-setup-deployment-and-operational-runbook)

---

## 1. Executive Summary & Purpose

The **AI Policy Impact Simulator** is an enterprise-grade computational platform designed to evaluate, stress-test, and forecast the socio-economic and macroeconomic impacts of policy interventions and budget realignments across India. 

### The Problem It Solves
Traditional public policy formulation in emerging economies often suffers from two opposing failure modes:
1. **Opaque Spreadsheet Models**: Deterministic models that lack qualitative, institutional, and administrative depth. They cannot explain *why* an intervention succeeds or fails in aspirational districts.
2. **Hallucinatory GenAI Tools**: Generative AI models that generate persuasive, plausible-sounding prose but invent budget numbers, fail basic arithmetic, and cite phantom government statistics.

### The Solution: Hybrid Neuro-Symbolic Governance
The AI Policy Impact Simulator merges **two mutually reinforcing layers**:
- **Symbolic Deterministic Math Core**: A verified, zero-rounding-error Python & JavaScript budget calculation engine anchored directly to official **Union Budget 2024–25 Demands for Grants**.
- **Neural Reasoning Engine (Groq 120B)**: The ultra-high-capacity `openai/gpt-oss-120b` reasoning model operating as a *Principal Policy Secretary to NITI Aayog*, conducting multi-paragraph administrative appraisals, fiscal deficit stress tests, and plain-language public verdicts.

---

## 2. Who Is Benefited? (Target Stakeholders & Use Cases)

| Stakeholder Group | Primary Use Case | Concrete Benefit |
| :--- | :--- | :--- |
| **Union & State Policy Makers** (NITI Aayog, MoF, Line Ministries) | Pre-legislative scrutiny, pre-budget stakeholder consultations, Cabinet notes. | Instantly simulate capital injection vs. revenue reduction trade-offs within statutory FRBM 3% GDP deficit limits. |
| **Civil Servants & District Magistrates** (IAS / State Services) | Implementation planning and SNA expenditure tracking. | Anticipate Single Nodal Agency (SNA) liquidity friction, state absorption capacity gaps, and sub-district delivery hurdles. |
| **Economic Think Tanks & Academics** (CPR, ICRIER, NIPFP, IGIDR) | Empirical policy research and econometrics. | Access verifiable elasticities, demographic distributions (SC/ST/OBC/Women), and math proofs with zero hallucinations. |
| **Journalists & Policy Analysts** | Scrutiny of Union Budget announcements and manifesto promises. | Cut through political rhetoric with plain-language verdicts explaining whether a reform is truly good or bad for common citizens. |
| **Citizens & Students** | Democratic literacy and civic education. | Interactive sliders in English, Hindi, and Tamil illustrate how national budgets directly impact drinking water, schools, and hospitals. |

---

## 3. System Architecture & Technology Stack

The application employs a decoupled, micro-service-aligned architecture guaranteeing that high-performance mathematical modeling runs synchronously while intensive online AI reasoning operates asynchronously.

```mermaid
flowchart TD
    subgraph Frontend["React 18 + Vite (Client Tier)"]
        UI["Interactive UI / SimulatorPage.jsx"]
        Sliders["90 Sector Levers (-50% to +100%)"]
        LiveCalc["Client Memoized Budget Engine"]
        Modals["Interactive Proof Modals"]
        Export["Markdown Report Downloader"]
    end

    subgraph Server["Express.js Proxy Tier (Port 3001)"]
        ExpRouter["Express API Router"]
        StaticServe["Production Static Asset Server"]
        Fallback["Ollama Local Fallback Service"]
    end

    subgraph Backend["FastAPI Scientific Engine (Port 8000)"]
        Orchestrator["Pipeline Orchestrator"]
        MathEngine["Python Budget Engine & Metric Computer"]
        Retriever["Local Education RAG (docs/) & Web Harvester"]
        OnlineAnalyst["Online Policy Analyst (Groq 120B / Gemini)"]
    end

    UI -->|Adjust Levers| LiveCalc
    UI -->|Click 'Analyze'| ExpRouter
    ExpRouter -->|Proxy Request| Orchestrator
    Orchestrator --> MathEngine
    Orchestrator --> Retriever
    MathEngine -->|Deterministic Results| OnlineAnalyst
    OnlineAnalyst -->|HTTPS Live API| Groq["Groq Cloud (openai/gpt-oss-120b)"]
    OnlineAnalyst -->|HTTPS Live API| Gemini["Google Gemini 2.0 / 2.5 Flash"]
    OnlineAnalyst -->|Synthesis JSON| Orchestrator
    Orchestrator -->|Enriched Payload + Proofs| ExpRouter
    ExpRouter --> UI
    UI --> Modals
    UI --> Export
```

### Technology Matrix

| Layer | Technologies / Frameworks | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, Lucide React, Chart.js, Vanilla CSS | Interactive glassmorphism dashboard, reactive SVG state map, dynamic sliders. |
| **Proxy & Gateway** | Node.js (v18+), Express.js, CORS | Reverse proxy, static file server, API gateway. |
| **Scientific Backend** | Python 3.10+, FastAPI, Uvicorn, NumPy | Deterministic econometric modeling, mathematical proof generation, REST endpoints. |
| **Evidence Retrieval** | PyMuPDF (Fitz), BeautifulSoup4, httpx | Local document parsing (`docs/`), live government website scraping (`gov.in`). |
| **Online LLM Engine** | Groq Cloud API (`openai/gpt-oss-120b`), Google Gemini Flash | 120-Billion parameter reasoning model delivering 11-section policy dossiers. |
| **Local LLM Fallback**| Ollama (`llama3.1:8b`) | Offline air-gapped execution capability. |

---

## 4. Complete Project Structure

```text
AI_Policy_Impact_Simulator_Complete/
│
├── backend/                              # Python FastAPI Scientific & AI Engine (Port 8000)
│   ├── api/                              # REST API Route Controllers
│   │   ├── simulation.py                 # Core simulation endpoints
│   │   ├── causal.py                     # DoWhy/Causal ML inference routes
│   │   ├── rl.py                         # Reinforcement Learning policy optimization
│   │   ├── graph.py                      # NetworkX policy spillover graph routes
│   │   ├── llm_policy.py                 # Evidence pipeline evaluation controller
│   │   └── evidence_pipeline.py          # Evidence ingestion & search endpoints
│   │
│   ├── simulation/                       # Deterministic Mathematical Engines
│   │   ├── budget_engine.py              # Mathematical Budget Engine (B_new = B_base * (1 + Δ/100))
│   │   ├── metric_computer.py            # Publication-grade metrics, elasticities, and math proofs
│   │   ├── causal_engine.py              # Causal DAGs and confounding adjustments
│   │   └── policy_similarity.py          # Vector embedding policy similarity matcher
│   │
│   ├── retrieval/                        # Grounded Evidence & LLM Reasoning
│   │   ├── online_analyst.py             # Groq 120B / Gemini multi-tier analyst with JSON auto-repair
│   │   ├── pipeline_orchestrator.py      # Dual-strategy pipeline coordinator (Education vs Web)
│   │   ├── education_retriever.py        # Local knowledge base RAG for AIPolicySimulator/docs/
│   │   ├── web_retriever.py              # Dynamic web crawler targeting approved *.gov.in domains
│   │   ├── pdf_processor.py              # High-throughput PDF parser and tabular data extractor
│   │   └── llama_engine.py               # Local Llama 3.1 8B inference engine
│   │
│   └── main.py                           # FastAPI application entrypoint & middleware configuration
│
├── frontend/                             # React 18 Single Page Application
│   ├── src/
│   │   ├── components/                   # Modular UI Components
│   │   │   ├── common/                   # Reusable buttons, cards, headers, theme toggles
│   │   │   └── simulator/                # Charts, StateGridMap, EvidencePipelinePanel
│   │   │
│   │   ├── pages/
│   │   │   ├── SimulatorPage.jsx         # Primary Simulation Studio, slider controls, proof modals
│   │   │   ├── DashboardPage.jsx         # Executive macro-level indicators overview
│   │   │   ├── CausalAnalysisPage.jsx    # DoWhy directed acyclic graph inspection
│   │   │   └── EvidenceExplorerPage.jsx  # Traceable evidence & source citation explorer
│   │   │
│   │   ├── data/
│   │   │   ├── schemesData.js            # Existing Central Schemes baselines (MGNREGA, PM-KISAN)
│   │   │   └── statesData.js             # 36 States/UTs socio-economic profiles
│   │   │
│   │   ├── App.jsx                       # Root routing & state provider
│   │   └── main.jsx                      # Vite React bootstrapping
│   │
│   ├── package.json                      # Frontend dependencies
│   └── vite.config.js                    # Vite bundler build config
│
├── server/                               # Node.js Express Gateway & Server (Port 3001)
│   ├── src/
│   │   ├── index.js                      # Express gateway, proxy to FastAPI, Ollama fallback
│   │   ├── policyCategories.js           # 35 policy category master definitions & 10 levers each
│   │   └── ollamaService.js              # Ollama API client & prompt builder
│   │
│   ├── public/                           # Production compiled frontend bundle (Vite dist)
│   └── package.json                      # Node gateway dependencies
│
├── docs/                                 # Education Sector Local Grounding Repository
│   ├── UDISE_Plus_2023_Report.pdf        # Unified District Information System for Education
│   ├── PM_POSHAN_Annual_Review.pdf       # Mid-Day Meal scheme expenditure & outcomes
│   ├── Samagra_Shiksha_PAB_Minutes.pdf   # State-wise allocation schedules
│   └── NAS_National_Achievement_Survey.csv # Learning outcome baseline datasets
│
├── .env                                  # Environment credentials (GROQ_API_KEY, PORT)
└── MASTER_DOCUMENTATION.md               # This authoritative manual
```

---

## 5. Deterministic Mathematical Budget Engine & Econometric Proofs

### Official Baseline Allocations (Union Budget 2024–25)

Every policy lever in the simulator is calibrated against official statutory appropriations from the **Union Budget 2024–25 Demands for Grants** presented to the Parliament of India:

| # | Policy Category | Responsible Ministry / Statement | Baseline Budget (₹ Crore) |
| :-: | :--- | :--- | :-: |
| **1** | **Water Reforms 💧** | Ministry of Jal Shakti | **₹94,808 Cr** |
| **2** | **Agriculture & Farming 🌾** | Ministry of Agriculture & Farmers Welfare | **₹1,40,529 Cr** |
| **3** | **Education 🎓** | Ministry of Education | **₹1,39,289 Cr** |
| **4** | **Healthcare 🏥** | Ministry of Health & Family Welfare | **₹1,06,530 Cr** |
| **5** | **Housing & Urban Development 🏙️** | Ministry of Housing & Urban Affairs | **₹85,522 Cr** |
| **6** | **Women Empowerment 👩** | Gender Budget Statement (Part A + B) | **₹5,01,000 Cr** |
| **7** | **Rural Development 🚜** | Department of Rural Development | **₹1,97,023 Cr** |
| **8** | **Energy & Power ⚡** | Power + New & Renewable Energy (MNRE) | **₹62,912 Cr** |
| **9** | **Transport & Logistics 🚆** | MoRTH + Indian Railways combined | **₹5,91,252 Cr** |

---

### The 9 Core Sectors & 90 Calibrated Levers

At the default neutral position (**0% Change**), each lever corresponds to its validated baseline expenditure:

#### 1. Water Reforms 💧 (Total: ₹94,808 Cr)
1. Water Infrastructure & Project Construction Funding: ₹11,377 Cr
2. Potable Drinking Water Supply Budget (Jal Jeevan Mission): ₹13,273 Cr
3. Rural Household Water Connections (FHTC): ₹11,377 Cr
4. Agricultural Irrigation Water Budget (PMKSY): ₹11,377 Cr
5. Groundwater Recharge & Aquifer Restoration: ₹7,585 Cr
6. River Cleaning & Pollution Control (Namami Gange): ₹9,481 Cr
7. Dam, Reservoir & Water Storage Development: ₹7,585 Cr
8. Wastewater Treatment & Water Recycling: ₹7,585 Cr
9. Rainwater Harvesting & Watershed Development: ₹7,585 Cr
10. Water Conservation, Leak Detection & Smart Metering: ₹7,583 Cr

#### 2. Agriculture & Farming 🌾 (Total: ₹1,40,529 Cr)
1. Farmer Subsidies & Direct Financial Assistance (PM-KISAN): ₹25,295 Cr
2. Irrigation Infrastructure & Micro-Irrigation: ₹16,863 Cr
3. Fertilizer Subsidies: ₹28,106 Cr
4. Agricultural Electricity Subsidies: ₹11,242 Cr
5. Minimum Support Price (MSP) & Procurement Support: ₹16,863 Cr
6. Crop Insurance & Disaster Compensation (PMFBY): ₹14,053 Cr
7. Agricultural Research & Improved Seeds (ICAR): ₹8,432 Cr
8. Farm Mechanization & Equipment Subsidies: ₹7,026 Cr
9. Agricultural Storage, Cold Chains & Warehousing: ₹7,026 Cr
10. Farmer Training, Extension Services & Digital Agriculture: ₹5,623 Cr

#### 3. Education 🎓 (Total: ₹1,39,289 Cr)
1. Per-Student School Funding: ₹16,715 Cr
2. Teacher Recruitment & Training: ₹27,858 Cr
3. School Infrastructure & Construction: ₹20,893 Cr
4. Digital Classrooms & Internet Connectivity: ₹11,143 Cr
5. Scholarships for Economically Disadvantaged Students: ₹13,929 Cr
6. Mid-Day Meals / PM POSHAN Funding: ₹13,929 Cr
7. Foundational Literacy & Numeracy Programmes (NIPUN): ₹11,143 Cr
8. Higher Education & University Grants (UGC/RUSA): ₹13,929 Cr
9. Girls' Education & Gender-Equity Programmes: ₹5,572 Cr
10. Vocational Training, Skill Development & Employability: ₹4,178 Cr

#### 4. Healthcare 🏥 (Total: ₹1,06,530 Cr)
1. Primary Healthcare & Health Centres (Ayushman Arogya Mandir): ₹15,980 Cr
2. Government Hospital Infrastructure: ₹15,980 Cr
3. Doctor, Nurse & Healthcare Worker Recruitment: ₹21,306 Cr
4. Essential Medicines & Medical Supplies: ₹12,784 Cr
5. Public Health Insurance & Treatment Coverage (PM-JAY): ₹15,980 Cr
6. Maternal & Reproductive Healthcare: ₹6,392 Cr
7. Child Healthcare & Immunisation (Mission Indradhanush): ₹5,326 Cr
8. Disease Prevention & Epidemiological Surveillance: ₹4,261 Cr
9. Mental Healthcare Services: ₹3,196 Cr
10. Medical Research, Diagnostics & Health Technology (ICMR): ₹5,325 Cr

#### 5. Housing & Urban Development 🏙️ (Total: ₹85,522 Cr)
1. Affordable Housing Construction (PMAY-Urban): ₹25,657 Cr
2. Urban Slum Redevelopment: ₹12,828 Cr
3. Urban Water Supply & Sanitation (AMRUT 2.0): ₹12,828 Cr
4. Sewage Treatment & Drainage Systems: ₹8,552 Cr
5. Urban Roads & Street Infrastructure: ₹6,842 Cr
6. Public Transport & Urban Mobility (Metro Rail): ₹8,552 Cr
7. Affordable Rental Housing: ₹3,421 Cr
8. Smart City & Digital Urban Infrastructure: ₹2,566 Cr
9. Urban Green Spaces & Environmental Management: ₹2,138 Cr
10. Municipal Governance & Capacity Building: ₹2,138 Cr

#### 6. Women Empowerment 👩 (Total: ₹5,01,000 Cr)
1. Women's Livelihood & Self-Help Group (SHG) Financing: ₹1,00,200 Cr
2. Maternal Health, Nutrition & Childcare Support: ₹75,150 Cr
3. Girls' Education, Higher Study & STEM Incentives: ₹75,150 Cr
4. Direct Cash Transfers to Vulnerable Women: ₹60,120 Cr
5. Women's Safety, Crisis Shelters & Legal Aid (Mission Shakti): ₹35,070 Cr
6. Rural Women's Water, Sanitation & Clean Fuel (Ujjwala): ₹45,090 Cr
7. Women Entrepreneurship Subsidies & Micro-Credit: ₹35,070 Cr
8. Working Women's Hostels & Child Daycare Creches: ₹25,050 Cr
9. Skill Development & Vocational Training for Women: ₹25,050 Cr
10. Gender-Responsive Budgeting & Administrative Units: ₹25,050 Cr

#### 7. Rural Development 🚜 (Total: ₹1,97,023 Cr)
1. Rural Employment Guarantee (MGNREGA): ₹86,000 Cr
2. Rural Roads Construction & Maintenance (PMGSY): ₹19,000 Cr
3. Rural Housing Construction (PMAY-Gramin): ₹54,500 Cr
4. National Rural Livelihood Mission (NRLM): ₹15,047 Cr
5. Watershed Development & Soil Conservation: ₹5,000 Cr
6. Panchayati Raj & Village Administrative Infrastructure: ₹4,000 Cr
7. Rural Digital Connectivity & Common Service Centres: ₹3,500 Cr
8. Drinking Water & Sanitation in Gram Panchayats: ₹4,000 Cr
9. Rural Electrification & Off-Grid Solar: ₹3,000 Cr
10. Skill Development & Placement for Rural Youth (DDU-GKY): ₹2,976 Cr

#### 8. Energy & Power ⚡ (Total: ₹62,912 Cr)
1. Solar Power Infrastructure & Subsidies (PM Surya Ghar): ₹18,000 Cr
2. Wind & Marine Renewable Energy Projects: ₹6,000 Cr
3. Transmission Grid Expansion & Modernization: ₹12,000 Cr
4. Power Distribution Company (DISCOM) Reform Subsidies: ₹10,912 Cr
5. Thermal Power Emission Control & Efficiency Upgrades: ₹4,000 Cr
6. Energy Storage, Battery Infrastructure & Pumped Hydro: ₹4,000 Cr
7. Rural Electrification & Last-Mile Power Reliability: ₹3,000 Cr
8. Green Hydrogen Mission Funding: ₹2,000 Cr
9. Energy Efficiency Programmes & Smart Metering: ₹1,500 Cr
10. Nuclear & Alternative Clean Energy Research: ₹1,500 Cr

#### 9. Transport & Logistics 🚆 (Total: ₹5,91,252 Cr)
1. National Highway Construction (NHAI/MoRTH): ₹2,72,241 Cr
2. Railway Track Expansion & Doubling: ₹95,000 Cr
3. Railway Electrification & Green Energy Transition: ₹25,000 Cr
4. Vande Bharat, Rolling Stock & Passenger Modernization: ₹45,000 Cr
5. Railway Safety, Signaling & Kavach Anti-Collision: ₹35,000 Cr
6. Port Connectivity & Sagarmala Maritime Projects: ₹25,000 Cr
7. Inland Waterways Development (Jal Marg Vikas): ₹10,000 Cr
8. Logistics Parks, Freight Corridors & Multimodal Hubs: ₹45,000 Cr
9. Rural-to-Urban Transport Connectivity: ₹24,011 Cr
10. Electric Vehicle Infrastructure & Public Transport Subsidies: ₹15,000 Cr

---

### Mathematical Governing Formulas

#### 1. Individual Lever Allocation
For any policy lever $i$ with statutory baseline budget $B_{\text{baseline}, i}$ and percentage adjustment $\Delta_i \in [-50\%, +100\%]$:
$$B_{\text{proposed}, i} = B_{\text{baseline}, i} \times \left(1 + \frac{\Delta_i}{100}\right)$$
$$\Delta B_i = B_{\text{proposed}, i} - B_{\text{baseline}, i} = B_{\text{baseline}, i} \times \left(\frac{\Delta_i}{100}\right)$$

#### 2. Sectoral & Macro Fiscal Aggregations
- **Total Sector Baseline**:
  $$B_{\text{total, base}} = \sum_{i=1}^{N} B_{\text{baseline}, i}$$
- **Total Proposed Outlay**:
  $$B_{\text{total, proposed}} = \sum_{i=1}^{N} B_{\text{proposed}, i}$$
- **Net Fiscal Impact**:
  $$\Delta B_{\text{net}} = B_{\text{total, proposed}} - B_{\text{total, base}} = \sum_{i=1}^{N} \Delta B_i$$
- **Net Percentage Change**:
  $$\Delta\%_{\text{net}} = \left(\frac{\Delta B_{\text{net}}}{B_{\text{total, base}}}\right) \times 100$$
- **Gross Capital Injections (Expenditure Expansions)**:
  $$\sum \Delta B^{+} = \sum_{i: \Delta_i > 0} |\Delta B_i|$$
- **Gross Program Rationalizations (Expenditure Reductions)**:
  $$\sum \Delta B^{-} = \sum_{i: \Delta_i < 0} |\Delta B_i|$$

#### 3. Outlay Conversion to ₹ Lakh Crore
Since $1\text{ Lakh Crore} = 100,000\text{ Crore}$:
$$\text{Total Fiscal Outlay (₹ Lakh Cr)} = \frac{B_{\text{total, proposed}}}{100,000}$$
> **Design Note**: The total proposed treasury commitment is strictly non-negative ($B_{\text{proposed}} > 0$). Negative artifacts from net delta confusion have been permanently eliminated.

---

### Policy Effectiveness Score Derivation

The **Policy Effectiveness Score** ($S_{\text{eff}} \in [0, 100]$) is computed using a diminishing marginal returns function calibrated to historical public asset multipliers:

$$S_{\text{eff}} = \text{Clamp}\left(72.0 + 3.8 \sqrt{\text{Gross Inc \%}} - 4.2 \sqrt{\text{Gross Red \%}} + \text{Bonus}_{\text{synergy}}, \ 45.0, \ 96.0\right)$$

Where:
- **Baseline Score ($72.0$)**: Historical baseline execution efficacy across Central Line Ministries.
- **$\text{Gross Inc \%}$**: $\left(\frac{\sum \Delta B^{+}}{B_{\text{total, base}}}\right) \times 100$. The square-root function ($\sqrt{\cdot}$) accounts for diminishing marginal productivity of capital.
- **$\text{Gross Red \%}$**: $\left(\frac{\sum \Delta B^{-}}{B_{\text{total, base}}}\right) \times 100$. The higher coefficient ($4.2$) reflects the asymmetrical welfare damage of budgetary cuts to vulnerable frontline services.
- **$\text{Bonus}_{\text{synergy}}$**: $\min\left(4.0, \ K_{\text{changed}} \times 0.6\right)$, where $K_{\text{changed}}$ is the number of active levers adjusted, rewarding holistic multi-lever interventions over isolated spending.

---

### 5-Year Fiscal Sustainability Rating Derivation

The **Sustainability Rating** ($S_{\text{sust}} \in [0, 100\%]$) measures treasury solvency under the **Fiscal Responsibility and Budget Management (FRBM) Act**:

$$\text{If } \Delta\%_{\text{net}} \ge 0: \quad S_{\text{sust}} = \text{Clamp}\left(88.0 - \left(0.42 \times \Delta\%_{\text{net}} + 0.05 \times \text{Gross Inc \%}\right), \ 40.0, \ 97.0\right)$$
$$\text{If } \Delta\%_{\text{net}} < 0: \quad S_{\text{sust}} = \text{Clamp}\left(88.0 + \left(0.25 \times |\Delta\%_{\text{net}}|\right), \ 40.0, \ 97.0\right)$$

Where:
- **$88.0\%$**: Medium-Term Expenditure Framework (MTEF) baseline anchor.
- **$0.42 \times \Delta\%_{\text{net}}$**: Sovereign bond market borrowing friction and debt servicing pressure.
- **$0.05 \times \text{Gross Inc \%}$**: State-level Single Nodal Agency (SNA) administrative absorption drag.
- **$0.25 \times |\Delta\%_{\text{net}}|$**: Fiscal consolidation dividend resulting from deficit reduction.

---

### Demographic & Sectoral Elasticity Equations

Every sector defines empirical econometric elasticities grounded in Census 2011, PLFS (Periodic Labour Force Survey), and NFHS-5 data:

$$\text{Lift}_{\text{demographic}} = \text{Base Lift} \times \left[1 + \left(\frac{\Delta\%_{\text{net}}}{100}\right) \times \epsilon_{\text{sector}}\right]$$

#### Sector Elasticity Matrix ($\epsilon$)

| Sector | Gender ($\epsilon_W, \epsilon_M$) | SC / ST ($\epsilon_{\text{SC}}, \epsilon_{\text{ST}}$) | Child Malnutrition ($\epsilon_{\text{mal}}$) | Primary Beneficiaries |
| :--- | :---: | :---: | :---: | :--- |
| **Water Reforms** | $1.15 \times, 0.95 \times$ | $1.25 \times, 1.40 \times$ | $0.90 \times$ | Small & Marginal Farmers, Rural Households |
| **Agriculture** | $0.90 \times, 1.20 \times$ | $1.20 \times, 1.35 \times$ | $1.10 \times$ | Smallholders (<2 Ha), Tenant Cultivators |
| **Education** | $1.30 \times, 1.00 \times$ | $1.35 \times, 1.45 \times$ | $1.25 \times$ | Govt School Students (Grades 1-12), Rural Girls |
| **Healthcare** | $1.35 \times, 0.90 \times$ | $1.30 \times, 1.40 \times$ | $1.50 \times$ | Low-Income Families, Expectant Mothers |
| **Housing & Urban** | $1.10 \times, 1.00 \times$ | $1.20 \times, 1.15 \times$ | $0.70 \times$ | Urban Slum Dwellers, Migrant Informal Workers |
| **Women Emp.** | $1.85 \times, 0.40 \times$ | $1.40 \times, 1.50 \times$ | $1.40 \times$ | Self-Help Group (SHG) Women, Rural Artisans |
| **Rural Dev.** | $1.20 \times, 1.10 \times$ | $1.35 \times, 1.45 \times$ | $1.15 \times$ | Landless Agrarian Laborers, MGNREGA Workers |
| **Energy & Power** | $0.95 \times, 1.10 \times$ | $1.10 \times, 1.20 \times$ | $0.60 \times$ | Agrarian Pump Owners, Small MSME Enterprises |
| **Transport** | $0.80 \times, 1.25 \times$ | $1.10 \times, 1.15 \times$ | $0.50 \times$ | Daily Commuters, Small Cargo Operators |

---

## 6. AI Intelligence Layer: Groq 120-Billion Parameter Engine

### Multi-Tier Model Architecture

```mermaid
flowchart LR
    Request["Synthesize Policy Dossier Request"] --> Tier1{"Tier 1: Google Gemini Flash"}
    Tier1 -->|Search Grounded Success| ReturnGemini["Return Live-Grounded Report"]
    Tier1 -->|Key Unavailable / Fail| Tier2{"Tier 2: Groq 120B Engine"}
    Tier2 -->|Live Reasoning (15-20s)| ReturnGroq["Return Groq 120B Officer Dossier"]
    Tier2 -->|Rate Limit / Offline| Tier3["Tier 3: NITI Aayog Expert Benchmark"]
```

1. **Tier 1 — Google Gemini 2.0 / 2.5 Flash**: Equipped with native Google Search Grounding to extract live web citations and parliamentary debates.
2. **Tier 2 — Groq High-Capacity Engine (`openai/gpt-oss-120b`)**: The primary workhorse. A 120-Billion parameter model operating at lightning speed, delivering deep bureaucratic prose in 15–20 seconds.
3. **Tier 3 — Expert Benchmark Engine**: An air-gapped deterministic fallback providing zero-downtime availability.

### Prompt Engineering & Officer Persona
The system prompt places the model in the persona of a **Principal Policy Secretary & Joint Secretary to NITI Aayog**:
- Enforces strict mathematical invariance (never modify Python numbers).
- Injects Indian institutional realities: Single Nodal Agency (SNA) accounts, PFMS fund flow, CSS 60:40 state sharing ratios, and FRBM deficit glide paths.
- Enforces 100–150 words per key to produce a comprehensive dossier without triggering API output token truncation.

### JSON Resilience & Auto-Repair Engine
To guarantee zero parsing crashes from online LLMs, `_get_clean_json()` implements a four-stage recovery pipeline:
1. Direct `json.loads(text)`.
2. Markdown code block extraction (` ```json ... ``` `).
3. First-to-last curly brace matching (`text[start:end+1]`).
4. **Smart Truncated JSON Repair (`_repair_truncated_json`)**:
   - Analyzes unclosed quotation marks and closes open strings.
   - Maintains a bracket stack (`{`, `[`) and pushes balancing closing brackets in reverse order.
   - Cleans trailing commas (`,\s*}`) using regular expressions.

---

## 7. The 11-Section Publication-Grade Policy Assessment Report

Every analysis automatically synthesizes an 11-section policy whitepaper:

| Section | Title | Content Description |
| :---: | :--- | :--- |
| **Section J** | **Plain-Language Sector Verdict** | Honest, everyday explanation in simple words of whether the reforms are good or bad, whether more or less budget was given, and what it directly means for a common citizen, farmer, student, or mother. |
| **Section A** | **Executive Summary** | 3-paragraph strategic briefing for the Union Cabinet on macroeconomic intent, outlay shifts, target cohorts, and structural viability. |
| **Section B** | **Deterministic Budget Realignment** | Verifiable table listing every lever, baseline budget, percentage adjustment, proposed allocation, and net difference in ₹ Crore. |
| **Section K** | **Detailed Mathematical Computations** | Complete algebraic and arithmetic derivations: $B_{\text{new}} = B_{\text{base}}(1 + \Delta/100)$, Gross Increases ($\sum \Delta B^{+}$), Gross Reductions ($\sum \Delta B^{-}$), and Net Treasury Differential. |
| **Section C** | **Sector-Wise Impact Analysis** | Inter-sectoral spillovers (e.g. how irrigation funding impacts agricultural yield and rural healthcare morbidity). |
| **Section D** | **Potential Benefits & Welfare Lift** | Quantifiable welfare gains, disposable income lifts, and demographic equity improvements across vulnerable groups. |
| **Section E** | **Drawbacks & Unintended Consequences**| Critical analysis of delivery bottlenecks, state absorption capacity, SNA liquidity friction, and vendor inflation. |
| **Section F** | **Fiscal & Tax Implications** | Macroeconomic analysis under FRBM Act glide paths, G-Sec bond market borrowing limits, and tax buoyancy requirements. |
| **Section G** | **Evidence Base & Traceable Sources** | Grounded citations from official government portals (`indiabudget.gov.in`, `niti.gov.in`, `rbi.org.in`). |
| **Section H** | **Confidence & Model Limitations** | Appraisal of data recency, sub-district state implementation variance, and econometric modeling constraints. |
| **Section I** | **Final Assessment & Roadmap** | Institutional verdict (*Potentially beneficial* / *Mixed trade-offs*) paired with a 3-phase rollout roadmap (Phase 1: 0–6 mo, Phase 2: 6–24 mo, Phase 3: 24–60 mo). |

---

## 8. User Interface (UI/UX) & Interactive Walkthrough

### Custom Policy Maker vs. Existing Central Schemes
- **Custom Policy Maker**: Select any of the 9 core sectors, dynamically load the 10 calibrated levers, and tweak allocations from -50% to +100%.
- **Existing Schemes**: Load audited statutory baselines for national schemes such as **MGNREGA**, **PM-KISAN**, **PM POSHAN**, or **Ayushman Bharat**.

### Real-Time Interactive Slider Controls
- Real-time client-side calculation cards update on every slider movement:
  - Total Baseline Budget (₹ Cr)
  - Proposed Outlay (₹ Cr)
  - Net Adjustment (+₹ Cr / -₹ Cr)
  - Adjusted Lever Count

### Clickable KPI & Demographic Proof Modals
Every major card in the simulator is **interactive and clickable**:

```text
┌─────────────────────────────────┐   Click Card   ┌──────────────────────────────────────────────┐
│  POLICY EFFECTIVENESS SCORE     │ ─────────────> │       MATHEMATICAL DERIVATION PROOF MODAL    │
│            73.8 / 100           │                │ Formula: Base(72) + 3.8*√Inc - 4.2*√Red + Bon│
│  🔍 Click for Math Proof        │                │ Variables: Gross Inc: +₹1,706 Cr (+1.80%)   │
└─────────────────────────────────┘                │ Calculation: 72 + 5.09 - 4.20 + 1.20 = 73.8  │
                                                   └──────────────────────────────────────────────┘
```

1. **Policy Effectiveness Score Card** $\rightarrow$ Mathematical derivation proof modal.
2. **Total Fiscal Outlay Card** $\rightarrow$ Treasury outlay formula proof modal.
3. **5-Yr Sustainability Score Card** $\rightarrow$ FRBM deficit feasibility proof modal.
4. **Primary Beneficiaries Card** $\rightarrow$ Groq-powered sectoral welfare impact appraisal modal.
5. **Gender Equity Impact Card** $\rightarrow$ Econometric female participation elasticity proof modal.
6. **Social Cohort Gains Card** $\rightarrow$ SC/ST/OBC demographic weighting proof modal.
7. **Child Malnutrition & Family Welfare Card** $\rightarrow$ NFHS-5 malnutrition reduction derivation modal.

### One-Click Detailed Report Download
Clicking the prominent green button:
```text
📥 Download Detailed Policy Report
```
Instantly compiles all simulation parameters, the Section B budget table, Sections A through K, demographic breakdowns, and verifiable citations into a formatted `.md` file downloaded directly to the user's browser.

---

## 9. Under-the-Hood Mechanisms & End-to-End Data Flow

```text
[User adjusts slider in UI]
       │
       ▼
1. Live Client Calculation (useMemo) updates instant outlay cards
       │
       ▼ [User clicks "Analyze Policy Impact"]
2. POST /api/policy/evaluate sent to Express Gateway (Port 3001)
       │
       ▼
3. Express proxies payload to FastAPI Retrieval Engine (Port 8000)
       │
       ▼
4. PipelineOrchestrator receives request:
   ├── Calls budget_engine.py: computes exact rupee baselines, proposed outlays, and net shifts
   ├── Calls metric_computer.py: computes effectiveness, sustainability, demographic lifts, and proofs
   └── Calls education_retriever.py (if Education) OR web_retriever.py (other sectors)
       │
       ▼
5. online_analyst.py builds authoritative officer prompt
       │
       ▼
6. HTTPS POST sent to Groq Cloud (openai/gpt-oss-120b)
   ├── Model reasons for 15-20 seconds with deep bureaucratic nuance
   └── Returns structured policy evaluation
       │
       ▼
7. _get_clean_json() parses output (auto-repairing any truncated tokens)
       │
       ▼
8. Metric proofs + Groq dossier packaged into final JSON response
       │
       ▼
9. Express relays response to React frontend
       │
       ▼
10. SimulatorPage.jsx renders:
    ├── Updated KPI Cards with verified scores
    ├── Interactive Clickable Proof Modals
    ├── Section B Deterministic Reallocation Table
    ├── Section J Plain-Language Citizen Verdict
    └── Section K Detailed Mathematical Derivations
```

---

## 10. Setup, Deployment, and Operational Runbook

### Prerequisites
- Node.js (v18.0.0 or higher) & npm
- Python (3.10, 3.11, or 3.12)
- Groq Cloud API Key (`GROQ_API_KEY`)

### Environment Setup (`.env`)
Create a `.env` file in the project root:
```env
PORT=3001
FASTAPI_URL=http://127.0.0.1:8000
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_MODEL=llama3.1:8b
```

### Installation Steps

1. **Install Gateway Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

2. **Install Frontend Dependencies & Build**:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
   *(The build step automatically deploys the production bundle to `server/public`)*

3. **Install Python Scientific Dependencies**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install fastapi uvicorn httpx python-dotenv pymupdf beautifulsoup4 numpy pydantic
   ```

### Running the Platform

1. **Start FastAPI Scientific Engine (Port 8000)**:
   ```bash
   source .venv/bin/activate
   uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

2. **Start Express Gateway Server (Port 3001)**:
   ```bash
   cd server
   node src/index.js
   ```

3. **Access the Application**:
   Open your browser and navigate to:
   ```text
   http://localhost:3001
   ```

---

*Authored by the AI Policy Simulation Research Group. Grounded in Government of India Statutory Datasets & NITI Aayog Governance Benchmarks.*
