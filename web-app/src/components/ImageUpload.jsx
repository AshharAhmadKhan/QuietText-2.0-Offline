import { useState, useRef } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 20 * 1024 * 1024;

export default function ImageUpload({ onProcess, loading }) {
  const [preview, setPreview]        = useState(null);
  const [base64,  setBase64]         = useState('');
  const [mimeType, setMimeType]      = useState('');
  const [validationError, setValErr] = useState('');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setValErr('');
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValErr('Only JPG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setValErr('Image too large - max 20 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setBase64(dataUrl.split(',')[1]);
      setMimeType(file.type);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setPreview(null); setBase64(''); setMimeType(''); setValErr('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
        Image Upload
      </div>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{ border: '2px dashed #E8E6E1', borderRadius: 10, padding: 40, textAlign: 'center', color: '#6E6E73' }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', marginBottom: 8 }}>
            Drop an image here, or:
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            style={{ background: '#3d3428', color: '#F2F0EB', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}
          >
            Browse file
          </button>
          <div style={{ fontSize: 12, color: '#a88f6b', marginBottom: 4 }}>
            Textbook, letter, prescription, any printed text
          </div>
          <div style={{ fontSize: 11, color: '#9a9a9f' }}>JPG, PNG, WebP up to 20 MB</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <img
              src={preview}
              alt="Selected"
              style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8, border: '1px solid #E8E6E1', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => onProcess(base64, mimeType)}
              disabled={loading}
              style={{
                background: loading ? '#9a9a9f' : '#3d3428',
                color: '#F2F0EB', border: 'none', borderRadius: 8,
                padding: '10px 22px', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Reading image...' : 'Read & Simplify'}
            </button>
            <button
              onClick={handleClear}
              style={{ background: 'transparent', border: '1px solid #E8E6E1', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#6E6E73', cursor: 'pointer' }}
            >
              Choose different image
            </button>
          </div>
        </div>
      )}

      {validationError && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#c0392b', background: '#fdf0ef', borderRadius: 6, padding: '8px 12px' }}>
          {validationError}
        </div>
      )}
    </div>
  );
}
