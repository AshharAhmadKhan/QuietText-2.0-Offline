// gemini.js — Gemini API for text, vision, and PDF processing
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const GEMINI_MODELS = {
  PRIMARY: 'gemini-2.5-flash',      // Fast text processing (1.78s avg)
  VISION:  'gemma-4-26b-a4b-it',    // Vision + long context
};

export async function callGemini({ apiKey, model, system, prompt, imageBase64 = null, mimeType = null, pdfBase64 = null }) {
  if (!apiKey) throw new Error('No Gemini API key for image processing.');

  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;

  const isPDF = !!pdfBase64;
  const isImage = !!imageBase64;
  const parts = [];
  if (pdfBase64) {
    parts.push({ inline_data: { mime_type: 'application/pdf', data: pdfBase64 } });
  } else if (imageBase64) {
    parts.push({ inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } });
  }
  parts.push({ text: prompt });

  // Configuration for generation
  const generationConfig = {
    temperature: 0.3,
    maxOutputTokens: isPDF ? 4096 : 2048  // Increased from 1024 to 2048 for longer text responses
  };
  
  // NOTE: thinkingConfig causes 500 errors with long system prompts on Gemma models
  // Removed to ensure stability

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts }],
    generationConfig
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 900000);  // 15 min universal

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
    const answerPart = allParts.find(p => p.text) || allParts[0] || {};
    let text = answerPart.text || '';
    if (!text) throw new Error('Empty response from Gemma 4.');
    return text;

  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      if (isPDF) throw new Error('PDF too large — try under 15 pages.');
      if (isImage) throw new Error('Gemma 4 timed out. Try a smaller image.');
      throw new Error('Request timed out. Try shorter text or wait a moment.');
    }
    throw e;
  }
}

export async function checkGemini(apiKey) {
  if (!apiKey) return { ok: false, error: 'No Gemini API key' };
  return { ok: true };
}
