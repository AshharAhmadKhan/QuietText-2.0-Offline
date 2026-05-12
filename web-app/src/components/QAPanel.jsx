import { useState } from 'react';

function stripMd(t) {
  return t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").trim();
}

export default function QAPanel({ onAsk, loading, currentDocument }) {
  const [question, setQuestion] = useState('');
  const [history,  setHistory]  = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading || isAsking) return;
    
    setIsAsking(true);
    const newHistory = [...history, { role: 'user', text: q }];
    setHistory(newHistory);
    setQuestion(''); // Clear input immediately
    
    try {
      const answer = await onAsk(q, newHistory);
      if (answer) setHistory(h => [...h, { role: 'ai', text: answer }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        Ask a Question
      </div>

      {!currentDocument ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#6E6E73', background: '#f5f3ef', borderRadius: 10, border: '1px solid #E8E6E1' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', marginBottom: 6 }}>No document loaded</div>
          <div style={{ fontSize: 13 }}>Simplify a text, PDF, or image first. Then come back here to ask questions about it.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: '#a88f6b', marginBottom: 12, padding: '8px 12px', background: '#fdf9f4', borderRadius: 6, border: '1px solid #f0e6d3' }}>
            Document loaded: {currentDocument.trim().split(/\s+/).length.toLocaleString()} words ready to query
          </div>

          {history.length > 0 && (
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((msg, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  lineHeight: 1.6,
                  background: msg.role === 'user' ? '#3d3428' : '#f5f3ef',
                  color: msg.role === 'user' ? '#F2F0EB' : '#1C1C1E',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  fontFamily: msg.role === 'ai' ? 'OpenDyslexic, system-ui, sans-serif' : 'system-ui, sans-serif'
                }}>
                  {stripMd(msg.text)}
                </div>
              ))}
              {isAsking && (
                <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, background: '#f5f3ef', color: '#9a9a9f', alignSelf: 'flex-start', maxWidth: '85%' }}>
                  Thinking...
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isAsking && handleAsk()}
              placeholder="Ask anything about the document..."
              disabled={isAsking}
              style={{
                flex: 1, padding: '10px 14px', fontSize: 14,
                border: '1px solid #E8E6E1', borderRadius: 8,
                fontFamily: 'system-ui, sans-serif', outline: 'none',
                background: isAsking ? '#f5f3ef' : '#fff', color: '#1C1C1E',
                cursor: isAsking ? 'not-allowed' : 'text'
              }}
            />
            <button
              onClick={handleAsk}
              disabled={isAsking || !question.trim()}
              style={{
                background: isAsking || !question.trim() ? '#9a9a9f' : '#3d3428',
                color: '#F2F0EB', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: isAsking || !question.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isAsking ? 'Asking...' : 'Ask'}
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              style={{ marginTop: 10, background: 'transparent', border: 'none', fontSize: 12, color: '#9a9a9f', cursor: 'pointer', padding: 0 }}
            >
              Clear conversation
            </button>
          )}
        </>
      )}
    </div>
  );
}
