import { useState, useRef, useEffect, useCallback } from 'react';
import { callAI, PROMPTS, getAIMode, getGroqKey } from '../lib/ai';
import { saveWord } from '../lib/storage';

function getFontForLanguage(language) {
  const scriptFonts = {
    'Hindi':   '"Noto Sans Devanagari", "Mangal", sans-serif',
    'Urdu':    '"Noto Nastaliq Urdu", "Urdu Typesetting", sans-serif',
    'Bengali': '"Noto Sans Bengali", "Vrinda", sans-serif',
    'Arabic':  '"Noto Sans Arabic", "Arial Unicode MS", sans-serif',
    'Spanish': 'system-ui, sans-serif',
    'French':  'system-ui, sans-serif',
    'English': "OpenDyslexic, sans-serif",
  };
  return scriptFonts[language] || "OpenDyslexic, sans-serif";
}

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
  const [saved,   setSaved]   = useState(false);
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

  // Position popup just below the clicked word, anchored to scroll container
  const containerRect = popupRef.current?.closest('[data-result-container]')?.getBoundingClientRect() || { left: 0, top: 0 };
  const relLeft = Math.min(anchorRect.left - containerRect.left, window.innerWidth - 290);
  const relTop = anchorRect.bottom - containerRect.top + 6;
  const style = {
    position: 'absolute',
    left: Math.max(0, relLeft),
    top: relTop,
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
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6, color: '#9a9a9f', fontSize: 11, padding: '3px 8px',
          cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
        }}>Close</button>
        {def && !saved && (
          <button onClick={() => { saveWord(word, def); setSaved(true); }} style={{
            background: 'rgba(168,143,107,0.25)', border: '1px solid rgba(168,143,107,0.5)',
            borderRadius: 6, color: '#a88f6b', fontSize: 11, padding: '3px 8px',
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
          }}>Save to Word Bank</button>
        )}
        {saved && (
          <span style={{ fontSize: 11, color: '#10b981', padding: '3px 0', fontFamily: 'system-ui, sans-serif' }}>Saved</span>
        )}
      </div>
    </div>
  );
}

function ResultText({ result, onRef, onWordClick, fontFamily = "OpenDyslexic, sans-serif" }) {
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
        fontFamily: fontFamily,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        minHeight: 80,
      }}
    />
  );
}

export default function ResultPanel({ result, resultLabel, loading, error, thinking, ollamaModel = '', language = 'English' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [focusMode,  setFocusMode]  = useState(false);
  const [focusIdx,   setFocusIdx]   = useState(0);
  const [popup, setPopup] = useState(null);
  const resultDomRef = useRef(null);

  useEffect(() => {
    setFocusMode(false);
    setFocusIdx(0);
    return () => { window.speechSynthesis.cancel(); setIsSpeaking(false); if (keepAliveRef && keepAliveRef.current) clearInterval(keepAliveRef.current); };
  }, [result]);

  const getSentences = (text) => {
    if (!text) return [];
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
  };

  const sentences = getSentences(result);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusIdx(i => Math.min(i + 1, sentences.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusIdx(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusMode, sentences.length]);

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

  const speakingRef = useRef(false);
  const keepAliveRef = useRef(null);

  const stopSpeaking = () => {
    speakingRef.current = false;
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
    if (keepAliveRef.current) { clearInterval(keepAliveRef.current); keepAliveRef.current = null; }
  };

  const handleListen = () => {
    if (speakingRef.current) { stopSpeaking(); return; }
    const text = resultDomRef.current?.innerText || resultDomRef.current?.textContent || '';
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.85;
    utt.pitch = 1;
    const langMap = {
      'English': 'en-US', 'Hindi': 'hi-IN', 'Urdu': 'ur-PK',
      'Bengali': 'bn-BD', 'Arabic': 'ar-SA', 'Spanish': 'es-ES', 'French': 'fr-FR'
    };
    utt.lang = langMap[language] || 'en-US';
    utt.onend = () => stopSpeaking();
    utt.onerror = (e) => { if (e.error !== 'interrupted') stopSpeaking(); };
    speakingRef.current = true;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utt);
    // Chrome stops speechSynthesis silently after ~15s — keep it alive
    keepAliveRef.current = setInterval(() => {
      if (!speakingRef.current) { clearInterval(keepAliveRef.current); return; }
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 10000);
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
    <div data-result-container style={{ animation: 'resultIn 0.25s ease both', position: 'relative' }}>
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
          <button onClick={() => { setFocusMode(true); setFocusIdx(0); }} title="Focus Mode: one sentence at a time"
            style={iconBtn(false)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3d3428'; e.currentTarget.style.color = '#3d3428'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E1'; e.currentTarget.style.color = '#6E6E73'; }}>
            Focus
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

      <ResultText result={result} onRef={el => { resultDomRef.current = el; }} onWordClick={handleWordClick} fontFamily={getFontForLanguage(language)} />


      {focusMode && sentences.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(28,28,28,0.92)', zIndex: 9998,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: 680 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <span style={{ fontSize: 12, color: '#9a9a9f', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em' }}>
                SENTENCE {focusIdx + 1} OF {sentences.length}
              </span>
              <button onClick={() => setFocusMode(false)} style={{
                background: 'none', border: '1px solid #3A3A3C', borderRadius: 6,
                color: '#9a9a9f', fontSize: 12, padding: '4px 12px', cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
              }}>Exit Focus</button>
            </div>

            <div style={{ height: 4, background: '#2C2C2E', borderRadius: 2, marginBottom: 48, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: (((focusIdx + 1) / sentences.length) * 100) + '%',
                background: '#a88f6b', borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>

            <div style={{
              fontSize: 26, lineHeight: 1.8, color: '#F2F0EB',
              fontFamily: 'OpenDyslexic, sans-serif',
              textAlign: 'center', marginBottom: 48,
              letterSpacing: '0.04em', wordSpacing: '0.12em',
              minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {sentences[focusIdx]}
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={() => setFocusIdx(i => Math.max(i - 1, 0))}
                disabled={focusIdx === 0}
                style={{
                  background: focusIdx === 0 ? 'none' : '#2C2C2E',
                  border: '1px solid #3A3A3C', borderRadius: 8,
                  color: focusIdx === 0 ? '#3A3A3C' : '#F2F0EB',
                  fontSize: 13, padding: '10px 24px', cursor: focusIdx === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'system-ui, sans-serif', fontWeight: 600,
                  transition: 'all 0.15s',
                }}>
                Previous
              </button>

              {focusIdx < sentences.length - 1 ? (
                <button
                  onClick={() => setFocusIdx(i => i + 1)}
                  style={{
                    background: '#a88f6b', border: 'none', borderRadius: 8,
                    color: '#F2F0EB', fontSize: 14, padding: '12px 36px',
                    cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(168,143,107,0.4)',
                    transition: 'all 0.15s',
                  }}>
                  Next sentence
                </button>
              ) : (
                <button
                  onClick={() => setFocusMode(false)}
                  style={{
                    background: '#10b981', border: 'none', borderRadius: 8,
                    color: '#fff', fontSize: 14, padding: '12px 36px',
                    cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                    transition: 'all 0.15s',
                  }}>
                  Done reading
                </button>
              )}
            </div>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#6E6E73', fontFamily: 'system-ui, sans-serif' }}>
              Space or Arrow Right to advance · Arrow Left to go back · Esc to exit
            </p>
          </div>
        </div>
      )}

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
