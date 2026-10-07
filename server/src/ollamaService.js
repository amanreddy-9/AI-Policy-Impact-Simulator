let cachedModel = process.env.OLLAMA_MODEL || null;
const OLLAMA_BASE_URL = 'http://localhost:11434';

async function getModelName() {
  if (cachedModel) return cachedModel;
  try {
    const res = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/tags`, {}, 3000);
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map(m => m.name || m.model);
      if (models.includes('mistral:7b')) return (cachedModel = 'mistral:7b');
      if (models.includes('mistral')) return (cachedModel = 'mistral');
      if (models.includes('llama3.2:3b')) return (cachedModel = 'llama3.2:3b');
      if (models.length > 0) return (cachedModel = models[0]);
    }
  } catch (_) {}
  return (cachedModel = 'mistral:7b');
}

function parseJSON(text) {
  try {
    if (!text || typeof text !== 'string') return text;
    // Strip markdown codeblocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(candidate);
  } catch (error) {
    // Attempt fallback slice between first '{' and last '}'
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
    } catch (_) {}
    console.error('Failed to parse JSON response:', text);
    throw new Error('Failed to parse LLM response as valid JSON');
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 60000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function checkOllamaStatus() {
  try {
    console.log('Checking Ollama status...');
    const res = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/tags`, {}, 5000);
    if (!res.ok) throw new Error(`Ollama API error: ${res.statusText}`);
    const data = await res.json();
    const modelNames = (data.models || []).map(m => m.name || m.model);
    console.log('Ollama is running with models:', modelNames);
    return { running: true, models: modelNames };
  } catch (err) {
    console.error('Ollama status check failed:', err.message);
    return { running: false, error: err.message };
  }
}

async function generateSliders(categories, existingSchemeId = null) {
  console.log('Generating sliders for:', { categories, existingSchemeId });
  const prompt = `You are an expert Indian policy advisor at NITI Aayog. 
Based on the following categories: ${categories ? categories.join(', ') : 'none'} and scheme ID: ${existingSchemeId || 'none'}, generate 6-10 contextually relevant policy levers/sliders.
Consider India's socioeconomic landscape, welfare programs, and administrative structures.

Return ONLY a JSON object with this exact structure, nothing else:
{
  "levers": [
    {
      "id": "lever_id_string",
      "name": "English Name",
      "name_hi": "Hindi Name",
      "name_ta": "Tamil Name",
      "icon": "emoji",
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": 50,
      "unit": " unit string",
      "unit_hi": " hindi unit string",
      "unit_ta": " tamil unit string",
      "prefix": "",
      "description": "English description",
      "description_hi": "Hindi description",
      "description_ta": "Tamil description"
    }
  ]
}`;

  const model = await getModelName();
  const res = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json'
    })
  }, 60000);

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  console.log('Sliders generated successfully');
  return parseJSON(data.response);
}

async function evaluatePolicy({ mode, policyName, description, categories, levers, language }) {
  console.log('Evaluating policy:', policyName);
  
  const leverSummary = Object.entries(levers || {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  
  const prompt = `You are a senior policy analyst at NITI Aayog (National Institution for Transforming India) with 20+ years of experience analyzing Indian welfare policies. You have deep expertise in India's socioeconomic landscape:
- India has 1.44 billion people, ~65% rural population
- 22% below poverty line (~270 million people)
- Annual Union Budget ~₹45 Lakh Crore
- Key challenges: income inequality, caste disparities (SC 16.6%, ST 8.6%, OBC 41%), gender gap, child malnutrition (35.5% stunting), farmer distress

TASK: Analyze the following policy configuration and provide a comprehensive impact assessment.

Policy Name: ${policyName}
Mode: ${mode}
Description: ${description || 'Not provided'}
Categories: ${categories?.join(', ') || 'General welfare'}
Language preference: ${language}

Policy Lever Settings:
${leverSummary}

Based on these lever values, analyze the real-world impact considering India's administrative capacity, fiscal space, state-level variations, and implementation challenges.

Return ONLY a valid JSON object (no explanation, no markdown) with this EXACT structure:
{
  "simulation": {
    "effectiveness_score": <number 0-100, based on lever alignment and policy design quality>,
    "fiscal_cost_lakh_cr": <number, estimated annual cost in Lakh Crore INR>,
    "sustainability_score": <number 0-100, fiscal sustainability over 5 years>,
    "beneficiary_group": "<string describing primary target beneficiaries>"
  },
  "ai_guidance": {
    "executive_verdict": "<2-3 sentence executive summary of policy impact, be specific about which levers drive impact>",
    "fiscal_and_regional_risks": "<2-3 sentences about fiscal risks, regional implementation challenges, and mitigation strategies>",
    "strategic_recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
  },
  "sectoral": {
    "gender": { "women": <% income lift>, "men": <% income lift>, "female_participation_boost_pct": <% boost> },
    "caste": { "SC": <% welfare gain>, "ST": <% welfare gain>, "OBC": <% welfare gain>, "General": <% welfare gain> },
    "children_family": {
      "child_malnutrition_reduction_pct": <% reduction>,
      "school_retention_increase_pct": <% increase>,
      "family_welfare_index": <score 0-100>
    }
  }
}`;

  const model = await getModelName();
  const res = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json'
    })
  }, 120000);

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  console.log('Policy evaluation completed');
  const parsed = parseJSON(data.response);
  
  // Ensure proper structure regardless of LLM output format
  let rawFiscal = parsed.simulation?.fiscal_cost_lakh_cr ?? parsed.fiscal_cost_lakh_cr ?? 1.5;
  if (typeof rawFiscal === 'string') rawFiscal = parseFloat(rawFiscal.replace(/[^0-9.]/g, '')) || 1.5;
  // If LLM returned in Crores instead of Lakh Crores (e.g., > 1000)
  if (rawFiscal > 1000) rawFiscal = Number((rawFiscal / 100000).toFixed(2));
  else if (rawFiscal > 100) rawFiscal = Number((rawFiscal / 100).toFixed(2));
  else rawFiscal = Number(Number(rawFiscal).toFixed(2));

  let rawEff = parsed.simulation?.effectiveness_score ?? parsed.effectiveness_score ?? 72;
  if (typeof rawEff === 'string') rawEff = parseFloat(rawEff.replace(/[^0-9.]/g, '')) || 72;
  rawEff = Math.min(100, Math.max(0, Number(Number(rawEff).toFixed(1))));

  let rawSust = parsed.simulation?.sustainability_score ?? parsed.sustainability_score ?? 70;
  if (typeof rawSust === 'string') rawSust = parseFloat(rawSust.replace(/[^0-9.]/g, '')) || 70;
  rawSust = Math.min(100, Math.max(0, Number(Number(rawSust).toFixed(1))));

  return {
    simulation: {
      effectiveness_score: rawEff,
      fiscal_cost_lakh_cr: rawFiscal,
      sustainability_score: rawSust,
      beneficiary_group: parsed.simulation?.beneficiary_group ?? parsed.beneficiary_group ?? 'Vulnerable Households',
      sectoral: parsed.sectoral ?? parsed.simulation?.sectoral ?? {
        gender: { women: 12, men: 9, female_participation_boost_pct: 5 },
        caste: { SC: 18, ST: 20, OBC: 12, General: 7 },
        children_family: { child_malnutrition_reduction_pct: 10, school_retention_increase_pct: 7, family_welfare_index: 70 }
      }
    },
    ai_guidance: parsed.ai_guidance ?? {
      executive_verdict: 'Policy evaluation completed. The configured levers show notable potential for welfare improvement.',
      fiscal_and_regional_risks: 'Standard fiscal sustainability considerations apply. Continuous monitoring recommended.',
      strategic_recommendations: ['Phase implementation across aspirational districts', 'Use JAM trinity for DBT', 'Establish grievance redressal mechanisms']
    }
  };
}

async function optimizeLevers(currentLevers, categories) {
  console.log('Optimizing levers...');
  const prompt = `You are an expert Indian policy advisor at NITI Aayog.
Given the current policy levers and categories: ${categories?.join(', ')}, suggest optimal values that maximize welfare within realistic fiscal constraints in India.
Current Levers: ${JSON.stringify(currentLevers, null, 2)}

Return ONLY a JSON object representing the optimized lever values, where keys are lever IDs and values are the new optimal numbers.
Example: { "water_daily_supply": 60, "subsidy_amount": 1200 }`;

  const model = await getModelName();
  const res = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json'
    })
  }, 60000);

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  console.log('Levers optimized successfully');
  return parseJSON(data.response);
}

module.exports = {
  checkOllamaStatus,
  generateSliders,
  evaluatePolicy,
  optimizeLevers
};
