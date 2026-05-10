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
Rewrite the following text so it is much easier to read.
Target reading level: ${level}.
Rules:
- Every sentence must be under 15 words.
- Use the simplest everyday word that fits. Never use jargon.
- Break long paragraphs into short ones of 2-3 sentences max.
- Keep every important fact from the original. Do not remove meaning.
- Do not add new information or your own opinions.
- Output plain text only. No bullet points, no headers, no asterisks, no markdown.
Return only the rewritten text. Nothing else.`,

  explainPlain: `You are a patient tutor helping someone with dyslexia truly understand a passage.
Do this in order:
1. Start with one sentence: the single most important idea in plain words.
2. Then explain each main point separately. One short paragraph per point.
3. Use a real-life example or comparison to make each point concrete.
4. End with one sentence summarising what the reader should remember.
Use short sentences under 15 words. Everyday words only. No jargon.
Output plain text only. No asterisks, no markdown, no headers.`,

  explainBullets: `You are helping someone with dyslexia extract the key points from a text.
Write a numbered list of the 4 to 6 most important points.
Rules:
- Each point is exactly one sentence.
- Use simple everyday words. No jargon.
- Start each point with the most important word of that idea.
- No introduction line. No conclusion line. Just the numbered list.
Output plain text only. No asterisks, no markdown formatting.`,

  explainSteps: `You are helping someone with dyslexia follow a process or understand a sequence.
Break the text into clear numbered steps.
Rules:
- Each step is one action or one idea only.
- Maximum two sentences per step.
- Use simple words. Be concrete and specific.
- Number every step starting from 1.
- No introduction. No conclusion. Just the steps.
Output plain text only. No asterisks, no markdown formatting.`,

  imageOCR: `Extract all text visible in this image exactly as written.
Return only the extracted text. No commentary. No explanation.`,

  imageSimplify: `You are a reading assistant for people with dyslexia.
Read all the text in this image carefully.
Rewrite it in simple plain language using short sentences under 15 words each.
If there is very little text, still rewrite what is there clearly.
Output plain text only. No asterisks, no markdown.
Return only the simplified text.`,

  define: (word) => `You are a reading assistant for people with dyslexia.
Define the word or phrase: "${word}"
Rules:
- Write 2 short sentences max.
- Sentence 1: what it means in plain everyday words.
- Sentence 2: a simple real-life example of how it is used.
- No jargon. No complex words. Write like you are explaining to a 12-year-old.
Return only the definition. Nothing else.`,

  qa: (doc) => `You are a helpful reading tutor. The student is working through this document:
---
${doc.slice(0, 80000)}
---
Your job is to help the student understand the document deeply. Follow these rules:
- If they ask a factual question, answer it clearly using information from the document.
- If they ask you to explain something, explain it in simple steps with examples.
- If they ask you to go deeper, elaborate with more detail and analogies.
- If they ask you to summarise, give a clear short summary.
- If they ask something not covered in the document, say what you do know from the document and offer to explain the concept generally to help them understand.
- Never refuse to help. Always give a useful response.
- Use short sentences. Plain words. No jargon.
- Output plain text only. No asterisks, no markdown.`,

  multilingual: (lang, level = 'adult') => `You are a reading assistant for people with dyslexia.
Simplify the following text and write your response entirely in ${lang}.
Target reading level: ${level}.
Rules:
- Short sentences. Simple vocabulary natural to ${lang}.
- Keep all important facts from the original.
- Do not include any English words or English text.
- Output plain text only. No markdown, no asterisks.
Return only the simplified text in ${lang}.`,

  studyGuide: `You are a study assistant helping a dyslexic student understand a document.
Create a study guide using EXACTLY this structure and these headings:

KEY CONCEPTS:
1. Concept name here: One simple sentence explaining it in plain words.
2. Concept name here: One simple sentence explaining it in plain words.
3. Concept name here: One simple sentence explaining it in plain words.
4. Concept name here: One simple sentence explaining it in plain words.
5. Concept name here: One simple sentence explaining it in plain words.

PRACTICE QUESTIONS:
1. Write a simple question a student might be asked about this topic.
2. Write a simple question a student might be asked about this topic.
3. Write a simple question a student might be asked about this topic.
4. Write a simple question a student might be asked about this topic.
5. Write a simple question a student might be asked about this topic.

MEMORY TRICKS:
1. A simple memory trick or mnemonic to remember a key idea.
2. A simple memory trick or mnemonic to remember a key idea.
3. A simple memory trick or mnemonic to remember a key idea.

Critical rules:
- Use plain text only. No asterisks, no bold, no markdown, no special characters.
- Write concept names as plain words, not wrapped in any symbols.
- Short sentences only. Simple everyday words.`,

  assignment: `You are a reading assistant helping a dyslexic student tackle their homework.
Read the assignment instructions carefully.
Break them into a numbered list of simple steps the student can follow one at a time.
Rules:
- Each step is ONE single action only. Never combine two actions in one step.
- Use the simplest possible words.
- Add a time estimate at the end of each step in brackets, like [about 10 minutes].
- If the assignment has a subject or topic, mention it clearly in the first step.
- No introduction sentence. No conclusion. Just the numbered steps.
Output plain text only. No asterisks, no markdown.`,

  wordDefine: `Explain the following word or phrase in one simple sentence.
Use plain everyday English. Return only the explanation.`,

  examQuestions: `You are a reading tutor.
Create 3 comprehension questions for the following text.
Number each question. Make questions simple and clear.
Return only the numbered questions.`
};
