import { useState, useRef } from 'react';

const MAX_BYTES = 50 * 1024 * 1024; // 50MB

export default function PDFUpload({ onProcess, loading }) {
  const [fileName,  setFileName]  = useState('');
  const [base64,    setBase64]    = useState('');
  const [error,     setError]     = useState('');
  const [reading,   setReading]   = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('PDF too large. Max 50 MB.');
      return;
    }
    setReading(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result.split(',')[1];
      setBase64(b64);
      setReading(false);
    };
    reader.onerror = () => {
      setError('Could not read file.');
      setReading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setFileName(''); setBase64(''); setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        PDF Upload
      </div>

      {!fileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{ border: '2px dashed #E8E6E1', borderRadius: 10, padding: 40, textAlign: 'center', color: '#6E6E73' }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', marginBottom: 8 }}>
            Drop a PDF here, or:
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            style={{ background: '#3d3428', color: '#F2F0EB', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}
          >
            Browse PDF
          </button>
          <div style={{ fontSize: 12, color: '#a88f6b', marginBottom: 4 }}>
            Text or scanned. Gemma 4 reads both.
          </div>
          <div style={{ fontSize: 11, color: '#9a9a9f' }}>Up to 50 MB · 30+ pages no problem</div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f5f3ef', borderRadius: 8, border: '1px solid #E8E6E1' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', marginBottom: 4 }}>
              {reading ? 'Reading file...' : fileName}
            </div>
            {!reading && (
              <div style={{ fontSize: 12, color: '#6E6E73' }}>
                Ready. Gemma 4 will read and simplify the full document.
              </div>
            )}
          </div>

          {!reading && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => onProcess(base64)}
                disabled={loading}
                style={{
                  background: loading ? '#9a9a9f' : '#3d3428',
                  color: '#F2F0EB', border: 'none', borderRadius: 8,
                  padding: '10px 22px', fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Gemma 4 is reading...' : 'Read & Simplify PDF'}
              </button>
              <button
                onClick={handleClear}
                style={{ background: 'transparent', border: '1px solid #E8E6E1', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#6E6E73', cursor: 'pointer' }}
              >
                Remove PDF
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#c0392b', background: '#fdf0ef', borderRadius: 6, padding: '8px 12px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
