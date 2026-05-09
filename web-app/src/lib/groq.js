// groq.js — Fast text inference via Groq LPU
// Model: llama-3.1-8b-instant = 840 tok/s, ~1-2s responses, free tier
// Used for: all text simplification (Simplify + Explain buttons)
// NOT used for: images (Groq has no vision) — those go to Gemma 4
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

export async function callGroq({ apiKey, system, prompt }) {
  if (!apiKey) throw new Error('No Groq API key. Add it in Settings → Groq Key.');

  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1024,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(GROQ_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `Groq error ${res.status}`;
      if (res.status === 429) throw new Error('Groq rate limit hit. Wait a moment.');
      if (res.status === 401) throw new Error('Groq API key invalid. Check console.groq.com');
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq.');
    return text.trim();

  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Groq timed out. Try again.');
    throw e;
  }
}

export async function checkGroq(apiKey) {
  if (!apiKey) return { ok: false, error: 'No Groq API key' };
  try {
    await callGroq({ apiKey, system: 'Reply with one word only.', prompt: 'ready' });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
