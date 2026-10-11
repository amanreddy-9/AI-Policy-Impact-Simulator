const { execFileSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const pythonBin = path.join(rootDir, '.venv/bin/python');

const PYTHON_EVAL_SCRIPT = `
import sys, json, asyncio, warnings
warnings.filterwarnings('ignore')
from backend.retrieval.pipeline_orchestrator import pipeline_orchestrator

async def main():
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input else {}
        query_text = (payload.get('description', '').strip() or payload.get('policy_name') or 'National Welfare Policy').strip()
        scheme_id = payload.get('scheme_id') or (payload.get('policy_name', '').lower() if payload.get('mode') == 'existing' else None)
        
        result = await pipeline_orchestrator.execute_full_pipeline(
            user_policy_query=query_text,
            categories=payload.get('categories', []),
            levers=payload.get('levers', {}),
            selected_scheme_id=scheme_id
        )
        
        output = {
            'success': True,
            'status': 'success',
            'scheme_provenance': result.get('scheme_provenance', {}),
            'rl_predictions': result.get('rl_predictions', {}),
            'simulation': result.get('simulation', {}),
            'proofs': result.get('proofs', {}),
            'ai_guidance': result.get('ai_guidance', {}),
            'budget_calculation': result.get('budget_calculation'),
            'report': result.get('report'),
            'metrics': result.get('metrics', []),
            'scenarios': result.get('scenarios', {}),
            'evidence': result.get('evidence_used', []),
            'approved_domains': result.get('approved_domains_used', []),
            'methodology': result.get('methodology', ''),
            'source_strategy': result.get('source_strategy', '')
        }
        sys.stdout.write('__JSON_START__' + json.dumps(output) + '__JSON_END__')
    except Exception as e:
        err_out = {'success': False, 'error': str(e)}
        sys.stdout.write('__JSON_START__' + json.dumps(err_out) + '__JSON_END__')

if __name__ == '__main__':
    asyncio.run(main())
`;

function evaluatePolicyViaPython(payload) {
  try {
    const stdout = execFileSync(pythonBin, ['-c', PYTHON_EVAL_SCRIPT], {
      input: JSON.stringify(payload),
      cwd: rootDir,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      timeout: 90000
    });

    const startIdx = stdout.indexOf('__JSON_START__');
    const endIdx = stdout.indexOf('__JSON_END__');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = stdout.substring(startIdx + '__JSON_START__'.length, endIdx);
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.success && parsed.simulation) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Direct Python execution error:', err.message);
  }
  return null;
}

module.exports = {
  evaluatePolicyViaPython
};
