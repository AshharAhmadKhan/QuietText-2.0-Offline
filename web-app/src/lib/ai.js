// ai.js — unified AI router
//
// TEXT:    Groq first (5s timeout), Gemma 4 auto-fallback for long text
// IMAGES:  Gemma 4 vision (only model that can read images)
// PDFs:    Gemma 4 (256K context, handles scanned docs)
// QA/STUDY/ASSIGNMENT: Gemma 4 (better reasoning)
// OFFLINE: Ollama gemma4:e2b (fully local, nothing leaves device)

import { callGroq, checkGroq }     from "./groq";
import { callGemini, checkGemini, GEMINI_MODELS } from "./gemini";
import { callOllama, checkOllama, PROMPTS }        from "./ollama";

export { PROMPTS };

// --- Storage helpers ---
export const getAIMode    = () => localStorage.getItem("qt2_ai_mode") || "online";
export const setAIMode    = (m) => localStorage.setItem("qt2_ai_mode", m);
export const getGroqKey   = () => localStorage.getItem("qt2_groq_key") || "";
export const saveGroqKey  = (k) => localStorage.setItem("qt2_groq_key", k);
export const getGeminiKey = () => localStorage.getItem("qt2_gemini_key") || "";
export const saveGeminiKey= (k) => localStorage.setItem("qt2_gemini_key", k);

// purposes that need Gemini's stronger reasoning
const GEMINI_PURPOSES = new Set(["qa", "studyGuide", "assignment", "examQuestions", "checkAnswers"]);

// --- Main router ---
export async function callAI({ system, prompt, images = [], pdf = null, ollamaModel = "", purpose = "text", history = [] }) {
  const mode = getAIMode();

  // Offline mode — Ollama for everything
  if (mode === "ollama") {
    if (!ollamaModel) throw new Error("No Ollama model selected.");
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
    if (geminiKey) {
      try {
        return await callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.VISION, system, prompt });
      } catch (e) {
        // fall through to Groq if Gemini fails
      }
    }
  }

  // Text → Groq first (5s timeout), then Gemma 4 fallback
  const groqKey = getGroqKey();
  if (!groqKey) throw new Error("Add your Groq API key in Settings for fast text responses.");

  try {
    return await callGroq({ apiKey: groqKey, system, prompt });
  } catch (groqErr) {
    const msg = groqErr.message.toLowerCase();
    const shouldFallback = msg.includes("rate limit")
      || msg.includes("429")
      || msg.includes("too large")
      || msg.includes("context")
      || msg.includes("token")
      || msg.includes("length")
      || msg.includes("timed out")
      || msg.includes("abort");
    if (!shouldFallback) throw groqErr;

    // Gemma 4 fallback — handles long text that Groq cannot
    const geminiKey = getGeminiKey();
    if (!geminiKey) throw groqErr;
    try {
      return await callGemini({ apiKey: geminiKey, model: GEMINI_MODELS.VISION, system, prompt });
    } catch {
      throw groqErr;
    }
  }
}

// --- Status check ---
export async function checkAIStatus(ollamaModel = "") {
  const mode = getAIMode();
  if (mode === "ollama") {
    const r = await checkOllama();
    return { mode: "ollama", ...r };
  }
  const groqKey = getGroqKey();
  const r = await checkGroq(groqKey);
  return { mode: "online", ...r };
}
