# QuietText Web App

This is the web interface for QuietText 2.0. It's where the actual text processing happens.

The app is built with React and runs entirely in your browser. No backend. No database. Everything stays on your device unless you explicitly choose to use online AI models.

## What It Does

### Text Simplification

Paste any text and get it rewritten in short sentences with simple words. You can choose your reading level (Grade 3, 6, 9, or Adult) and language (English, Hindi, Urdu, Bengali, Arabic, Spanish, French).

The app shows you before and after readability scores so you can see the difference. Every result uses the OpenDyslexic font, which is designed specifically for dyslexic readers.

### Sentence Focus Mode

After simplifying text, click the Focus button. The screen goes dark and shows you one sentence at a time in large, centered text. Press Space to advance. Press the left arrow to go back. Press Escape to exit.

This mode helps when you need to concentrate on one idea at a time without the distraction of the full page.

### Assignment Decoder

Students can paste homework instructions and get a numbered list of simple steps. Each step has a checkbox. As you complete steps, a progress bar fills up. When you finish everything, the app celebrates with you.

It turns overwhelming assignments into manageable tasks.

### PDF and Image Processing

Upload a PDF or take a photo of a printed page. QuietText reads the text and simplifies it. This works with textbooks, worksheets, letters, anything with text on it.

Gemma 4 handles this. It can process entire documents without chunking them into pieces, which means the context stays intact.

### Word Glossary

Click any word in a simplified result and get an instant definition in plain English. The definition appears in a small popup. Click outside to close it.

This helps when you encounter an unfamiliar word but don't want to leave the page to look it up.

### Q&A

After processing a document, you can ask questions about it. The AI answers based only on what's in the document. If the answer isn't there, it tells you.

This is useful for studying or checking your understanding.

### History

The last 20 simplifications are saved in your browser. You can go back to them anytime. Nothing is sent to a server. It's all stored locally.

## How to Run It

### Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

The build output goes to the `dist/` folder. Deploy it anywhere that serves static files.

### Live Demo

The app is already deployed at [https://quiettext.vercel.app](https://quiettext.vercel.app). You can use it right now without installing anything.

## API Keys

The app needs API keys to work in online mode:

- **Groq** for fast text simplification. Get a free key at [console.groq.com/keys](https://console.groq.com/keys)
- **Gemini** for images and PDFs. Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

Both keys are stored in your browser's localStorage. They never leave your device. The app makes direct API calls from your browser to Groq and Google.

## Offline Mode

If you don't want to use online APIs, you can run everything locally with Ollama:

```bash
ollama pull gemma4:e2b
ollama serve
```

Then open the app, go to Settings, and switch to Offline mode. Everything will run on your machine. No internet required.

## Tech Details

- React 19 with hooks
- Vite for build tooling
- No TypeScript, just plain JavaScript
- No CSS frameworks, just inline styles and a single globals.css
- Chart.js for readability metrics
- pdfjs-dist for PDF text extraction
- OpenDyslexic font served from `/public/fonts/`
- localStorage for all data persistence

The code follows strict rules defined in `AGENTS.md` at the project root. Every AI call is wrapped in error handling. Every async operation shows a loading state. Nothing fails silently.

## File Structure

```
src/
├── components/       All React components
│   ├── InputPanel.jsx
│   ├── ResultPanel.jsx
│   ├── AssignmentPanel.jsx
│   ├── QAPanel.jsx
│   ├── PDFUpload.jsx
│   ├── ImageUpload.jsx
│   ├── MetricsChart.jsx
│   ├── Sidebar.jsx
│   └── AIStatus.jsx
├── lib/             Core logic
│   ├── ai.js        AI router (Groq, Gemini, Ollama)
│   ├── groq.js      Groq API client
│   ├── gemini.js    Gemini API client
│   ├── ollama.js    Ollama API client + all prompts
│   ├── metrics.js   Readability calculations
│   ├── storage.js   localStorage helpers
│   └── pdfExtract.js PDF text extraction
├── App.jsx          Main app component
└── main.jsx         Entry point
```

All AI prompt templates live in `src/lib/ollama.js` in the `PROMPTS` object. If you want to change how the AI responds, that's where you edit.

## Privacy

This app doesn't track you. There's no analytics, no telemetry, no logging. Your text never touches a server unless you explicitly use online AI models, and even then it goes directly from your browser to Groq or Google.

In offline mode, nothing leaves your device at all.

## Author

Built by Ashhar Ahmad Khan as part of the Kaggle "Build with Gemma" competition.

Live demo: [https://quiettext.vercel.app](https://quiettext.vercel.app)