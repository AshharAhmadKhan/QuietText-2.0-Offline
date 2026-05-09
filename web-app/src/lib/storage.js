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