# QuietText Chrome Extension

This extension makes any webpage easier to read. It's designed to be invisible until you need it.

## What It Does

### Send Text to QuietText

Select any text on any webpage. Right-click and choose "Send to QuietText 2.0" from the context menu. Or press Ctrl+Shift+Q. A new tab opens with the web app and your selected text already loaded.

This works on news sites, Wikipedia, documentation, social media, anywhere. If you can select it, you can simplify it.

### Apply OpenDyslexic Font

Click the extension icon in your toolbar. Choose a reading preset:

- **Mild** - Subtle changes. Slightly larger text and better spacing.
- **Comfort** - Moderate changes. OpenDyslexic font with comfortable line height.
- **Focus** - Maximum readability. Large text, wide spacing, high contrast.

The changes apply instantly to the current page. Refresh to reset.

### Smart Highlight Tooltip

Highlight any text on a page and wait 2 seconds. A small tooltip appears with a simplified explanation of what you highlighted. This uses Groq for fast responses.

You need to add your Groq API key in the extension popup for this to work. The key is stored locally in your browser.

## How to Install

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked"
5. Select the `extension/` folder from this project

The extension icon appears in your toolbar. Pin it for quick access.

## Setup

Click the extension icon. You'll see a popup with settings:

- **Groq API Key** - Get a free key at [console.groq.com/keys](https://console.groq.com/keys). This is used for the smart highlight tooltip.
- **Reading Presets** - Choose Mild, Comfort, or Focus to change how the current page looks.

Your API key is stored in Chrome's local storage. It never leaves your browser. The extension makes direct API calls from your browser to Groq.

## Privacy

This extension doesn't track you. It doesn't collect data. It doesn't send anything to a server except when you explicitly use the smart highlight feature, and even then it only sends the highlighted text to Groq.

The extension has these permissions:

- `contextMenus` - To add the right-click menu option
- `activeTab` - To read selected text when you use the context menu
- `storage` - To save your API key and preferences locally

That's it. No broad permissions. No background tracking.

## Files

```
extension/
├── manifest.json       Extension configuration
├── popup.html          Settings popup UI
├── popup.js            Settings popup logic
├── content.js          Runs on every webpage
├── content.css         Styles for reading presets
├── background.js       Handles context menu and shortcuts
├── groq.js             Groq API client for tooltips
├── icons/              Extension icons
└── fonts/              OpenDyslexic font files
```

## Keyboard Shortcut

Press **Ctrl+Shift+Q** (or **Cmd+Shift+Q** on Mac) to send selected text to QuietText. This works on any page.

You can change this shortcut in Chrome's extension settings if you want.

## Troubleshooting

**The context menu doesn't appear**

Make sure the extension is enabled in `chrome://extensions/`. Try refreshing the page.

**The smart highlight tooltip doesn't work**

You need to add your Groq API key in the extension popup. Click the extension icon and paste your key.

**The font doesn't change**

Some websites use CSS that overrides the extension's styles. Try the Focus preset, which uses `!important` rules to force the changes.

**Selected text doesn't send to QuietText**

Make sure the web app is accessible. The extension opens `https://quiettext.vercel.app` by default. If you're running the app locally, you'll need to modify `background.js` to point to `http://localhost:5173`.

## Development

To modify the extension:

1. Edit the files in the `extension/` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the QuietText extension card
4. Reload any open tabs to see the changes

The extension uses vanilla JavaScript. No build step. No dependencies. Just edit and reload.

## Author

Built by Ashhar Ahmad Khan as part of QuietText 2.0.

Main project: [https://github.com/AshharAhmadKhan/QuietText-2.0-Offline](https://github.com/AshharAhmadKhan/QuietText-2.0-Offline)
