import { useState } from 'react';
import Sidebar from './components/Sidebar';
import AIStatus from './components/AIStatus';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';
import MetricsChart from './components/MetricsChart';
import ImageUpload from './components/ImageUpload';
import PDFUpload from './components/PDFUpload';
import QAPanel from './components/QAPanel';
import AssignmentPanel from './components/AssignmentPanel';
import { callAI, PROMPTS, getAIMode } from './lib/ai';
import { saveToHistory } from './lib/storage';
import { calculateMetrics } from './lib/metricsWrapper';

const MAX_CHARS = 400000;
const VALID_LEVELS    = ['grade3', 'grade6', 'grade9', 'adult'];
const VALID_LANGUAGES = ['English', 'Hindi', 'Urdu', 'Bengali', 'Arabic', 'Spanish', 'French'];
const VALID_STYLES    = ['plain', 'bullets', 'steps'];

export default function App() {
  const [activeView,   setActiveView]   = useState('simplify');
  const [inputText,    setInputText]    = useState('');
  const [level,        setLevel]        = useState('adult');
  const [language,     setLanguage]     = useState('English');
  const [explainStyle, setExplainStyle] = useState('plain');
  const [model,        setModel]        = useState('');
  const [result,       setResult]       = useState('');
  const [resultLabel,  setResultLabel]  = useState('Simplified Text');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [hasResult,    setHasResult]    = useState(false);
  const [metrics,      setMetrics]      = useState(null);
  const [pdfText,      setPdfText]      = useState('');
  const [currentDocument, setCurrentDocument] = useState('');
  const [pdfFileName,  setPdfFileName]  = useState('');
  const [mode,         setMode]         = useState(getAIMode());

  const sanitize = (text) => {
    if (!text || typeof text !== 'string') return '';
    const t = text.trim();
    return t.length > MAX_CHARS ? t.slice(0, MAX_CHARS) : t;
  };

  const safeLevel = VALID_LEVELS.includes(level)        ? level        : 'adult';
  const safeLang  = VALID_LANGUAGES.includes(language)  ? language     : 'English';
  const safeStyle = VALID_STYLES.includes(explainStyle) ? explainStyle : 'plain';

  const isReady = () => {
    const mode = getAIMode();
    if (mode === 'online') return true;
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

    try {
      const system = safeLang === 'English'
        ? PROMPTS.simplify(safeLevel)
        : PROMPTS.multilingual(safeLang, safeLevel);

      const output = await callAI({ ollamaModel: model, system, prompt: clean });
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

    try {
      const promptMap = {
        plain:   PROMPTS.explainPlain,
        bullets: PROMPTS.explainBullets,
        steps:   PROMPTS.explainSteps,
      };
      const system = promptMap[safeStyle] || PROMPTS.explainPlain;
      const labelMap = { plain: 'Explanation', bullets: 'Key Points', steps: 'Step by Step' };

      const output = await callAI({ ollamaModel: model, system, prompt: clean });
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
    try {
      const output = await callAI({
        ollamaModel: model,
        system: PROMPTS.imageSimplify,
        prompt: 'Read all the text in this image and rewrite it in simple language.',
        images: [base64, mimeType]
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

    try {
      const output = await callAI({
        ollamaModel: model,
        system: PROMPTS.simplify('adult'),
        prompt: 'Read this entire PDF document and rewrite it in simple, clear language. Use short sentences. Keep all important information.',
        pdf: pdfBase64
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

  const handleQA = async (question) => {
    if (!currentDocument || !question) return '';
    try {
      const output = await callAI({
        ollamaModel: model,
        system: PROMPTS.qa(currentDocument),
        prompt: question
      });
      return output;
    } catch (e) {
      return 'Error: ' + e.message;
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#F2F0EB', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AIStatus ollamaModel={model} onOllamaModelChange={setModel} onModeChange={setMode} />

      <header style={{ background: 'linear-gradient(135deg, #3d3428 0%, #5a4d3a 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F2F0EB', letterSpacing: '0.04em', fontFamily: 'system-ui, sans-serif', margin: 0, lineHeight: 1.2 }}>QuietText 2.0</h1>
          <p style={{ fontSize: 11, color: '#9a9a9f', fontStyle: 'italic', marginTop: 3, fontFamily: 'system-ui, sans-serif' }}>{mode === 'ollama' ? 'Runs fully offline with Ollama · Nothing leaves your machine' : 'Gemma 4 reads your documents · Groq makes them simple'}</p>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

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
                  <ResultPanel result={result} resultLabel={resultLabel} loading={loading} error={error} ollamaModel={model} />
                </section>
              )}

              {metrics && !loading && (
                <section aria-label="Readability metrics" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <MetricsChart before={metrics.before} after={metrics.after} />
                </section>
              )}

              {!hasResult && (
                <div style={{ textAlign: 'center', padding: '16px 20px', color: '#6E6E73', fontFamily: 'system-ui, sans-serif' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#1C1C1E', marginBottom: 6 }}>Paste any text above to get started</p>
                  <p style={{ fontSize: 13, color: '#6E6E73', marginBottom: 4 }}>Articles · Documents · Emails · Anything</p>
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
                  <ResultPanel result={result} resultLabel={resultLabel} loading={loading} error={error} ollamaModel={model} />
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
                  <ResultPanel result={result} resultLabel={resultLabel} loading={loading} error={error} ollamaModel={model} />
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
              <AssignmentPanel ollamaModel={model} />
            </section>
          )}

          {activeView === 'history' && (
            <section aria-label="History" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, fontFamily: 'system-ui, sans-serif' }}>History</div>
              <p style={{ fontSize: 14, color: '#6E6E73', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>Your last 20 simplifications, stored in your browser only.</p>
            </section>
          )}

          {activeView === 'settings' && (
            <section aria-label="Settings" style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E8E6E1', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, fontFamily: 'system-ui, sans-serif' }}>Settings</div>
              <p style={{ fontSize: 14, color: '#6E6E73', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>Model selection, default reading level, default language.</p>
            </section>
          )}

        </div>
      </main>

      <footer style={{ borderTop: '1px solid #E8E6E1', padding: '10px 24px 10px 192px', textAlign: 'center', fontSize: 11, color: '#6E6E73', fontFamily: 'system-ui, sans-serif', background: '#FFFFFF' }}>
        {mode === 'ollama' ? '100% offline · Powered by Ollama · Your data never leaves your device' : 'Gemma 4 reads · Groq simplifies · Keys stay in your browser'}
      </footer>
    </div>
  );
}
