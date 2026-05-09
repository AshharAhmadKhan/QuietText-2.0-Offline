import { useState, useRef, useEffect, useCallback } from 'react';
import { callAI, PROMPTS, getAIMode, getGroqKey } from '../lib/ai';

function renderMarkdown(text, container) {
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
  safe = safe.replace(/^(\d+)\.\s+/gm, '<span style="font-weight:700;color:#1C1C1E;">$1.</span> ');
  safe = safe.replace(/^[-\u2022]\s+/gm, '<span style="font-weight:700;color:#1C1C1E;margin-right:4px;">\u2022</span> ');
  safe = safe.replace(/\n/g, '<br>');
  container.innerHTML = safe;
}

function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('fetch') || m.includes('network') || m.includes('cannot reach'))
    return 'Cannot reach Ollama. Is it running? Open a terminal and run: ollama serve';
  if (m.includes('timed out') || m.includes('abort'))
    return 'Request timed out. Try shorter text or switch to a smaller model.';
  if (m.includes('model') && m.includes('not found'))
    return 'Model not found. Run: ollama pull gemma4:e2b';
  if (m.includes('memory') || m.includes('ram'))
    return 'Not enough RAM. Close other apps and try again, or use gemma4:e2b.';
  if (m.includes('rate limit'))
    return 'Rate limit hit. Wait 10 seconds and try again.';
  return msg;
}

function WordPopup({ word, anchorRect, onClose, ollamaModel }) {
  const [def,     setDef]     = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchDef = async () => {
      try {
        const result = await callAI({
          ollamaModel,
          system: PROMPTS.define(word),
          prompt: word,
        });
        setDef(result);
      } catch (e) {
        setError('Could not define this word.');
      } finally {
        setLoading(false);
      }
    };
    fetchDef();
  }, [word]);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Position popup above the clicked word
  const style = {
    position: 'fixed',
    left: Math.min(anchorRect.left, window.innerWidth - 280),
    top: anchorRect.bottom + 8,
    transform: 'none',
    width: 260,
    background: '#3d3428',
    color: '#F2F0EB',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 13,
    lineHeight: 1.6,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    zIndex: 9999,
    fontFamily: 'system-ui, sans-serif',
  };

  return (
    <div ref={popupRef} style={style}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#a88f6b' }}>
        {word}
      </div>
      {loading && <div style={{ color: '#9a9a9f', fontSize: 12 }}>Defining...</div>}
      {error   && <div style={{ color: '#ff8a80', fontSize: 12 }}>{error}</div>}
      {def     && <div>{def}</div>}
      <button onClick={onClose} style={{
        marginTop: 10, background: 'none', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6, color: '#9a9a9f', fontSize: 11, padding: '3px 8px',
        cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
      }}>Close</button>
    </div>
  );
}

function ResultText({ result, onRef, onWordClick }) {
  const localRef = useRef(null);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    if (!result) { el.textContent = ''; return; }
    renderMarkdown(result, el);

    // Wrap every word in a clickable span
    const walk = (node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        const parts = node.textContent.split(/(\b[a-zA-Z]{3,}\b)/g);
        parts.forEach(part => {
          const COMMON = new Set(['the','and','but','for','not','you','are','was','has','had','his','her','our','its','can','may','will','did','get','got','let','put','set','say','see','use','two','one','all','any','few','how','who','why','what','when','this','that','with','from','they','them','than','then','been','have','were','also','into','more','some','much','just','each','your','their','said','like','time','well','good','make','come','take','give','know','think','look','want','tell','feel','seem','even','most','over','such','here','there','where','which','while','after','before','about','would','could','should','these','those','very','only','back','still','through']);
        if (/^[a-zA-Z]{4,}$/.test(part) && !COMMON.has(part.toLowerCase())) {
            const span = document.createElement('span');
            span.textContent = part;
            span.style.cssText = 'cursor:pointer;border-bottom:1px dotted #a88f6b;';
            span.addEventListener('mouseenter', e => { e.target.style.background = 'rgba(168,143,107,0.15)'; });
            span.addEventListener('mouseleave', e => { e.target.style.background = ''; });
            span.addEventListener('click', e => {
              e.stopPropagation();
              onWordClick(part, e.target.getBoundingClientRect());
            });
            frag.appendChild(span);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !['SCRIPT','STYLE'].includes(node.tagName)) {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    walk(el);
  }, [result]);

  return (
    <div
      ref={el => { localRef.current = el; onRef(el); }}
      aria-label="Simplified text result"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E6E1',
        borderRadius: 8,
        padding: '14px 16px',
        fontSize: 14,
        lineHeight: 1.9,
        letterSpacing: '0.05em',
        wordSpacing: '0.1em',
        color: '#1C1C1E',
        fontFamily: "'OpenDyslexic', sans-serif",
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        minHeight: 80,
      }}
    />
  );
}

export default function ResultPanel({ result, resultLabel, loading, error, thinking, ollamaModel = '' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [popup, setPopup] = useState(null);
  const resultDomRef = useRef(null);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
  }, [result]);

  const handleWordClick = useCallback((word, rect) => {
    setPopup({ word, rect });
  }, []);

  const handleCopy = async () => {
    const text = resultDomRef.current?.innerText || resultDomRef.current?.textContent || '';
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Copied', 'success'); }
      catch { showToast('Copy failed. Select text manually.', 'error'); }
      document.body.removeChild(ta);
    }
  };

  const handleListen = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = resultDomRef.current?.innerText || resultDomRef.current?.textContent || '';
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.pitch = 1;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
  };

  const iconBtn = (active) => ({
    background: active ? '#1C1C1E' : 'none',
    border: `1px solid ${active ? '#1C1C1E' : '#E8E6E1'}`,
    borderRadius: 6,
    color: active ? '#F2F0EB' : '#6E6E73',
    fontSize: 12,
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 500,
  });

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label={thinking ? 'Thinking...' : 'Simplifying...'}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6E6E73', marginBottom: 4 }}>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✨</span>
          <span>{thinking ? 'Thinking carefully...' : 'Simplifying...'}</span>
        </div>
        {[100, 90, 75, 82, 60].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" style={{
        padding: '12px 14px', background: '#FFF0F0', border: '1px solid #FFCDD2',
        borderRadius: 8, fontSize: 13, color: '#C62828',
        fontFamily: 'system-ui, sans-serif', lineHeight: 1.6,
      }}>
        {friendlyError(error)}
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ animation: 'resultIn 0.25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'system-ui, sans-serif' }}>
            {resultLabel}
          </span>
          <span style={{ fontSize: 10, color: '#a88f6b', marginLeft: 10, fontFamily: 'system-ui, sans-serif' }}>
            Tap any word for a definition
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleCopy} title="Copy to clipboard" aria-label="Copy result to clipboard"
            style={iconBtn(false)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1C1C1E'; e.currentTarget.style.color = '#1C1C1E'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E1'; e.currentTarget.style.color = '#6E6E73'; }}>
            Copy
          </button>
          <button onClick={handleListen} title={isSpeaking ? 'Stop' : 'Read aloud'}
            aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'} aria-pressed={isSpeaking}
            style={iconBtn(isSpeaking)}
            onMouseEnter={e => { if (!isSpeaking) { e.currentTarget.style.borderColor = '#1C1C1E'; e.currentTarget.style.color = '#1C1C1E'; }}}
            onMouseLeave={e => { if (!isSpeaking) { e.currentTarget.style.borderColor = '#E8E6E1'; e.currentTarget.style.color = '#6E6E73'; }}}>
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
        </div>
      </div>

      <ResultText result={result} onRef={el => { resultDomRef.current = el; }} onWordClick={handleWordClick} />

      {popup && (
        <WordPopup
          word={popup.word}
          anchorRect={popup.rect}
          ollamaModel={ollamaModel}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

function showToast(msg, type) {
  const existing = document.getElementById('qt-copy-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'qt-copy-toast';
  toast.setAttribute('role', 'alert');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', left: '50%',
    transform: 'translateX(-50%)',
    background: type === 'success' ? '#2e7d32' : '#d32f2f',
    color: '#F2F0EB', padding: '10px 20px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: '9999',
    fontFamily: 'system-ui, sans-serif',
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
