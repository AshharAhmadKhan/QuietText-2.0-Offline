// localStorage version — same mutex pattern as v1.0 storage.js
const KEY = 'qt2_history';
const MAX = 20; // more than v1.0's 5, we have localStorage space

let lock = false;
const queue = [];

export function saveToHistory(entry) {
  if (!entry?.original || !entry?.result) return;
  if (lock) { queue.push(entry); return; }
  lock = true;

  try {
    const history = getHistory();
    const bytes = new Uint32Array(2);
    crypto.getRandomValues(bytes);
    const id = Date.now() + '_' + bytes[0].toString(36);
    const newEntry = {
      id,
      preview: entry.original.slice(0, 60),
      original: entry.original,
      result: entry.result,
      type: entry.type || 'simplify',
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...history].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('QuietText storage error:', e);
  } finally {
    lock = false;
    if (queue.length > 0) saveToHistory(queue.shift());
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
// ─── Word Bank ───────────────────────────────────────────────────────────────
const WB_KEY = 'qt2_wordbank';
const WB_MAX = 200;

export function saveWord(word, definition) {
  if (!word || !definition) return;
  try {
    const bank = getWordBank();
    const already = bank.find(e => e.word.toLowerCase() === word.toLowerCase());
    if (already) return;
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const id = Date.now() + '_' + bytes[0].toString(36);
    const entry = {
      id,
      word,
      definition,
      timestamp: new Date().toISOString()
    };
    const updated = [entry, ...bank].slice(0, WB_MAX);
    localStorage.setItem(WB_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('QuietText wordbank error:', e);
  }
}

export function getWordBank() {
  try {
    return JSON.parse(localStorage.getItem(WB_KEY) || '[]');
  } catch { return []; }
}

export function deleteWord(id) {
  try {
    const updated = getWordBank().filter(e => e.id !== id);
    localStorage.setItem(WB_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('QuietText wordbank delete error:', e);
  }
}

export function clearWordBank() {
  localStorage.removeItem(WB_KEY);
}
