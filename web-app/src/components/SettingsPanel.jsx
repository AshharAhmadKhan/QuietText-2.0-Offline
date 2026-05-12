import { useState, useEffect } from 'react';
import { getGeminiKey, saveGeminiKey, getAIMode, setAIMode } from '../lib/ai';

const PREF_KEY = 'qt2_prefs';

export function getPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch { return {}; }
}
export function savePrefs(prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

const ROW = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 };
const LABEL = { fontSize: 10, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'system-ui, sans-serif' };
const SELECT = { padding: '9px 12px', fontSize: 13, border: '1px solid #E8E6E1', borderRadius: 8, color: '#1C1C1E', background: '#FFFFFF', fontFamily: 'system-ui, sans-serif', outline: 'none', cursor: 'pointer' };
const INPUT = { padding: '9px 12px', fontSize: 13, border: '1px solid #E8E6E1', borderRadius: 8, color: '#1C1C1E', background: '#FFFFFF', fontFamily: 'monospace', outline: 'none', width: '100%' };
const DIVIDER = { borderTop: '1px solid #E8E6E1', margin: '4px 0 20px' };
const SECTION = { fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, fontFamily: 'system-ui, sans-serif' };

export default function SettingsPanel({ onPrefsChange }) {
  const prefs = getPrefs();
  const [level,    setLevel]    = useState(prefs.defaultLevel    || 'adult');
  const [language, setLanguage] = useState(prefs.defaultLanguage || 'English');
  const [gemKey,   setGemKey]   = useState(getGeminiKey());
  const [gemDraft,  setGemDraft]  = useState('');
  const [saved,    setSaved]    = useState('');

  const save = (patch) => {
    const updated = { ...getPrefs(), ...patch };
    savePrefs(updated);
    if (patch.defaultLevel)    setLevel(patch.defaultLevel);
    if (patch.defaultLanguage) setLanguage(patch.defaultLanguage);
    setSaved('Saved');
    setTimeout(() => setSaved(''), 1800);
    if (onPrefsChange) onPrefsChange(updated);
  };

  const saveKey = (type) => {
    const k = gemDraft.trim();
    if (!k) return;
    saveGeminiKey(k);
    setGemKey(k);
    setGemDraft('');
    setSaved('Gemini key saved');
    setTimeout(() => setSaved(''), 1800);
  };

  const clearKey = (type) => {
    saveGeminiKey(''); 
    setGemKey('');
    setSaved('Key cleared');
    setTimeout(() => setSaved(''), 1800);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Settings</div>

      {/* Defaults */}
      <div style={SECTION}>Reading Defaults</div>
      <div style={DIVIDER} />

      <div style={ROW}>
        <label style={LABEL}>Default Reading Level</label>
        <select value={level} onChange={e => save({ defaultLevel: e.target.value })} style={SELECT}>
          <option value="grade3">Grade 3 - simple as possible</option>
          <option value="grade6">Grade 6 - everyday language</option>
          <option value="grade9">Grade 9 - clear but detailed</option>
          <option value="adult">Adult - plain professional</option>
        </select>
        <span style={{ fontSize: 11, color: '#a88f6b' }}>This will be pre-selected every time you open the app.</span>
      </div>

      <div style={ROW}>
        <label style={LABEL}>Default Output Language</label>
        <select value={language} onChange={e => save({ defaultLanguage: e.target.value })} style={SELECT}>
          {['English','Hindi','Urdu','Bengali','Arabic','Spanish','French'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <span style={{ fontSize: 11, color: '#a88f6b' }}>Simplified text will always come out in this language.</span>
      </div>

      {/* API Keys */}
      <div style={{ ...SECTION, marginTop: 8 }}>API Key</div>
      <div style={DIVIDER} />

      <div style={ROW}>
        <label style={LABEL}>Gemini API Key</label>
        <div style={{ fontSize: 11, color: '#6E6E73', marginBottom: 6 }}>
          Used for all text, PDFs, images, study guides, and answer checking. Free at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#a88f6b' }}>aistudio.google.com</a>
        </div>
        {gemKey ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✓ Key is set ({gemKey.slice(0,8)}...)</span>
            <button onClick={() => clearKey('gem')} style={{ fontSize: 11, color: '#9a9a9f', background: 'none', border: '1px solid #E8E6E1', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>Remove</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="password" value={gemDraft} onChange={e => setGemDraft(e.target.value)} placeholder="AIza..." onKeyDown={e => e.key === 'Enter' && saveKey('gem')} style={INPUT} />
            <button onClick={() => saveKey('gem')} style={{ padding: '9px 16px', background: '#3d3428', color: '#F2F0EB', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Save Key</button>
          </div>
        )}
      </div>

      {saved && (
        <div style={{ marginTop: 4, fontSize: 12, color: '#10b981', fontWeight: 600 }}>{saved}</div>
      )}

      {/* Data */}
      <div style={{ ...SECTION, marginTop: 8 }}>Data & Privacy</div>
      <div style={DIVIDER} />
      <p style={{ fontSize: 13, color: '#6E6E73', lineHeight: 1.7, marginBottom: 0 }}>
        All your data (history, word bank, API keys, and preferences) is stored only in your browser. Nothing is sent to any server except your text when using Gemini. In offline mode, nothing leaves your device at all.
      </p>
    </div>
  );
}
