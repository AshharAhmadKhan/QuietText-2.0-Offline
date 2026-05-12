// gemini.js — Gemini API for text, vision, and PDF processing
// thinkingLevel: "MINIMAL" — only valid values are MINIMAL and HIGH
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const GEMINI_MODELS = {
  PRIMARY: 'gemini-2.5-flash',      // Fast text processing (1.78s avg)
  VISION:  'gemma-4-26b-a4b-it',    // Vision + long context
};

export async function callGemini({ apiKey, model, system, prompt, imageBase64 = null, mimeType = null, pdfBase64 = null }) {
  if (!apiKey) throw new Error('No Gemini API key for image processing.');

  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;

  const isPDF = !!pdfBase64;
  const parts = [];
  if (pdfBase64) {
    parts.push({ inline_data: { mime_type: 'application/pdf', data: pdfBase64 } });
  } else if (imageBase64) {
    parts.push({ inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } });
  }
  parts.push({ text: prompt });

  // Only Gemma 4 supports thinkingConfig, not Gemini 2.5 Flash
  const generationConfig = {
    temperature: 0.3,
    maxOutputTokens: isPDF ? 4096 : 1024
  };
  
  // Add thinkingConfig only for Gemma 4 models
  if (model.includes('gemma')) {
    generationConfig.thinkingConfig = { thinkingLevel: 'MINIMAL' };
  }

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts }],
    generationConfig
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), isPDF ? 240000 : 90000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `API error ${res.status}`;
      if (res.status === 429) throw new Error('Gemma 4 rate limit hit. Wait a moment.');
      if (res.status === 403) throw new Error('Gemini API key rejected.');
      throw new Error(msg);
    }

    const data = await res.json();
    const allParts = data?.candidates?.[0]?.content?.parts || [];
    const answerPart = allParts.find(p => !p.thought) || allParts[0] || {};
    let text = answerPart.text || '';
    // Strip any leaked thinking tags
    text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
    if (!text) throw new Error('Empty response from Gemma 4.');
    return text;

  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error(isPDF ? 'PDF too large — try under 15 pages.' : 'Gemma 4 timed out. Try a smaller image.');
    throw e;
  }
}

export async function checkGemini(apiKey) {
  if (!apiKey) return { ok: false, error: 'No Gemini API key' };
  return { ok: true };
}
