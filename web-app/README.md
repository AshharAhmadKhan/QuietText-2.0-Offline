# QuietText Web App

You have a 50-page PDF. Dense paragraphs. Academic language. You need to understand it by tomorrow.

You open it. The words blur. You read the same sentence three times. Nothing sticks.

This is learning with dyslexia.

This app fixes that. Not just for web pages. For everything. PDFs. Images. Textbooks. Assignments. Study guides. It takes complex text and makes it readable. It takes overwhelming documents and makes them manageable.

This is the heart of QuietText 2.0. A full set of reading tools. Built for people who struggle with text. Built to work online when you have internet, offline when you don't. Built to keep your data private.

## What It Does

### Simplify Anything

Paste text. Upload a PDF. Take a photo of a printed page. Get it back in short sentences with simple words.

Choose your reading level: Grade 3, 6, 9, or Adult. Choose your language: English, Hindi, Urdu, Bengali, Arabic, Spanish, French.

The app shows you before and after readability scores. You see the difference. Every result uses OpenDyslexic font. Designed for dyslexic readers. Readable for everyone.

Complex becomes clear in seconds.

### Focus Mode

You simplified the text. Now you need to read it without distraction.

Click Focus. The screen goes dark. One sentence appears. Large. Centered. Nothing else.

Press Space to advance. Press left arrow to go back. Press Escape to exit.

One sentence at a time. No distractions.

### Decode Assignments

Your teacher gives you homework. Five paragraphs of instructions. You don't know where to start.

Paste it into Assignment mode. Get a numbered list of simple steps. Each step has a checkbox. A progress bar shows how far you've come.

Check off steps as you finish. Watch the bar fill. When you complete everything, the app celebrates with you.

Big assignments turn into small steps.

### Read PDFs and Images

Your textbook is a PDF. Your worksheet is a photo. You can't copy the text.

Upload it. QuietText reads it. Simplifies it. Shows it in readable format.

Gemma 4 handles this. Multimodal vision. 256K context window. It processes entire documents without breaking them into chunks. The context stays intact. The meaning stays clear.

Locked documents become readable text.

### Understand Words

You're reading simplified text. One word is unfamiliar. You don't want to leave the page.

Click the word. Get an instant definition in plain English. A small popup appears. Click outside to close it.

Stay on the page. Get the definition.

### Ask Questions

You processed a document. Now you want to check your understanding.

Ask a question. The AI answers based only on what's in the document. If the answer isn't there, it tells you.

The answer comes from the document, not made up.

Study better.

### Your History

The last 20 simplifications are saved in your browser. Go back to them anytime.

Nothing sent to a server. All stored locally. Your reading is private.

## How to Use It

### Try It Now

Live demo: [https://quiet-text-2-0-offline.vercel.app](https://quiet-text-2-0-offline.vercel.app)

No installation. No setup. Open it. Paste text. See what it does.

### Get Your API Key

The app needs a Gemini API key to work online. Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

Open the app. Click Settings. Paste your key. Click Save.

The key stays in your browser. It never leaves your device. The app makes direct API calls from your browser to Google. No middleman. No tracking.

### Use It Offline

You don't want to use online APIs. You don't have reliable internet. You want complete privacy.

Install Ollama from [ollama.ai](https://ollama.ai), then:

```bash
ollama pull gemma4:e4b
ollama serve
```

Open the app. Go to Settings. Switch to Offline mode.

Everything runs on your machine. No internet required. Your data never leaves your device.

### From the Extension

Install the Chrome extension. Select text on any webpage. Press Ctrl+Shift+Q (or Cmd+Shift+Q on Mac).

The web app opens in a new tab. Your text is already there. Ready to simplify.

From any page to plain language in two clicks.

## Why It Matters

Existing assistive tech costs money. Most tools need constant internet. Many send your data to the cloud.

This app is free. Works online or offline. Keeps your data private.

This matters for students without reliable internet. For people who can't afford subscriptions. For anyone concerned about privacy. For dyslexic readers who need help with documents, not just web pages. For learners reading in their second language.

Learning shouldn't require money, constant internet, or technical knowledge.

## Privacy

This app doesn't track you.

No analytics. No telemetry. No logging. Your text never touches a server unless you use online AI models, and even then it goes directly from your browser to Google.

In offline mode, nothing leaves your device at all.

Your API key is stored in your browser's localStorage. It never leaves your device.

## For Developers

### Run It Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy anywhere that serves static files.

### Tech Stack

React 19 with hooks. Vite for build tooling. No TypeScript, just plain JavaScript. No CSS frameworks, just inline styles and globals.css.

Chart.js for readability metrics. pdfjs-dist for PDF text extraction. OpenDyslexic font served from `/public/fonts/`. localStorage for all data persistence.

The code follows consistent patterns. Every AI call is wrapped in error handling. Every async operation shows a loading state. Nothing fails silently.

### File Structure

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
│   ├── ai.js        AI router (Gemini, Ollama)
│   ├── gemini.js    Gemini API client
│   ├── ollama.js    Ollama API client + all prompts
│   ├── metrics.js   Readability calculations
│   ├── storage.js   localStorage helpers
│   └── pdfExtract.js PDF text extraction
├── App.jsx          Main app component
└── main.jsx         Entry point
```

All AI prompt templates live in `src/lib/ollama.js` in the `PROMPTS` object. If you want to change how the AI responds, that's where you edit.

## Author

Built by Ashhar Ahmad Khan as my 6th semester minor project at Jamia Hamdard University.

I believe technology should reduce barriers, not create them. QuietText is my attempt to make reading accessible to everyone, regardless of how their brain processes text.

GitHub: [@AshharAhmadKhan](https://github.com/AshharAhmadKhan)  
Live Demo: [https://quiet-text-2-0-offline.vercel.app](https://quiet-text-2-0-offline.vercel.app)

Main Project: [QuietText 2.0](https://github.com/AshharAhmadKhan/QuietText-2.0-Offline)