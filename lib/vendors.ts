// lib/vendors.ts - AI 벤더 호출 래퍼

export async function callOpenAI(apiKey: string, prompt: string, model = 'gpt-4o'): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7
      }
    })
  });
  
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function callAnthropic(apiKey: string, prompt: string, modelId?: string): Promise<string> {
  // 가급적 최신 모델 ID 자동 해석: /v1/models에서 sonnet 우선 채택
  let model = modelId;
  if (!model) {
    try {
      const list = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
      });
      const data = await list.json();
      model = data?.data?.find?.((m: any) => String(m.id).includes('sonnet'))?.id || 'claude-3-5-sonnet-20241022';
    } catch {
      model = 'claude-3-5-sonnet-20241022';
    }
  }
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ 
      model, 
      max_tokens: 512, 
      messages: [{ role: 'user', content: prompt }] 
    })
  });
  
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.content?.[0]?.text ?? '';
}

export async function callGrok(xaiKey: string, prompt: string, model = 'grok-2-1212'): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${xaiKey}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      model, 
      messages: [{ role: 'user', content: prompt }], 
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`xAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function callMistral(apiKey: string, prompt: string, model = 'mistral-large-latest'): Promise<string> {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function callCohere(apiKey: string, prompt: string, model = 'command-r-plus-08-2024'): Promise<string> {
  const res = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`Cohere ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.message?.content?.[0]?.text ?? '';
}

export async function callPerplexity(apiKey: string, prompt: string, model = 'llama-3.1-sonar-large-128k-online'): Promise<string> {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      model, 
      messages: [{ role: 'user', content: prompt }], 
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`Perplexity ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function callGroq(apiKey: string, prompt: string, model = 'llama-3.3-70b-versatile'): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7
    })
  });
  
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}
