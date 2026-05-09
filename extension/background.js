importScripts("groq.js");
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "quiettext-analyse", title: "Simplify with QuietText 2.0", contexts: ["selection"] });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "quiettext-analyse" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, { type: "OPEN_PANEL", text: info.selectionText }, () => { void chrome.runtime.lastError; });
  }
});
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-panel") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => window.getSelection().toString().trim() }, (results) => {
        if (chrome.runtime.lastError) return;
        const text = results?.[0]?.result || "";
        chrome.tabs.sendMessage(tabs[0].id, { type: "OPEN_PANEL", text }, () => { void chrome.runtime.lastError; });
      });
    });
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_TAB") {
    chrome.tabs.create({ url: message.url });
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === "EXPLAIN_HIGHLIGHT") {
    (async () => {
      try {
        const data = await chrome.storage.local.get(["groq_api_key"]);
        const result = await callGroq(PROMPTS.explainHighlight, message.text, data.groq_api_key || null);
        sendResponse({ result });
      } catch (e) { sendResponse({ error: e.message }); }
    })();
    return true;
  }
});
