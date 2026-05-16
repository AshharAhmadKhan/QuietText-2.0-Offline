// Routes requests to Gemma 4 (online) or Ollama (offline)
// Online: Gemma 4 for everything | Flash fallback on rate limit | Offline: Ollama gemma4:latest

import { callGemini, checkGemini, GEMINI_MODELS } from "./gemini";
import { callOllama, checkOllama, PROMPTS }        from "./ollama";
import { extractTextFromPDF }                        from "./pdfExtract";

export { PROMPTS };

export const getAIMode    = () => localStorage.getItem("qt2_ai_mode") || "online";
export const setAIMode    = (m) => localStorage.setItem("qt2_ai_mode", m);
export const getGeminiKey = () => localStorage.getItem("qt2_gemini_key") || "";
export const saveGeminiKey= (k) => { localStorage.setItem("qt2_gemini_key", k); window.dispatchEvent(new CustomEvent("qt-key-saved", { detail: { key: "gemini", value: k } })); };


export async function callAI({ system, prompt, images = [], pdf = null, ollamaModel = "", purpose = "text", history = [] }) {
  const mode = getAIMode();

  // Offline mode — Ollama for everything
  if (mode === "ollama") {
    if (!ollamaModel) throw new Error("No Ollama model selected.");
    if (pdf) {
      const blob = new Blob([Uint8Array.from(atob(pdf), c => c.charCodeAt(0))], { type: "application/pdf" });
      const pdfText = await extractTextFromPDF(blob);
      if (!pdfText) throw new Error("Could not extract text from PDF. Try a text-based PDF.");
      const offlinePrompt = prompt + "\n\nPDF CONTENT:\n" + pdfText;
      return callOllama({ model: ollamaModel, system, prompt: offlinePrompt, images: images.length ? [images[0]] : [] });
    }
    return callOllama({ model: ollamaModel, system, prompt, images: images.length ? [images[0]] : [] });
  }

  // PDF → Gemma 4 (256K context, handles text + scanned, no chunking)
  if (pdf) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error("PDF processing needs a Gemini API key. Add it in Settings.");
    return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.GEMMA, system, prompt, pdfBase64: pdf });
  }

  // Image → Gemma 4 vision
  if (images.length > 0) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error("Image processing needs a Gemini API key. Add it in Settings.");
    return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.GEMMA, system, prompt, imageBase64: images[0], mimeType: images[1] || null });
  }

  // All online features → Gemma 4 (primary), Flash fallback on rate limit only
  const geminiKey = getGeminiKey();
  if (!geminiKey) throw new Error("Add your Gemini API key in Settings.");

  try {
    return await callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.GEMMA, system, prompt });
  } catch (error) {
    const errMsg = error.message?.toLowerCase() || '';
    const isRateLimit = errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('quota');
    if (isRateLimit) {
      console.log('Gemma 4 rate limit hit, falling back to Flash...');
      return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.FLASH, system, prompt });
    }
    throw error;
  }
}

// --- Status check ---
export async function checkAIStatus(ollamaModel = "") {
  const mode = getAIMode();
  if (mode === "ollama") {
    const r = await checkOllama();
    return { mode: "ollama", ...r };
  }
  const geminiKey = getGeminiKey();
  const r = await checkGemini(geminiKey);
  return { mode: "online", ...r };
}
