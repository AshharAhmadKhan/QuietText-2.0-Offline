# QuietText 2.0

AI-powered reading and study assistant for people with dyslexia.

QuietText 2.0 combines a Chrome extension with a web app to make reading and studying easier. It uses Gemma 4 (via Ollama or Google AI) for vision and long documents, and Groq for fast text simplification. If Groq times out or hits a limit, Gemma 4 takes over automatically. Nothing ever fails silently.

---

## Features

### Web App (React + Vite)
- Text Simplification — paste any text, get it rewritten in simple language
- Sentence Focus Mode — read one sentence at a time, Space to advance
- Assignment Decoder — paste homework instructions, get simple numbered steps with checkboxes
- PDF Processing — upload PDFs, get simplified versions (Gemma 4)
- Image OCR — upload photos of printed text, get simplified versions (Gemma 4)
- Q&A — ask questions about your documents
- Word Glossary — click any word in results for an instant plain-English definition
- Multiple Languages — English, Hindi, Urdu, Bengali, Arabic, Spanish, French
- Reading Levels — Grade 3, 6, 9, or Adult
- Readability Metrics — before and after comparison charts
- Text-to-Speech — listen to any result at adjustable speed
- History — last 20 simplifications stored in browser
- Offline Mode — works fully with Ollama, no internet needed

### Chrome Extension
- Right-click context menu — select text, Simplify with QuietText 2.0
- Keyboard shortcut — Ctrl+Shift+Q to send selected text
- OpenDyslexic font — apply dyslexia-friendly font to any webpage
- Reading presets — Mild, Comfort, Focus with different font sizes
- Smart highlight tooltip — highlight any text, wait 2 seconds for auto-explanation

---

## How the AI works

Groq handles fast everyday text (simplify, explain, assignment decoder) with 1-5 second responses.
Gemma 4 handles everything visual — images, PDFs, scanned documents.
If Groq times out or hits a rate limit, Gemma 4 automatically takes over.
In offline mode, Ollama runs everything locally. Nothing leaves your device.

---

## Project Structure



---

## Getting Started

### Web App



Live at: https://quiettext.vercel.app/

### Chrome Extension

1. Go to chrome://extensions/
2. Enable Developer mode
3. Click Load unpacked
4. Select the extension/ folder

---

## API Keys

Groq — fast text simplification. Free key at https://console.groq.com/keys
Gemini — image and PDF processing. Free key at https://aistudio.google.com/apikey
Both keys are stored in your browser only. We never see them.

---

## Offline Mode



Then switch to Offline mode in the app.

---

## Tech Stack

- Frontend: React 19 + Vite
- AI: Groq (llama-3.1-8b-instant), Gemini (gemma-4-26b), Ollama (gemma4:e2b)
- Charts: Chart.js
- PDF: pdfjs-dist
- Font: OpenDyslexic
- Deployment: Vercel

---

## Built for

Kaggle — Build with Gemma: Multimodal and Long Context

---

## Author

Ashhar Ahmad Khan
GitHub: https://github.com/AshharAhmadKhan
Live Demo: https://quiettext.vercel.app/