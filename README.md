# QuietText 2.0

**AI-powered reading assistant for people with dyslexia**

QuietText 2.0 combines a Chrome extension with a web app to make online reading easier. It uses Gemma 4 (via Ollama or Google AI) and Groq to simplify complex text, extract information from images and PDFs, and provide dyslexia-friendly formatting.

---

## 🎯 Features

### Web App (React + Vite)
- **Text Simplification** - Paste any text and get it rewritten in simple language
- **PDF Processing** - Upload PDFs and get simplified versions
- **Image OCR** - Upload photos of printed text and get simplified versions
- **Q&A** - Ask questions about your documents
- **Multiple Languages** - English, Hindi, Urdu, Bengali, Arabic, Spanish, French
- **Reading Levels** - Grade 3, 6, 9, or Adult
- **Offline Mode** - Works with Ollama (no internet needed)
- **Online Mode** - Uses Groq (fast) + Gemini (vision)

### Chrome Extension
- **Right-click Context Menu** - Select text → "Send to QuietText 2.0"
- **Keyboard Shortcut** - Ctrl+Shift+Q to send selected text
- **OpenDyslexic Font** - Apply dyslexia-friendly font to any webpage
- **Reading Presets** - Quick formatting options

---

## 📁 Project Structure

```
QuietText 2.0/
├── extension/          Chrome extension (load in chrome://extensions)
│   ├── manifest.json
│   ├── popup.html/js
│   ├── content.js/css
│   ├── background.js
│   ├── groq.js
│   └── icons/
├── web-app/           React web app (deployed to Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── build_extension.py  Build script (if needed)
└── README.md          This file
```

---

## 🚀 Getting Started

### Web App

1. **Install dependencies:**
   ```bash
   cd web-app
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel:**
   - Already deployed at: https://quiettext.vercel.app/
   - Connected to this GitHub repo
   - Auto-deploys on push to main

### Chrome Extension

1. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"

2. **Load extension:**
   - Click "Load unpacked"
   - Select the `extension/` folder

3. **Use the extension:**
   - Right-click selected text → "Send to QuietText 2.0"
   - Or press Ctrl+Shift+Q
   - Opens web app with your text pre-filled

---

## 🔑 API Keys

### Online Mode (Groq + Gemini)
- **Groq** - Fast text simplification
  - Get free key: https://console.groq.com/keys
  - Add in web app settings
- **Gemini** - Image and PDF processing
  - Get free key: https://aistudio.google.com/apikey
  - Add in web app settings

### Offline Mode (Ollama)
- **Install Ollama:** https://ollama.ai
- **Pull Gemma 4:**
  ```bash
  ollama pull gemma4:e2b
  ```
- **Run Ollama:**
  ```bash
  ollama serve
  ```

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Inline styles + CSS (no frameworks)
- **AI Models:**
  - Groq: llama-3.1-8b-instant (text)
  - Gemini: gemma-4-26b-a4b-it (vision)
  - Ollama: gemma4:e2b (offline)
- **Charts:** Chart.js + react-chartjs-2
- **PDF:** pdfjs-dist
- **Font:** OpenDyslexic
- **Storage:** localStorage only
- **Deployment:** Vercel

---

## 📝 Development Notes

- No TypeScript - Plain JSX
- No Tailwind - Inline styles
- No backend - Everything client-side
- No external analytics - Privacy-first
- API keys stored in browser only

See `AGENTS.md` for detailed coding guidelines.

---

## 🏆 Competition

Built for: **Kaggle - Build with Gemma: Multimodal and Long Context**

Target tracks:
1. Digital Equity & Inclusivity ($10,000)
2. Ollama Special Prize ($10,000)
3. Main track prizes

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👤 Author

**Ashhar Ahmad Khan**
- GitHub: [@AshharAhmadKhan](https://github.com/AshharAhmadKhan)
- Live Demo: https://quiettext.vercel.app/

---

## 🙏 Acknowledgments

- OpenDyslexic font for dyslexia-friendly typography
- Ollama for local AI inference
- Groq for fast cloud inference
- Google AI Studio for Gemma 4 vision capabilities
