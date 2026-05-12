# QuietText 2.0

The internet isn't built for dyslexic people. Web accessibility guidelines talk about screen readers and color contrast, but they ignore the 1 in 10 people who struggle with dense text, tight spacing, and complex language.

This project is a successor to [QuietText](https://github.com/AshharAhmadKhan/QuietText). I built the original QuietText as my 6th semester minor project at Jamia Hamdard University. It was a Chrome extension that made webpages readable for dyslexic users. I wanted to help people who struggle with reading. But I realized something: people needed help beyond web pages. They needed to read PDFs, extract text from images, and work offline when internet wasn't available or affordable.

Then Gemma 4 came out.

QuietText 2.0 is a complete rebuild. It's a two-part system: a Chrome extension for the web, and a web app that creates a full learning ecosystem. Upload a photo of your textbook. Paste a 50-page PDF. Ask questions about what you're reading. Break down complex assignments into simple steps. It works online when you have internet, and works just as well offline when you don't. Your data never leaves your device unless you choose otherwise.

## The Journey

QuietText v1 was a Chrome extension. It applied the OpenDyslexic font, adjusted spacing, and simplified text on web pages. It worked, but it had limits. No PDFs. No images. No offline mode. People needed more.

Gemma 4 changed everything. Multimodal vision for reading images and PDFs. 256K context window for processing entire documents without chunking. Runs locally on consumer hardware. I rebuilt QuietText from the ground up.

QuietText 2.0 is accessibility built for people who actually need it. It's free. It's private. It works whether you have internet or not. And it helps anyone who struggles with complex text, whether that's dyslexia, reading in a second language, or just trying to understand dense academic papers.

## What It Does

### The Extension

Makes any webpage easier to read. Apply reading presets, adjust spacing, or send text to the web app for simplification.

[Extension details](extension/README.md)

### The Web App

A complete learning ecosystem. Simplify text, process PDFs and images, decode assignments, ask questions about documents. Works online when you're connected, works offline when you're not.

[Web app details](web-app/README.md)

## Why It Matters

Existing assistive tech costs $50 to $200 per month. Many tools require constant internet. Most send your data to the cloud. QuietText 2.0 is free, works with or without internet, and keeps your data private.

This matters for students in rural areas without reliable internet. For people who can't afford subscription services. For anyone concerned about privacy. For dyslexic readers who need help everywhere, not just on web pages. For learners reading in their second language.

Reading shouldn't require money, constant internet, or a computer science degree.

## How It Works

Gemma 4 handles images, PDFs, and long documents. Its multimodal capabilities and 256K context window make offline accessibility possible.

Gemini 2.5 Flash provides fast text simplification when you're online. Most requests finish in 2-3 seconds.

Ollama runs Gemma 4 locally on your machine for complete offline operation. Nothing sent to the cloud.

The system automatically picks the best model for what you're doing. It picks the right tool automatically.

## Getting Started

### Try It Now

Live demo: [https://quiet-text-2-0-offline.vercel.app](https://quiet-text-2-0-offline.vercel.app)

No installation needed. Open it, paste text, see what it does.

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

People who need it.

Students struggling with dense textbooks. Dyslexic readers navigating the web. People in rural areas without reliable internet. Anyone who can't afford expensive assistive tech. Learners reading in their second language.

Accessibility isn't a nice-to-have. It's a requirement.

## Tech Stack

React 19 + Vite for the web app. Vanilla JavaScript for the extension. Gemini and Gemma 4 via API, Ollama for offline. OpenDyslexic font for readability. Chart.js for metrics. Everything runs client-side. No backend. No tracking.

## Author

Built by Ashhar Ahmad Khan as a 6th semester minor project at Jamia Hamdard University.

I believe technology should reduce barriers, not create them. QuietText is my attempt to make reading accessible to everyone, regardless of how their brain processes text.

GitHub: [@AshharAhmadKhan](https://github.com/AshharAhmadKhan)  
Live Demo: [https://quiet-text-2-0-offline.vercel.app](https://quiet-text-2-0-offline.vercel.app)

## License

Apache 2.0. Same license as Gemma 4. Use it, modify it, share it. Just keep it accessible.
