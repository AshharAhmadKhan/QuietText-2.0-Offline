# QuietText Extension

You're reading an article. The text is cramped. The words blur together. You lose your place. Again.

For dyslexic readers, every webpage is a struggle. Dense text. Tight spacing. Words that blur together.

This extension fixes that. It makes any webpage readable. Instantly. On any site. It's invisible until you need it, then it's there.

This was the original QuietText. My 6th semester minor project. I wanted to help people who struggle with reading. Now it's part of QuietText 2.0, working alongside the web app to make reading accessible everywhere.

## What It Does

### Reading Presets

Click the extension icon. Choose how you want to read:

**Mild**: Subtle changes. 17px text, relaxed spacing. For when you just need a little help.

**Comfort**: Moderate changes. 19px OpenDyslexic font, comfortable line height. For everyday reading.

**Focus**: Maximum readability. 21px text, wide spacing, high contrast. For when you need complete clarity.

One click. Any page transforms. Any page becomes readable.

### Send to QuietText

Select any text on any page. Right-click and choose "Send to QuietText 2.0". Or press Ctrl+Shift+Q.

A new tab opens with the web app. Your text is already there, ready to simplify.

From any page to plain language in two clicks.

### Smart Highlight Tooltip

Highlight any text. Wait 2 seconds. A small tooltip appears with a simplified explanation.

Powered by Gemma 4. Get help without leaving the page.

You'll need a Gemini API key for this. Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). The key stays in your browser. Nothing is tracked.

## How to Install

1. Download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension/` folder

The extension icon appears in your toolbar. Pin it for quick access.

## How to Use

**Apply a reading preset**: Click the extension icon. Choose Mild, Comfort, or Focus. The current page changes instantly.

**Send text to simplify**: Select text. Press Ctrl+Shift+Q (or Cmd+Shift+Q on Mac). The web app opens with your text ready.

**Get instant explanations**: Highlight text. Wait 2 seconds. Read the tooltip. Click outside to close it.

**Add your API key**: Click the extension icon. Go to Settings tab. Paste your Gemini API key. Click Save.

That's it.

## Privacy

Your reading is private.

This extension doesn't track you. It doesn't collect data. It doesn't send anything to a server except when you use the smart highlight tooltip, and even then it only sends the highlighted text you selected.

Your API key is stored in Chrome's local storage. It never leaves your browser.

The extension needs these permissions:
- `contextMenus`: For the right-click menu
- `activeTab`: To read selected text
- `storage`: To save your API key locally

No broad permissions. No background tracking. Just help when you ask for it.

## Troubleshooting

**Context menu doesn't appear**: Make sure the extension is enabled in `chrome://extensions/`. Refresh the page.

**Tooltip doesn't work**: Add your Gemini API key in the extension settings.

**Font doesn't change**: Some sites override styles. Try Focus mode, which forces the changes.

**Text doesn't send to web app**: Check that the web app is accessible. The extension opens `https://quiet-text-2-0-offline.vercel.app` by default.

## For Developers

The extension uses vanilla JavaScript. No build step. No dependencies.

To modify:
1. Edit files in `extension/` folder
2. Go to `chrome://extensions/`
3. Click refresh on the QuietText card
4. Reload any open tabs

Files:
- `manifest.json`: Extension config
- `popup.html/js`: Settings interface
- `content.js/css`: Runs on every page
- `background.js`: Context menu and shortcuts
- `gemini.js`: API client for tooltips
- `fonts/`: OpenDyslexic font files

## Author

Built by Ashhar Ahmad Khan as part of QuietText 2.0.

Main project: [https://github.com/AshharAhmadKhan/QuietText-2.0-Offline](https://github.com/AshharAhmadKhan/QuietText-2.0-Offline)
