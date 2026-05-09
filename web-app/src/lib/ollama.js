// ollama.js — QuietText 2.0
// All Gemma 4 calls go through here. No AI calls anywhere else.
// All prompt templates live in PROMPTS — Rule 10.
// Add this to the top of ollama.js
export const OLLAMA_BASE = 'http://localhost:11434';

const BASE = 'http://localhost:11434';

// Timeouts
const CHECK_TIMEOUT_MS  = 3000;
const CALL_TIMEOUT_MS   = 120000;

export async function checkOllama() {
  try {
    const res = await fetch(`${BASE}/api/tags`, {
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS)
    });
    if (!res.ok) return { ok: false, models: [], error: 'Ollama responded with an error' };
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    return { ok: true, models };
  } catch {
    return { ok: false, models: [], error: 'Ollama not running. Open a terminal and run: ollama serve' };
  }
}

// Test if a model can actually run (has enough RAM)
export async function testModel(modelName) {
  try {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: 'test',
        stream: false,
        options: { num_predict: 1 }
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // Check if error is RAM-related
      if (err.error && (err.error.includes('memory') || err.error.includes('RAM'))) {
        return { canRun: false, reason: 'insufficient_ram' };
      }
      return { canRun: false, reason: 'unknown' };
    }
    
    return { canRun: true };
  } catch (e) {
    if (e.name === 'AbortError') {
      return { canRun: false, reason: 'timeout' };
    }
    return { canRun: false, reason: 'error' };
  }
}

export async function callOllama({ model, system, prompt, images = [] }) {
  const body = {
    model,
    prompt,
    system,
    stream: false,
    options: { temperature: 0.3, num_predict: 2048 }
  };
  if (images.length > 0) body.images = images;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Ollama error ${res.status}`);
    }
    const data = await res.json();
    return data.response?.trim() || '';
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error('Request timed out (>2 min). Try a shorter text or switch to gemma4:9b.');
    }
    if (e.message.toLowerCase().includes('fetch') || e.message.toLowerCase().includes('network')) {
      throw new Error('Cannot reach Ollama. Is it running? Try: ollama serve');
    }
    throw e;
  }
}

// ─── All prompt templates — Rule 10: prompts live here only ───
export const PROMPTS = {
  simplify: (level = 'adult') => `You are a reading assistant for people with dyslexia.
Rewrite the following text to make it much easier to read.
Target reading level: ${level}.
Use short sentences (under 15 words each). Use simple, common words.
Break long paragraphs into shorter ones.
Keep every important idea and fact from the original.
Do not add new information or opinions.
Write for an adult. Do not be condescending or childish.
Return only the rewritten text. No preamble or explanation.`,

  explainPlain: `You are a patient reading tutor helping people with dyslexia.
Explain the following passage in simple, clear language.
Use short sentences and everyday words.
Use concrete examples when helpful.
Imagine explaining to an intelligent adult unfamiliar with the topic.
Return only the explanation. No introduction.`,

  explainBullets: `You are helping people with dyslexia understand this text.
Extract the main points from the following text.
Return them as a numbered list (aim for 4-6 points).
Each point: one clear sentence using simple words.
No introduction or conclusion needed.`,

  explainSteps: `You are helping people with dyslexia understand this text.
Break down the following text into a step-by-step explanation.
Number each step (1, 2, 3...).
Keep each step to one or two short sentences using simple words.
Return only the numbered steps.`,

  imageOCR: `Extract all text visible in this image exactly as written.
Return only the extracted text. No commentary. No explanation.`,

  imageSimplify: `You are a reading assistant for people with dyslexia.
Read the text in this image and rewrite it in simple language.
Use short sentences under 15 words. Use simple everyday words.
Return only the simplified text.`,

  define: (word) => `You are a reading assistant for people with dyslexia. Define the word "${word}" in one or two very short, simple sentences. Use plain everyday language. No jargon. No examples needed. Just a clear simple meaning.`,

  qa: (doc) => `You are a reading assistant. The user is reading this document:
---
${doc.slice(0, 80000)}
---
Answer the user's question simply and clearly using short sentences.
If the answer is not in the document, say so plainly.
Do not add information not in the document.`,

  multilingual: (lang, level = 'adult') => `You are a reading assistant for people with dyslexia.
Simplify the following text and respond entirely in ${lang}.
Target reading level: ${level}.
Use short sentences. Simple vocabulary. Clear structure.
Return only the simplified text in ${lang}. Do not include English.`,

  wordDefine: `Explain the following word or phrase in one simple sentence.
Use plain everyday English. Return only the explanation.`,

  examQuestions: `You are a reading tutor.
Create 3 comprehension questions for the following text.
Number each question. Make questions simple and clear.
Return only the numbered questions.`
};
