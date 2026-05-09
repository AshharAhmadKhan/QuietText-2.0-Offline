// storage.js
// Chrome storage read/write helpers for result history.
// Stores max 5 entries. No database. No sync. No server.

const HISTORY_KEY = 'quiettext_history';
const MAX_ENTRIES = 5;

// Mutex to prevent concurrent saves
let saveLock = false;
const saveQueue = [];

function saveResult(entry) {
  // Validate entry before saving
  if (!entry || typeof entry !== 'object') {
    console.error('QuietText: Invalid entry object');
    return;
  }
  if (!entry.original || typeof entry.original !== 'string') {
    console.error('QuietText: Missing or invalid original text');
    return;
  }
  if (!entry.simplified || typeof entry.simplified !== 'string') {
    console.error('QuietText: Missing or invalid simplified text');
    return;
  }
  if (!entry.metrics || typeof entry.metrics !== 'object') {
    console.error('QuietText: Missing or invalid metrics');
    return;
  }

  // Fix 1: Queue saves if lock is active
  if (saveLock) {
    saveQueue.push(entry);
    return;
  }

  saveLock = true;
  
  chrome.storage.local.get([HISTORY_KEY], (data) => {
    const history = data[HISTORY_KEY] || [];
    
    // Fix 2: Better ID generation using crypto
    const randomBytes = new Uint32Array(2);
    crypto.getRandomValues(randomBytes);
    const uniqueId = Date.now() + '_' + randomBytes[0].toString(36) + randomBytes[1].toString(36);
    
    const newEntry = {
      id:         uniqueId,
      preview:    entry.original.slice(0, 60),
      original:   entry.original,
      simplified: entry.simplified,
      metrics:    entry.metrics,
      timestamp:  new Date().toISOString() // Fix 14: ISO format
    };
    
    // Prepend new entry, keep only last 5
    const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
    
    // Fix 6: Check storage quota before saving
    const estimatedSize = JSON.stringify(updated).length;
    if (estimatedSize > 5000000) { // ~5MB limit (conservative)
      console.error('QuietText: Storage quota exceeded');
      saveLock = false;
      processQueue();
      return;
    }
    
    chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => {
      // Fix 5: Better error handling
      if (chrome.runtime.lastError) {
        console.error('QuietText storage error:', chrome.runtime.lastError);
      }
      saveLock = false;
      processQueue();
    });
  });
}

// Fix 1: Process queued saves
function processQueue() {
  if (saveQueue.length > 0) {
    const nextEntry = saveQueue.shift();
    saveResult(nextEntry);
  }
}

// Functions available globally in browser context
