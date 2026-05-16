# QuietText 2.0

> **Built for the [Gemma 4 Good Hackathon](https://kaggle.com/competitions/gemma-4-good-hackathon)**  
> **Track:** Digital Equity & Inclusivity | **Special Prize:** Ollama  
> **Live Demo:** [quiet-text-2-0-offline.vercel.app](https://quiet-text-2-0-offline.vercel.app) | **Video:** [YouTube](https://youtu.be/jPGO-Q8vKas)

---

The internet isn't designed for people who struggle to read. QuietText 2.0 is an offline-first AI accessibility platform powered by Gemma 4 that simplifies text, PDFs, and images in 7 languages—privately, affordably, and without requiring internet.

This project is a successor to [QuietText](https://github.com/AshharAhmadKhan/QuietText). I built the original QuietText as my 6th semester minor project at Jamia Hamdard University. It was a Chrome extension that made webpages readable for dyslexic users. I wanted to help people who struggle with reading. But I realized something: people needed help beyond web pages. They needed to read PDFs, extract text from images, and work offline when internet wasn't available or affordable.

Then Gemma 4 came out.

QuietText 2.0 is a complete rebuild. It's a two-part system: a Chrome extension for the web, and a web app that creates a full learning ecosystem. Upload a photo of your textbook. Paste a 50-page PDF. Ask questions about what you're reading. Break down complex assignments into simple steps. It works online when you have internet, and works just as well offline when you don't. Your data never leaves your device unless you choose otherwise.

## The Journey

QuietText v1 was a Chrome extension. It applied the OpenDyslexic font, adjusted spacing, and simplified text on web pages. It worked, but it had limits. No PDFs. No images. No offline mode. People needed more.

Gemma 4 changed everything. Multimodal vision for reading images and PDFs. Up to 256K context window online and 128K offline for processing entire documents without chunking. Runs locally on consumer hardware. I rebuilt QuietText from the ground up.

QuietText 2.0 is accessibility built for people who actually need it. It's free. It's private. It works whether you have internet or not. And it helps anyone who struggles with complex text, whether that's dyslexia, reading in a second language, or just trying to understand dense academic papers.

## What It Does

### The Extension

Makes any webpage easier to read. Apply reading presets, adjust spacing, or send text to the web app for simplification.

[Extension details](extension/README.md)

### The Web App

A full set of reading tools. Simplify text, process PDFs and images, decode assignments, ask questions about documents. Works online when you're connected, works offline when you're not.

[Web app details](web-app/README.md)

## Powered by Gemma 4

QuietText leverages three key Gemma 4 capabilities that make offline accessibility possible:

**Multimodal Vision**
- Process PDFs and images natively without OCR
- Extract text from textbook photos, worksheets, scanned documents
- Handles complex layouts, tables, and mixed content

**Long Context Window**
- Online (Gemini API): up to 256K tokens — process entire 50-page documents in one pass
- Offline (Ollama E2B): 128K tokens — still handles most textbooks and assignments without chunking
- No chunking = better coherence and context preservation
- Maintains document structure and relationships

**Local Deployment via Ollama**
- Runs completely offline on consumer hardware
- No internet required after initial setup
- Your data never leaves your device
- Privacy by default

**Hybrid Architecture:**
- **Online mode:** Gemma 4 for everything — text, PDFs, images, Q&A, study tools, assignments, and multilingual output
- **Offline mode:** Gemma 4 via Ollama for everything — nothing leaves your device
- **Silent safety net:** Gemini Flash activates automatically if Gemma 4 is under load, so dyslexic users never see a failure or wait longer than they should. Most users will never know it exists.

## Impact Metrics

**Readability Improvements:**
- Grade 12 text → Grade 6 (Flesch-Kincaid reduction)
- Complex academic papers → everyday language
- Before/after scores shown for every simplification

**Performance:**
- Online: 5-10 seconds for text, 15-20 seconds for PDFs
- Offline: 20-30 seconds for all processing
- Supports documents up to 50 pages (256K tokens online / 128K tokens offline)

**Accessibility:**
- 7 languages: English, Hindi, Urdu, Bengali, Arabic, Spanish, French
- 4 reading levels: Grade 3, 6, 9, Adult
- Works offline in areas with poor connectivity
- Free and open-source (existing tools cost $50-200/month)

## Why It Matters

Existing assistive tech costs $50 to $200 per month. Many tools require constant internet. Most send your data to the cloud. QuietText 2.0 is free, works with or without internet, and keeps your data private.

This matters for students in rural areas without reliable internet. For people who can't afford subscription services. For anyone concerned about privacy. For dyslexic readers who need help everywhere, not just on web pages. For learners reading in their second language.

Reading shouldn't require money, constant internet, or a computer science degree.

## How It Works

Gemma 4 handles images, PDFs, and long documents. Its multimodal capabilities and long context window make offline accessibility possible.

Gemma 4 handles everything online — text, PDFs, images, and all learning tools. If Gemma 4 is ever under high demand, Gemini Flash steps in silently as a safety net. Dyslexic users should never see a failure message or an empty screen. That is not acceptable. So we made sure they never do.

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
# Recommended for most machines (low RAM)
ollama pull gemma4:e4b

# More capable if you have 16GB+ RAM
# ollama pull gemma4:9b

ollama serve
```

Open the web app, switch to Offline mode in settings. The app detects all your locally pulled Gemma models and lets you pick — everything runs locally.

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
