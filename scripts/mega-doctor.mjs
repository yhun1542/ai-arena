#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const TIMEOUT = 8000;

const has = (cmd) => {
  try { execSync(`${cmd} --version`, { stdio: 'ignore' }); return true; } catch { return false; }
};

const mask = (s='') => s.length <= 8 ? '∎'.repeat(s.length) : s.slice(0,4)+'…'+s.slice(-4);

const fetchJson = async (url, opt={}) => {
  const ctl = new AbortController();
  const id = setTimeout(()=>ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...opt, signal: ctl.signal });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = { raw:text } }
    return { ok: res.ok, status: res.status, data: json };
  } finally { clearTimeout(id); }
};

const pullVercelEnv = () => {
  if (!has('vercel')) return {};
  try {
    spawnSync('vercel', ['pull','--environment','production','--yes'], { stdio:'ignore' });
  } catch {}
  const p = '.vercel/.env.production.local';
  if (!existsSync(p)) return {};
  const lines = readFileSync(p, 'utf8').split('\n');
  const out = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g,'');
  }
  return out;
};

const envFromVercel = pullVercelEnv();
const env = { ...envFromVercel, ...process.env };

// ---- Tests ----
async function testOpenAI(key) {
  if (!key) return { vendor:'OpenAI', ok:false, note:'OPENAI_API_KEY 누락' };
  const r = await fetchJson('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  const ok = r.ok;
  return {
    vendor:'OpenAI',
    ok,
    status:r.status,
    modelHint: ok ? (r.data.data?.find(m => m.id.includes('gpt-4'))?.id ?? 'N/A') : null,
    doc:'https://platform.openai.com/docs/api-reference'
  };
}

async function testGemini(key) {
  if (!key) return { vendor:'Gemini', ok:false, note:'GOOGLE_API_KEY 누락' };
  // list models: GET /v1beta/models?key=...
  const r = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const ok = r.ok;
  return {
    vendor:'Gemini',
    ok,
    status:r.status,
    modelHint: ok ? (r.data.models?.[0]?.name ?? 'N/A') : null,
    doc:'https://ai.google.dev/api/generate-content'
  };
}

async function testAnthropic(key) {
  if (!key) return { vendor:'Anthropic', ok:false, note:'ANTHROPIC_API_KEY 누락' };
  const r = await fetchJson('https://api.anthropic.com/v1/models', {
    headers: { 'x-api-key': key, 'anthropic-version':'2023-06-01' }
  });
  const ok = r.ok;
  const first = r?.data?.data?.[0]?.id;
  return {
    vendor:'Anthropic', ok, status:r.status, modelHint: first ?? 'N/A',
    doc:'https://docs.anthropic.com/en/api/models-list'
  };
}

async function testXAI(key) {
  if (!key) return { vendor:'xAI', ok:false, note:'XAI_API_KEY 누락' };
  const r = await fetchJson('https://api.x.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  return { vendor:'xAI', ok:r.ok, status:r.status, modelHint: r?.data?.data?.[0]?.id ?? 'N/A', doc:'https://docs.x.ai/docs/api-reference' };
}

async function testMistral(key) {
  if (!key) return { vendor:'Mistral', ok:false, note:'MISTRAL_API_KEY 누락' };
  const r = await fetchJson('https://api.mistral.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  return { vendor:'Mistral', ok:r.ok, status:r.status, modelHint: r?.data?.data?.[0]?.id ?? 'N/A', doc:'https://docs.mistral.ai/api/' };
}

async function testCohere(key) {
  if (!key) return { vendor:'Cohere', ok:false, note:'COHERE_API_KEY 누락' };
  const r = await fetchJson('https://api.cohere.com/v1/models', {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  return { vendor:'Cohere', ok:r.ok, status:r.status, modelHint: r?.data?.models?.[0]?.name ?? 'N/A', doc:'https://docs.cohere.com/reference/chat' };
}

async function testPerplexity(key) {
  if (!key) return { vendor:'Perplexity', ok:false, note:'PPLX_API_KEY 누락' };
  // lightweight probe with model list는 없어 chat-completions 400/200로만 확인
  const r = await fetchJson('https://api.perplexity.ai/chat/completions', {
    method:'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ model: 'sonar', messages:[{role:'user', content:'ping'}], max_tokens:4 })
  });
  return { vendor:'Perplexity', ok:r.ok || r.status===400, status:r.status, modelHint:'sonar*', doc:'https://docs.perplexity.ai/api-reference/chat-completions-post' };
}

async function testGroq(key) {
  if (!key) return { vendor:'Groq', ok:false, note:'GROQ_API_KEY 누락(LLAMA 대행사)' };
  const r = await fetchJson('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  return { vendor:'Groq(Llama)', ok:r.ok, status:r.status, modelHint: r?.data?.data?.find?.(m=>m.id.includes('llama'))?.id ?? 'N/A', doc:'https://console.groq.com/docs/models' };
}

(async () => {
  const keys = {
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    GOOGLE_API_KEY: env.GOOGLE_API_KEY,
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
    XAI_API_KEY: env.XAI_API_KEY,
    MISTRAL_API_KEY: env.MISTRAL_API_KEY,
    COHERE_API_KEY: env.COHERE_API_KEY,
    PPLX_API_KEY: env.PPLX_API_KEY,
    GROQ_API_KEY: env.GROQ_API_KEY,
  };

  console.log('\n[ENV] 필수 키 존재 여부(마스킹):');
  Object.entries(keys).forEach(([k,v]) => console.log(` - ${k}: ${v ? mask(v): '미설정'}`));

  console.log('\n[API] 벤더별 연결/권한/모델 점검:');
  const results = await Promise.all([
    testOpenAI(keys.OPENAI_API_KEY),
    testGemini(keys.GOOGLE_API_KEY),
    testAnthropic(keys.ANTHROPIC_API_KEY),
    testXAI(keys.XAI_API_KEY),
    testMistral(keys.MISTRAL_API_KEY),
    testCohere(keys.COHERE_API_KEY),
    testPerplexity(keys.PPLX_API_KEY),
    testGroq(keys.GROQ_API_KEY),
  ]);

  for (const r of results) {
    const line = r.ok
      ? `✅ ${r.vendor} OK  (status=${r.status||'n/a'}, modelHint=${r.modelHint||'n/a'})`
      : `❌ ${r.vendor} FAIL (${r.note||('status='+r.status)})`;
    console.log(line + (r.doc ? `  [docs] ${r.doc}` : ''));
  }

  console.log('\n끝. 문제가 있는 벤더는 [키/권한/엔드포인트/모델명] 순서로 교정하세요.');
})();
