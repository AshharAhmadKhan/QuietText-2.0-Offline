// ai.js — unified AI router
//
// TEXT (Simplify, Explain):  → Groq  (Llama 3.1 8B, ~1-2s, 840 tok/s)
// IMAGES (OCR, photo):       → Gemma 4 API (vision capable, hackathon valid)
// OFFLINE:                   → Ollama gemma4:e2b (local, slow but private)
//
// Hackathon story: Gemma 4 powers the headline feature (image OCR offline).
// Groq powers the UX so dyslexic users aren't waiting 20 seconds per read.

import { callGroq, checkGroq }     from './groq';
import { callGemini, checkGemini, GEMINI_MODELS } from './gemini';
import { callOllama, checkOllama, PROMPTS }        from './ollama';

export { PROMPTS };

// --- Storage helpers ---
export const getAIMode    = () => localStorage.getItem('qt2_ai_mode') || 'online';
export const setAIMode    = (m) => localStorage.setItem('qt2_ai_mode', m);
export const getGroqKey   = () => localStorage.getItem('qt2_groq_key') || '';
export const saveGroqKey  = (k) => localStorage.setItem('qt2_groq_key', k);
export const getGeminiKey = () => localStorage.getItem('qt2_gemini_key') || '';
export const saveGeminiKey= (k) => localStorage.setItem('qt2_gemini_key', k);

// --- Main router ---
export async function callAI({ system, prompt, images = [], pdf = null, ollamaModel = '' }) {
  const mode = getAIMode();

  // Offline mode — Ollama for everything
  if (mode === 'ollama') {
    if (!ollamaModel) throw new Error('No Ollama model selected.');
    return callOllama({ model: ollamaModel, system, prompt, images });
  }

  // PDF → Gemma 4 (256K context, handles text + scanned, no chunking)
  if (pdf) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error('PDF processing needs a Gemini API key. Add it in Settings.');
    return callGemini({
      apiKey: geminiKey,
      model: GEMINI_MODELS.VISION,
      system,
      prompt,
      pdfBase64: pdf
    });
  }

  // Image → Gemma 4 vision
  if (images.length > 0) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error('Image processing needs a Gemini API key. Add it in Settings.');
    return callGemini({
      apiKey: geminiKey,
      model: GEMINI_MODELS.VISION,
      system,
      prompt,
      imageBase64: images[0],
      mimeType: images[1] || null
    });
  }

  // Text → Groq (fast, ~1-2s)
  const groqKey = getGroqKey();
  if (!groqKey) throw new Error('Add your Groq API key in Settings for fast text responses.');
  return callGroq({ apiKey: groqKey, system, prompt });
}

// --- Status check ---
export async function checkAIStatus(ollamaModel = '') {
  const mode = getAIMode();
  if (mode === 'ollama') {
    const r = await checkOllama();
    return { mode: 'ollama', ...r };
  }
  // Online: check Groq (primary for text)
  const groqKey = getGroqKey();
  const r = await checkGroq(groqKey);
  return { mode: 'online', ...r };
}
