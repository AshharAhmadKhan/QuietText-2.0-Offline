import { useState, useEffect } from 'react';
import { getAIMode, setAIMode, getGeminiKey, saveGeminiKey } from '../lib/ai';
import { checkOllama } from '../lib/ollama';
import { checkGemini } from '../lib/gemini';

const GEMMA_MODELS = ['gemma4:e4b', 'gemma4:latest', 'gemma4:9b', 'gemma4:e2b', 'gemma4:2b'];

export default function AIStatus({ ollamaModel, onOllamaModelChange, onModeChange }) {
  const [mode,         setMode]         = useState(getAIMode());
  const [geminiOk,     setGeminiOk]     = useState(null);
  const [ollamaOk,     setOllamaOk]     = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [ollamaError,  setOllamaError]  = useState('');
  const [showGemKey,   setShowGemKey]   = useState(false);
  const [gemDraft,     setGemDraft]     = useState('');

  const check = async () => {
    const m = getAIMode();
    if (m === 'ollama') {
      setOllamaOk(null);
      const r = await checkOllama();
      if (r.ok) {
        const gemma = r.models.filter(x => x.startsWith('gemma4'));
        setOllamaModels(gemma);
        if (gemma.length === 0) {
          setOllamaOk(false);
          setOllamaError('No Gemma 4 models. Run: ollama pull gemma4:e4b');
        } else {
          if (!ollamaModel || !gemma.includes(ollamaModel)) onOllamaModelChange(gemma[0]);
          setOllamaOk(true); setOllamaError('');
        }
      } else {
        setOllamaOk(false); setOllamaError(r.error || 'Ollama offline');
      }
    } else {
      setGeminiOk(null);
      const r = await checkGemini(getGeminiKey());
      setGeminiOk(r.ok);
    }
  };

  useEffect(() => { check(); }, [mode]);

  const toggleMode = () => {
    const newMode = mode === 'online' ? 'ollama' : 'online';
    setMode(newMode); setAIMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  const saveGem = () => { saveGeminiKey(gemDraft.trim()); setShowGemKey(false); setGemDraft(''); setGeminiOk(true); };

  const hasGem  = !!getGeminiKey();

  const pill = (bg, color, border, label) => (
    <span style={{ padding: '2px 10px', borderRadius: 10, background: bg, color, border: border || 'none', fontSize: 11, fontWeight: 700 }}>{label}</span>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', borderBottom: '1px solid #E8E6E1', background: '#fff', fontSize: 12, flexWrap: 'wrap' }}>

      {/* Mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#6E6E73', fontWeight: 600 }}>Mode:</span>
        <button onClick={toggleMode} style={{
          padding: '3px 12px', borderRadius: 12, cursor: 'pointer',
          background: mode === 'online' ? '#ffffff' : '#a88f6b',
          color: mode === 'online' ? '#1C1C1E' : '#fff',
          border: mode === 'online' ? '1.5px solid #D0CEC9' : 'none',
          fontSize: 11, fontWeight: 700
        }}>
          {mode === 'online' ? '⚡ Online' : '📡 Offline (Ollama)'}
        </button>
      </div>

      {/* Online status */}
      {mode === 'online' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: geminiOk === null ? '#6E6E73' : geminiOk ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            <span style={{ color: geminiOk ? '#10b981' : '#6E6E73' }}>
              {geminiOk === null ? 'Checking...' : geminiOk ? '✓ Ready to go!' : hasGem ? '✗ Gemini key invalid' : '✗ No Gemini key'}
            </span>
          </div>

          <button onClick={() => setShowGemKey(v => !v)} style={{ fontSize: 10, color: '#6E6E73', background: 'none', border: '1px solid #E8E6E1', borderRadius: 4, padding: '2px 7px', cursor: 'pointer' }}>
            {hasGem ? '🔑 Gemini' : '🔑 Add Gemini Key'}
          </button>
        </>
      )}

      {/* Ollama status */}
      {mode === 'ollama' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ollamaOk === null ? '#6E6E73' : ollamaOk ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            <span style={{ color: ollamaOk ? '#10b981' : '#ef4444' }}>
              {ollamaOk === null ? 'Checking Ollama...' : ollamaOk ? '✓ Ollama ready' : `✗ ${ollamaError}`}
            </span>
          </div>
          {ollamaOk && ollamaModels.length > 0 && (
            <select value={ollamaModel || ''} onChange={e => onOllamaModelChange(e.target.value)}
              style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #E8E6E1', fontSize: 11, color: '#1C1C1E', background: '#fff' }}>
              {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </>
      )}

      {/* Gemini key input */}
      {showGemKey && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%', marginTop: 4 }}>
          <input type="password" value={gemDraft} onChange={e => setGemDraft(e.target.value)}
            placeholder="Google AI Studio key (AIza...)" onKeyDown={e => e.key === 'Enter' && saveGem()}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #E8E6E1', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} autoFocus />
          <button onClick={saveGem} style={{ padding: '6px 14px', background: '#a88f6b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Save</button>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#a88f6b', textDecoration: 'underline' }}>Get free key ↗</a>
        </div>
      )}

      <button onClick={check} title="Refresh" style={{ marginLeft: 'auto', fontSize: 11, color: '#6E6E73', background: 'none', border: 'none', cursor: 'pointer' }}>↻</button>
    </div>
  );
}
