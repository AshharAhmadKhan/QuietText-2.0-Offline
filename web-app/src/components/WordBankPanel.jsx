import { useState, useEffect } from 'react';
import { getWordBank, deleteWord, clearWordBank } from '../lib/storage';

export default function WordBankPanel() {
  const [words,  setWords]  = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setWords(getWordBank());
  }, []);

  const handleDelete = (id) => {
    deleteWord(id);
    setWords(getWordBank());
  };

  const handleClear = () => {
    clearWordBank();
    setWords([]);
  };

  const handleExport = () => {
    if (words.length === 0) return;
    const lines = words.map(e =>
      e.word + '\n' + e.definition + '\n' + new Date(e.timestamp).toLocaleDateString() + '\n'
    ).join('\n');
    const blob = new Blob(['QuietText 2.0 — My Word Bank\n\n' + lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'my-word-bank.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = search.trim()
    ? words.filter(e => e.word.toLowerCase().includes(search.toLowerCase()))
    : words;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Word Bank
          </div>
          <div style={{ fontSize: 12, color: '#a88f6b', marginTop: 2 }}>
            {words.length === 0 ? 'No words yet' : words.length + ' word' + (words.length === 1 ? '' : 's') + ' saved'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {words.length > 0 && (
            <>
              <button
                onClick={handleExport}
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 6,
                  border: '1px solid #E8E6E1', background: '#FFFFFF',
                  color: '#1C1C1E', cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
                }}
              >
                Export .txt
              </button>
              <button
                onClick={handleClear}
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 6,
                  border: '1px solid #E8E6E1', background: '#FFFFFF',
                  color: '#9a9a9f', cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
                }}
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {words.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', background: '#f5f3ef', borderRadius: 10, border: '1px solid #E8E6E1' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', marginBottom: 6 }}>Your word bank is empty</div>
          <div style={{ fontSize: 13, color: '#6E6E73', lineHeight: 1.6 }}>
            Tap any word in a simplified result to get its definition.<br />
            Words you look up will be saved here automatically.
          </div>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your words..."
            style={{
              width: '100%', padding: '9px 12px', fontSize: 13,
              border: '1px solid #E8E6E1', borderRadius: 8,
              fontFamily: 'system-ui, sans-serif', outline: 'none',
              marginBottom: 14, color: '#1C1C1E', background: '#FFFFFF'
            }}
          />

          {filtered.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6E6E73', padding: '16px 0' }}>No words match your search.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    border: '1px solid #E8E6E1', background: '#FAFAF8'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                        <span style={{
                          fontSize: 15, fontWeight: 600, color: '#1C1C1E',
                          fontFamily: 'OpenDyslexic, sans-serif'
                        }}>
                          {entry.word}
                        </span>
                        <span style={{ fontSize: 10, color: '#9a9a9f' }}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 13, color: '#3d3428', lineHeight: 1.7,
                        fontFamily: 'OpenDyslexic, sans-serif'
                      }}>
                        {entry.definition}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      title="Remove this word"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9a9a9f', fontSize: 16, lineHeight: 1,
                        padding: '2px 4px', flexShrink: 0
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
