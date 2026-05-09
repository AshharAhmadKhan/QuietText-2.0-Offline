// groq.js
// Single module that handles the fetch call to Groq API (OpenAI-compatible).
// Called only from background.js. No backend. No proxy.

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Users must add their own Groq API key in the extension settings
// Get a free key at: https://console.groq.com
const DEFAULT_API_KEY = ''; // Enter your API key here

async function callGroq(systemPrompt, userText, apiKey) {
  const key = apiKey || DEFAULT_API_KEY;
  
  if (!key) {
    throw new Error('Please add your Groq API key in the extension settings (Settings tab).');
  }

  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userText }
    ],
    temperature: 0.3,
    max_tokens: 1024
  };

  // 30-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = 'Groq API error';
      try {
        const err = await response.json();
        errorMsg = err?.error?.message || errorMsg;
      } catch {
        // Malformed JSON response
        errorMsg = `API error (${response.status})`;
      }
      throw new Error(errorMsg);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('API returned invalid data');
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('No response from Groq');
    return text.trim();

  } catch (err) {
    clearTimeout(timeoutId);
    // Network errors
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (err.message.includes('fetch')) {
      throw new Error('No internet connection');
    }
    throw err;
  }
}

// Prompt templates
const PROMPTS = {
  simplify: `You are a reading assistant for people with dyslexia.
Rewrite the following text to make it much easier to read.
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
Take the space you need to explain thoroughly, but stay focused.
Imagine you're explaining to an intelligent adult who is unfamiliar with the topic.
Return only the explanation. No introduction.`,

  explainBullets: `You are helping people with dyslexia understand this text.
Extract the main points from the following text.
Return them as a numbered list (aim for 4-6 points, but use fewer if the text is short).
Each point should be one clear sentence using simple words.
No introduction or conclusion needed.`,

  explainSteps: `You are helping people with dyslexia understand this text.
Break down the following text into a step-by-step explanation.
Number each step (1, 2, 3...).
Keep each step to one or two short sentences using simple words.
Use concrete examples when helpful.
Write as if explaining to someone reading this for the first time.
Return only the numbered steps.`,

  explainHighlight: `You are helping a person with dyslexia understand highlighted text.
Explain the following in 2-3 simple sentences.
Use short sentences under 15 words each.
Use simple everyday words only.
Return only the explanation, nothing else.`
};
