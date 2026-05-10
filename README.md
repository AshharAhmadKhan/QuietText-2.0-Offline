# QuietText 2.0

Reading shouldn't be a struggle. For millions of people with dyslexia, it is.

QuietText 2.0 is an AI-powered reading assistant that makes complex text simple, clear, and accessible. It combines a Chrome extension with a web app to help dyslexic readers understand anything they encounter online, from news articles to homework assignments to work documents.

This is the successor to [QuietText v1](https://github.com/AshharAhmadKhan/QuietText). The original version helped thousands of users, but it had a critical limitation: it required an internet connection and couldn't process images or PDFs. Version 2.0 fixes that. Built with Gemma 4, it works completely offline and can read text from photos and scanned documents. Nothing leaves your device unless you choose otherwise.

## Why This Exists

I built QuietText because reading shouldn't be gatekept by complexity. Dyslexia affects 1 in 10 people, but most content online is written for neurotypical readers. Dense paragraphs, academic jargon, and walls of text create unnecessary barriers.

QuietText removes those barriers. It doesn't dumb things down. It makes them clear.

## What It Does

QuietText has two parts that work together:

### The Extension

The Chrome extension lives in your browser and makes any webpage easier to read. Select text, right-click, and send it to QuietText. Or press Ctrl+Shift+Q. The extension also applies the OpenDyslexic font to any page and offers reading presets that adjust spacing and contrast.

It's designed to be invisible until you need it. No popups, no distractions, just help when you ask for it.

[See extension features](extension/README.md)

### The Web App

The web app is where the real work happens. Paste text, upload a PDF, or take a photo of a printed page. QuietText simplifies it into short sentences and plain language. You can ask questions about what you're reading, break homework into simple steps, or focus on one sentence at a time.

It works online with Groq and Gemini for speed, or completely offline with Ollama. Your choice. Your data never leaves your device in offline mode.

[See web app features](web-app/README.md)

## How It Works

QuietText uses three AI models depending on what you need:

- Groq handles fast text simplification. Most requests finish in 1-2 seconds.
- Gemma 4 handles images, PDFs, and long documents. It can read text from photos and process entire chapters without chunking.
- Ollama runs Gemma 4 locally on your machine. Fully offline. Nothing sent to the cloud.

If Groq times out or hits a rate limit, Gemma 4 automatically takes over. You never see an error. The system just works.

## Getting Started

### Try the Web App

Live demo: [https://quiettext.vercel.app](https://quiettext.vercel.app)

No installation needed. Open it, paste text, and see what it does.

### Install the Extension

1. Download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select the `extension/` folder

### Run It Offline

Install Ollama from [ollama.ai](https://ollama.ai), then:

```bash
ollama pull gemma4:e2b
ollama serve
```

Open the web app, switch to Offline mode in settings, and everything runs locally.

## Built For

This project was created for the Kaggle "Build with Gemma: Multimodal and Long Context" competition. It targets the Digital Equity and Inclusivity track because accessibility isn't a nice-to-have. It's a requirement.

Gemma 4's multimodal capabilities made features possible that weren't feasible in v1. Being able to read text from a photo of a textbook page, fully offline, changes what's possible for students who can't afford expensive assistive tech.

## Tech Stack

- React 19 + Vite for the web app
- Vanilla JavaScript for the extension
- Groq (Llama 3.1), Gemini (Gemma 4), and Ollama for AI
- OpenDyslexic font for readability
- Chart.js for metrics visualization
- Everything runs client-side. No backend. No tracking.

## Author

Built by Ashhar Ahmad Khan.

I'm a developer who believes technology should reduce barriers, not create them. QuietText is my attempt to make reading accessible to everyone, regardless of how their brain processes text.

- GitHub: [@AshharAhmadKhan](https://github.com/AshharAhmadKhan)
- Live Demo: [https://quiettext.vercel.app](https://quiettext.vercel.app)

## License

MIT License. Use it, modify it, share it. Just keep it accessible.
