// gemini.js — Gemini API for text, vision, and PDF processing
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const GEMINI_MODELS = {
  GEMMA: 'gemma-4-26b-a4b-it',    // Primary — all features (text, vision, PDF, long context)
  FLASH: 'gemini-2.5-flash',       // Fallback only — used if Gemma 4 hits rate limit
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
      if (res.status === 429) throw new Error('rate limit');
      if (res.status === 403) throw new Error('Gemini API key rejected.');
      // Retry once on transient 500/503 errors (Gemma 4 intermittent failures)
      if (res.status === 500 || res.status === 503) {
        await new Promise(r => setTimeout(r, 2000));
        const retry = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        if (!retry.ok) {
          const retryErr = await retry.json().catch(() => ({}));
          throw new Error(retryErr?.error?.message || `API error ${retry.status}`);
        }
        const retryData = await retry.json();
        const retryAllParts = retryData?.candidates?.[0]?.content?.parts || [];
        let retryRaw = retryAllParts.filter(p => p.text && !p.thought).map(p => p.text).join("\n");
        if (!retryRaw.trim()) retryRaw = retryAllParts.filter(p => p.text).map(p => p.text).join("\n");
        if (!retryRaw.trim()) throw new Error('Empty response from Gemma 4.');
        clearTimeout(timer);
        return retryRaw.trim();
      }
      throw new Error(msg);
    }

    const data = await res.json();
    const allParts = data?.candidates?.[0]?.content?.parts || [];
    // Filter out thought parts (thinking) — only keep actual answer parts
    let rawText = allParts.filter(p => p.text && !p.thought).map(p => p.text).join("\n");
    // Fallback: if filtering removed everything, take all text parts (older API versions)
    if (!rawText.trim()) rawText = allParts.filter(p => p.text).map(p => p.text).join("\n");
    // Strip <think>...</think> blocks (Ollama-style thinking)
    rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "");
    // Strip Gemini 2.5 Flash thinking: lines that are bullet-point reasoning
    // Thinking lines look like: "* some reasoning text *" or "* text" at start
    // The real answer always comes after all the thinking blocks
    // Strategy: if the response contains "* " thinking patterns, extract only the final answer
    // Extract final answer — Gemma4/Gemini thinking always ends with the clean answer
    // after all reasoning. We grab the last non-empty paragraph/block.
    let text = rawText.trim();
    // Strategy 1: bullet-point thinking (* lines) — strip them
    if (/^\s*\* /m.test(text)) {
      const lines = text.split("\n");
      const answerLines = [];
      let inThink = false;
      for (const line of lines) {
        const tr = line.trim();
        if (tr.startsWith("* ") || tr === "*") { inThink = true; continue; }
        if (inThink && tr === "") continue;
        inThink = false;
        if (tr) answerLines.push(tr);
      }
      if (answerLines.length > 0) text = answerLines.join("\n").trim();
    }
    // Strategy 2: prose thinking (Wait,/Let's/Draft:/Final:/Revised:)
    // Only trigger if response looks like a thinking dump:
    // must be very long AND contain multiple "Wait," occurrences (Gemma4 thinking pattern)
    const waitCount = (text.match(/\bWait[,. ]/g) || []).length;
    if (waitCount >= 3 && text.length > 800) {
      // Find the last "Final" or "Final version:" marker and take everything after it
      const finalMatch = text.match(/(?:Final[^\n]*:\s*|Final version:\s*)([^\n].+?)$/is);
      if (finalMatch && finalMatch[1].trim().length > 10) {
        text = finalMatch[1].trim();
      } else {
        // Fallback: take the last non-empty line that is a complete sentence
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        for (let i = lines.length - 1; i >= 0; i--) {
          const l = lines[i];
          if (l.length > 20 && /[.?!]$/.test(l) && !/^(Wait|Let|Draft|Final|Revised|Check|Actually|Okay|Hmm)/i.test(l)) {
            text = l;
            break;
          }
        }
      }
    }
    text = text.trim();
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
  if (!apiKey.startsWith('AIza') || apiKey.length < 30) return { ok: false, error: 'Invalid key format' };
  return { ok: true };
}
