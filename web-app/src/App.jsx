import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AIStatus from './components/AIStatus';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';
import MetricsChart from './components/MetricsChart';
import ImageUpload from './components/ImageUpload';
import PDFUpload from './components/PDFUpload';
import QAPanel from './components/QAPanel';
import AssignmentPanel from './components/AssignmentPanel';
import StudyGuidePanel from './components/StudyGuidePanel';
import ExamPanel from './components/ExamPanel';
import WordBankPanel from './components/WordBankPanel';
import SettingsPanel, { getPrefs } from './components/SettingsPanel';
import { callAI, PROMPTS, getAIMode } from './lib/ai';
import { saveToHistory, getHistory, clearHistory } from './lib/storage';
import { calculateMetrics } from './lib/metricsWrapper';

const MAX_CHARS = 400000;
const VALID_LEVELS    = ['grade3', 'grade6', 'grade9', 'adult'];
const VALID_LANGUAGES = ['English', 'Hindi', 'Urdu', 'Bengali', 'Arabic', 'Spanish', 'French'];
const VALID_STYLES    = ['plain', 'bullets', 'steps'];

export default function App() {
  const [activeView,   setActiveView]   = useState('simplify');
  const [inputText,    setInputText]    = useState('');
  const [level,        setLevel]        = useState(() => getPrefs().defaultLevel || 'adult');
  const [language,     setLanguage]     = useState(() => getPrefs().defaultLanguage || 'English');
  const [explainStyle, setExplainStyle] = useState('plain');
  const [model,        setModel]        = useState('');
  const [result,       setResult]       = useState('');
  const [resultLabel,  setResultLabel]  = useState('Simplified Text');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [hasResult,    setHasResult]    = useState(false);
  const [metrics,      setMetrics]      = useState(null);
  const [currentDocument, setCurrentDocument] = useState('');
  const [mode,         setMode]         = useState(getAIMode());
  const [showStudyGuide, setShowStudyGuide] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);

  // Read text from URL parameter when app loads (from extension)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlText = params.get('text');
    if (urlText) {
      setInputText(urlText);
      setActiveView('simplify');
    }
  }, []);

  const sanitize = (text) => {
    if (!text || typeof text !== 'string') return '';
    const t = text.trim();
    return t.length > MAX_CHARS ? t.slice(0, MAX_CHARS) : t;
  };

  const safeLevel = VALID_LEVELS.includes(level)        ? level        : 'adult';
  const safeLang  = VALID_LANGUAGES.includes(language)  ? language     : 'English';
  const safeStyle = VALID_STYLES.includes(explainStyle) ? explainStyle : 'plain';

  const isReady = () => {
    const m = getAIMode();
    if (m === 'online') return true;
    return !!model;
  };

  const handleSimplify = async () => {
    const clean = sanitize(inputText);
    if (!clean) return;
    if (!isReady()) {
      setError('No Ollama model selected. Switch to Online mode or run: ollama serve');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setMetrics(null);
    setHasResult(true);
    setShowStudyGuide(false);
    setShowExam(false);

    try {
      const system = PROMPTS.simplify(safeLevel, safeLang);

      const output = await callAI({ ollamaModel: model, system, prompt: clean, purpose: 'text' });
      setResult(output);
      setResultLabel('Simplified Text');
      setCurrentDocument(clean);

      const before = calculateMetrics(clean);
      const after  = calculateMetrics(output);
      setMetrics({ before, after });

      saveToHistory({ original: clean, result: output, type: 'simplify' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    const clean = sanitize(inputText);
    if (!clean) return;
    if (!isReady()) {
      setError('No Ollama model selected. Switch to Online mode or run: ollama serve');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setMetrics(null);
    setHasResult(true);
    setShowStudyGuide(false);
    setShowExam(false);

    try {
      const promptMap = {
        plain:   PROMPTS.explainPlain(safeLang),
        bullets: PROMPTS.explainBullets(safeLang),
        steps:   PROMPTS.explainSteps(safeLang),
      };
      const system = promptMap[safeStyle] || PROMPTS.explainPlain(safeLang);
      const labelMap = { plain: 'Explanation', bullets: 'Key Points', steps: 'Step by Step' };

      const output = await callAI({ ollamaModel: model, system, prompt: clean, purpose: 'text' });
      setResult(output);
      setResultLabel(labelMap[safeStyle] || 'Explanation');

      saveToHistory({ original: clean, result: output, type: 'explain' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageProcess = async (base64, mimeType) => {
    if (!base64) return;
    if (!isReady()) {
      setError('No Ollama model selected. Switch to Online mode or run: ollama serve');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    setMetrics(null);
    setHasResult(true);
    setShowStudyGuide(false);
    setShowExam(false);
    try {
      const output = await callAI({
        ollamaModel: model,
        system: PROMPTS.imageSimplify(language),
        prompt: 'Read all the text in this image and rewrite it in simple language.',
        images: [base64, mimeType],
        purpose: 'text'
      });
      setResult(output);
      setResultLabel('Simplified Image Text');
      setCurrentDocument(output);
      saveToHistory({ original: '[Image upload]', result: output, type: 'image' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePDFProcess = async (pdfBase64) => {
    if (!pdfBase64) return;
    if (!isReady()) {
      setError('No Ollama model selected. Switch to Online mode or run: ollama serve');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    setMetrics(null);
    setHasResult(true);
    setShowStudyGuide(false);
    setShowExam(false);

    try {
      const system = PROMPTS.simplify(level, language);
      
      const output = await callAI({
        ollamaModel: model,
        system,
        prompt: 'Read this entire PDF document and rewrite it in simple, clear language. Use short sentences. Keep all important information.',
        pdf: pdfBase64,
        purpose: 'text'
      });
      setResult(output);
      setResultLabel('Simplified PDF');
      setCurrentDocument(output);
      saveToHistory({ original: '[PDF upload]', result: output, type: 'pdf' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Now receives history array from QAPanel and builds proper multi-turn messages
  const handleQA = async (question, history = []) => {
    if (!currentDocument || !question) return '';
    try {
      // Build conversation context from history (last 6 turns to keep context manageable)
      const recentHistory = history.slice(-6);
      const historyText = recentHistory.length > 1
        ? '\n\nConversation so far:\n' + recentHistory.slice(0, -1).map(m =>
            (m.role === 'user' ? 'Student: ' : 'Tutor: ') + m.text
          ).join('\n')
        : '';

      const output = await callAI({
        ollamaModel: model,
        system: PROMPTS.qa(currentDocument, language),
        prompt: historyText + '\n\nStudent: ' + question,
        purpose: 'qa'
      });
      return output;
    } catch (e) {
      return 'Error: ' + e.message;
    }
  };

  const loadHistory = () => {
    setHistoryEntries(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryEntries([]);
  };

  const handleRestoreFromHistory = (entry) => {
    setResult(entry.result);
    setResultLabel('Simplified Text');
    setCurrentDocument(entry.original !== '[PDF upload]' && entry.original !== '[Image upload]' ? entry.original : entry.result);
    setHasResult(true);
    setMetrics(null);
    setShowStudyGuide(false);
    setShowExam(false);
    setActiveView('simplify');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F2F0EB', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AIStatus ollamaModel={model} onOllamaModelChange={setModel} onModeChange={setMode} />

      <header style={{ background: 'linear-gradient(135deg, #3d3428 0%, #5a4d3a 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F2F0EB', letterSpacing: '0.04em', fontFamily: 'system-ui, sans-serif', margin: 0, lineHeight: 1.2 }}>QuietText 2.0</h1>
          <p style={{ fontSize: 11, color: '#9a9a9f', fontStyle: 'italic', marginTop: 3, fontFamily: 'system-ui, sans-serif' }}>{mode === 'ollama' ? 'Runs fully offline with Ollama · Nothing leaves your machine' : 'Your AI reading assistant · Powered by Google AI'}</p>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar activeView={activeView} onViewChange={(v) => { setActiveView(v); if (v === 'history') loadHistory(); }} />

        <div style={{ flex: 1, background: '#F2F0EB', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {activeView === 'simplify' && (
            <>
              <section aria-label="Text input" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <InputPanel
                  inputText={inputText}
                  onInputChange={setInputText}
                  level={level}
                  onLevelChange={setLevel}
                  language={language}
                  onLanguageChange={setLanguage}
                  loading={loading}
                  onSimplify={handleSimplify}
                  onExplain={handleExplain}
                  explainStyle={explainStyle}
                  onExplainStyleChange={setExplainStyle}
                />
              </section>

              {hasResult && (
                <section aria-label="Result" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <ResultPanel result={result} resultLabel={resultLabel} loading={loading} error={error} ollamaModel={model} language={language} />
                </section>
              )}

              {hasResult && currentDocument && !loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 4 }}>
                  <button
                    onClick={() => { setShowExam(v => !v); setShowStudyGuide(false); }}
                    style={{
                      background: showExam ? '#3d3428' : '#f5f3ef',
                      color: showExam ? '#F2F0EB' : '#3d3428',
                      border: '1px solid #3d3428', borderRadius: 8,
                      padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {showExam ? 'Hide Test' : 'Test Yourself'}
                  </button>
                  <button
                    onClick={() => { setShowStudyGuide(v => !v); setShowExam(false); }}
                    style={{
                      background: showStudyGuide ? '#3d3428' : '#f5f3ef',
                      color: showStudyGuide ? '#F2F0EB' : '#3d3428',
                      border: '1px solid #3d3428', borderRadius: 8,
                      padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {showStudyGuide ? 'Hide Study Guide' : 'Generate Study Guide'}
                  </button>
                </div>
              )}

              {showStudyGuide && currentDocument && (
                <section style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <StudyGuidePanel document={currentDocument} ollamaModel={model} language={language} onClose={() => setShowStudyGuide(false)} />
                </section>
              )}
              {showExam && currentDocument && (
                <section style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <ExamPanel document={currentDocument} ollamaModel={model} language={language} onClose={() => setShowExam(false)} />
                </section>
              )}

              {metrics && !loading && (
                <section aria-label="Readability metrics" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <MetricsChart before={metrics.before} after={metrics.after} />
                </section>
              )}

              {!hasResult && (
                <div style={{ textAlign: 'center', padding: '16px 20px', color: '#6E6E73', fontFamily: 'system-ui, sans-serif' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#1C1C1E', marginBottom: 6 }}>Ready when you are. Paste your text above.</p>
                  <p style={{ fontSize: 13, color: '#6E6E73', marginBottom: 4 }}>Any text. Any length. Any topic.</p>
                  <p style={{ fontSize: 12, color: '#a88f6b', marginTop: 10 }}>Ctrl+Enter to simplify · Works online and offline</p>
                </div>
              )}
            </>
          )}

          {activeView === 'pdf' && (
            <>
              <section aria-label="PDF upload" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <PDFUpload onProcess={handlePDFProcess} loading={loading} />
              </section>

              {hasResult && (
                <section aria-label="Result" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <ResultPanel result={result} resultLabel={resultLabel} loading={loading} error={error} ollamaModel={model} language={language} />
                </section>
              )}

              {hasResult && currentDocument && !loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 4 }}>
                  <button
                    onClick={() => { setShowExam(v => !v); setShowStudyGuide(false); }}
                    style={{
                      background: showExam ? '#3d3428' : '#f5f3ef',
                      color: showExam ? '#F2F0EB' : '#3d3428',
                      border: '1px solid #3d3428', borderRadius: 8,
                      padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {showExam ? 'Hide Test' : 'Test Yourself'}
                  </button>
                  <button
                    onClick={() => { setShowStudyGuide(v => !v); setShowExam(false); }}
                    style={{
                      background: showStudyGuide ? '#3d3428' : '#f5f3ef',
                      color: showStudyGuide ? '#F2F0EB' : '#3d3428',
                      border: '1px solid #3d3428', borderRadius: 8,
                      padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {showStudyGuide ? 'Hide Study Guide' : 'Generate Study Guide'}
                  </button>
                </div>
              )}

              {showStudyGuide && currentDocument && (
                <section style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <StudyGuidePanel document={currentDocument} ollamaModel={model} language={language} onClose={() => setShowStudyGuide(false)} />
                </section>
              )}
              {showExam && currentDocument && (
                <section style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <ExamPanel document={currentDocument} ollamaModel={model} language={language} onClose={() => setShowExam(false)} />
                </section>
              )}
            </>
          )}

          {activeView === 'image' && (
            <>
              <section aria-label="Image upload" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <ImageUpload onProcess={handleImageProcess} loading={loading} />
              </section>

              {hasResult && (
                <section aria-label="Result" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <ResultPanel result={result} resultLabel={resultLabel} loading={loading} error={error} ollamaModel={model} language={language} />
                </section>
              )}

              {hasResult && currentDocument && !loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 4 }}>
                  <button
                    onClick={() => { setShowExam(v => !v); setShowStudyGuide(false); }}
                    style={{
                      background: showExam ? '#3d3428' : '#f5f3ef',
                      color: showExam ? '#F2F0EB' : '#3d3428',
                      border: '1px solid #3d3428', borderRadius: 8,
                      padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {showExam ? 'Hide Test' : 'Test Yourself'}
                  </button>
                  <button
                    onClick={() => { setShowStudyGuide(v => !v); setShowExam(false); }}
                    style={{
                      background: showStudyGuide ? '#3d3428' : '#f5f3ef',
                      color: showStudyGuide ? '#F2F0EB' : '#3d3428',
                      border: '1px solid #3d3428', borderRadius: 8,
                      padding: '8px 18px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {showStudyGuide ? 'Hide Study Guide' : 'Generate Study Guide'}
                  </button>
                </div>
              )}

              {showStudyGuide && currentDocument && (
                <section style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <StudyGuidePanel document={currentDocument} ollamaModel={model} language={language} onClose={() => setShowStudyGuide(false)} />
                </section>
              )}
              {showExam && currentDocument && (
                <section style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <ExamPanel document={currentDocument} ollamaModel={model} language={language} onClose={() => setShowExam(false)} />
                </section>
              )}
            </>
          )}

          {activeView === 'qa' && (
            <section aria-label="Q&A" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <QAPanel onAsk={handleQA} loading={loading} currentDocument={currentDocument} />
            </section>
          )}

          {activeView === 'assignment' && (
            <section aria-label="Assignment Decoder" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <AssignmentPanel ollamaModel={model} language={language} />
            </section>
          )}

          {activeView === 'wordbank' && (
            <section aria-label="Word Bank" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <WordBankPanel />
            </section>
          )}

          {activeView === 'history' && (
            <section aria-label="History" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'system-ui, sans-serif' }}>History</div>
                {historyEntries.length > 0 && (
                  <button onClick={handleClearHistory} style={{ fontSize: 11, color: '#9a9a9f', background: 'none', border: '1px solid #E8E6E1', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                    Clear all
                  </button>
                )}
              </div>
              {historyEntries.length === 0 ? (
                <p style={{ fontSize: 14, color: '#6E6E73', fontFamily: 'system-ui, sans-serif' }}>Nothing here yet. Start simplifying to build your history.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {historyEntries.map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => handleRestoreFromHistory(entry)}
                      style={{
                        padding: '12px 14px', borderRadius: 10, border: '1px solid #E8E6E1',
                        background: '#FAFAF8', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#a88f6b'; e.currentTarget.style.background = '#fdf9f4'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E1'; e.currentTarget.style.background = '#FAFAF8'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#a88f6b', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui, sans-serif' }}>
                          {entry.type || 'simplify'}
                        </span>
                        <span style={{ fontSize: 10, color: '#9a9a9f', fontFamily: 'system-ui, sans-serif' }}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#1C1C1E', fontFamily: 'OpenDyslexic, sans-serif', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.preview}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeView === 'settings' && (
            <section aria-label="Settings" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <SettingsPanel onPrefsChange={(prefs) => {
                if (prefs.defaultLevel)    setLevel(prefs.defaultLevel);
                if (prefs.defaultLanguage) setLanguage(prefs.defaultLanguage);
              }} />
            </section>
          )}

        </div>
      </main>

      <footer style={{ borderTop: '1px solid #E8E6E1', padding: '10px 24px 10px 192px', textAlign: 'center', fontSize: 11, color: '#6E6E73', fontFamily: 'system-ui, sans-serif', background: '#FFFFFF' }}>
        {mode === 'ollama' ? '100% offline · Powered by Ollama · Your data never leaves your device' : 'Gemma 4 for everything · Keys stay in your browser'}
      </footer>
    </div>
  );
}
