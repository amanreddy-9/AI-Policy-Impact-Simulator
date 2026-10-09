const express = require('express');
const cors = require('cors');
const path = require('path');
const { POLICY_CATEGORIES } = require('./policyCategories');
const { checkOllamaStatus, generateSliders, evaluatePolicy, optimizeLevers } = require('./ollamaService');

const app = express();
const PORT = process.env.PORT || 3001;
const FASTAPI_URL = process.env.FASTAPI_TARGET || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ─── API ROUTES ───

// 1. GET /api/status - Check Ollama connectivity & available models
app.get('/api/status', async (req, res) => {
  try {
    const status = await checkOllamaStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// 2. GET /api/categories - Return all policy categories (with sectoral budget & ministry data)
app.get('/api/categories', (req, res) => {
  // Return categories with basic info (without full lever details for lightweight listing)
  const categories = POLICY_CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    name_hi: c.name_hi,
    name_ta: c.name_ta,
    icon: c.icon,
    description: c.description,
    ministry: c.ministry,
    ministry_hi: c.ministry_hi,
    ministry_ta: c.ministry_ta,
    budget: c.budget,
    budget_num: c.budget_num,
    budget_source: c.budget_source
  }));
  res.json({ success: true, categories });
});

// 3. POST /api/policy/generate-sliders - Generate dynamic sliders
// Body: { categories: ['water-reforms', 'agriculture'], existingSchemeId: null }
app.post('/api/policy/generate-sliders', async (req, res) => {
  try {
    const { categories, existingSchemeId } = req.body;
    
    // First try to get levers from our predefined category data
    if (categories && categories.length > 0) {
      const selectedCats = POLICY_CATEGORIES.filter(c => categories.includes(c.id));
      if (selectedCats.length > 0) {
        // Combine levers from selected categories
        let combinedLevers = [];
        selectedCats.forEach(cat => {
          if (cat.relatedLevers) {
            combinedLevers.push(...cat.relatedLevers.map(l => ({
              ...l,
              categoryId: cat.id,
              categoryName: cat.name,
              categoryMinistry: cat.ministry,
              categoryBudget: cat.budget
            })));
          }
        });
        
        // If we have predefined levers, use them directly (fast path)
        if (combinedLevers.length > 0) {
          return res.json({ success: true, levers: combinedLevers, source: 'predefined' });
        }
      }
    }
    
    // Fallback: ask LLM to generate sliders
    const result = await generateSliders(categories, existingSchemeId);
    res.json({ success: true, ...result, source: 'llm' });
  } catch (err) {
    console.error('Generate sliders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/policy/evaluate - Run Evidence-Based Policy Impact Analysis
// Body: { mode, policy_name, description, categories, levers, language }
app.post('/api/policy/evaluate', async (req, res) => {
  try {
    const { mode, policy_name, description, categories, levers, language } = req.body;

    // 1. Delegate to Python FastAPI Evidence & Retrieval Engine (Port 8000)
    try {
      const fastApiRes = await fetch(`${FASTAPI_URL}/api/policy/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          policy_name,
          description,
          categories,
          levers,
          language: language || 'en'
        }),
        signal: AbortSignal.timeout(120000)
      });

      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        if (data.success && data.simulation) {
          return res.json(data);
        }
      }
    } catch (fastApiErr) {
      console.warn('FastAPI evidence pipeline unavailable, using direct Ollama service:', fastApiErr.message);
    }

    // 2. Direct Ollama Service Fallback
    const result = await evaluatePolicy({
      mode,
      policyName: policy_name,
      description,
      categories,
      levers,
      language: language || 'en'
    });
    res.json({
      success: true,
      simulation: result.simulation,
      ai_guidance: result.ai_guidance,
      budget_calculation: result.budget_calculation,
      report: result.report
    });
  } catch (err) {
    console.error('Policy evaluation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/policy/optimize - LLM-powered lever optimization
app.post('/api/policy/optimize', async (req, res) => {
  try {
    const { current_levers, categories, objective } = req.body;
    const result = await optimizeLevers(current_levers, categories);
    res.json({ success: true, optimal_levers: result });
  } catch (err) {
    console.error('Optimization error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Forward /api/pipeline requests to Python FastAPI Retrieval Engine (Port 8000)
app.all('/api/pipeline*', async (req, res) => {
  try {
    const targetUrl = `${FASTAPI_URL}${req.originalUrl}`;
    const options = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }
    const apiRes = await fetch(targetUrl, options);
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('FastAPI pipeline forwarding error:', err.message);
    res.status(502).json({ success: false, error: 'FastAPI Evidence Pipeline service unreachable: ' + err.message });
  }
});

// Catch-all: serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 AI Policy Impact Simulator Server running on http://localhost:${PORT}`);
  console.log(`📡 Checking Ollama connectivity...`);
  checkOllamaStatus()
    .then(status => {
      if (status.running) {
        console.log(`✅ Ollama connected! Models: ${status.models?.join(', ') || 'none'}`);
      } else {
        console.log(`⚠️  Ollama not detected. Start with: ollama serve`);
      }
    })
    .catch(() => console.log(`⚠️  Ollama not running. Start with: ollama serve`));
});
