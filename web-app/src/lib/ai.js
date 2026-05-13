// Routes requests to Gemini (online) or Ollama (offline)
// Text: Gemini 2.5 Flash | Images/PDFs: Gemma 4 | Offline: Ollama gemma4:e2b

import { callGemini, checkGemini, GEMINI_MODELS } from "./gemini";
import { callOllama, checkOllama, PROMPTS }        from "./ollama";
import { extractTextFromPDF }                        from "./pdfExtract";

export { PROMPTS };

export const getAIMode    = () => localStorage.getItem("qt2_ai_mode") || "online";
export const setAIMode    = (m) => localStorage.setItem("qt2_ai_mode", m);
export const getGeminiKey = () => localStorage.getItem("qt2_gemini_key") || "";
export const saveGeminiKey= (k) => { localStorage.setItem("qt2_gemini_key", k); window.dispatchEvent(new CustomEvent("qt-key-saved", { detail: { key: "gemini", value: k } })); };

const GEMINI_PURPOSES = new Set(["qa", "studyGuide", "assignment", "examQuestions", "checkAnswers"]);
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
      return callOllama({ model: ollamaModel, system, prompt: offlinePrompt, images });
    }
    return callOllama({ model: ollamaModel, system, prompt, images });
  }

  // PDF → Gemma 4 (256K context, handles text + scanned, no chunking)
  if (pdf) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error("PDF processing needs a Gemini API key. Add it in Settings.");
    return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.VISION, system, prompt, pdfBase64: pdf });
  }

  // Image → Gemma 4 vision
  if (images.length > 0) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error("Image processing needs a Gemini API key. Add it in Settings.");
    return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.VISION, system, prompt, imageBase64: images[0], mimeType: images[1] || null });
  }

  // QA / Study Guide / Assignment → Gemma 4 (stronger reasoning needed)
  if (GEMINI_PURPOSES.has(purpose)) {
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw new Error("Add your Gemini API key in Settings.");
    return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.VISION, system, prompt });
  }

  // Text → Gemini 2.5 Flash (1.78s avg, fast and reliable)
  // Fallback to Gemma 4 if rate limit hit
  const geminiKey = getGeminiKey();
  if (!geminiKey) throw new Error("Add your Gemini API key in Settings for text processing.");
  
  try {
    return await callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.PRIMARY, system, prompt });
  } catch (error) {
    // Check if it's a rate limit error
    const errMsg = error.message?.toLowerCase() || '';
    const isRateLimit = errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('quota');
    
    if (isRateLimit) {
      // Fallback to Gemma 4 silently
      console.log('Gemini rate limit hit, falling back to Gemma 4...');
      return callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.VISION, system, prompt });
    }
    
    // Re-throw other errors
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
