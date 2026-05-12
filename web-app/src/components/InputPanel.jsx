const CHAR_WARN  = 350000;
const CHAR_LIMIT = 400000;

const LEVEL_DESCRIPTIONS = {
  grade3: 'Grade 3 - 8-9 year old reading level',
  grade6: 'Grade 6 - 11-12 year old reading level',
  grade9: 'Grade 9 - 14-15 year old reading level',
  adult:  'Adult - standard reading level',
};

const STYLE_DESCRIPTIONS = {
  plain:   'Plain - flowing explanation in simple sentences',
  bullets: 'Bullets - numbered list of key points',
  steps:   'Steps - numbered step-by-step breakdown',
};

export default function InputPanel({
  inputText, onInputChange,
  level, onLevelChange,
  language, onLanguageChange,
  loading, onSimplify, onExplain,
  explainStyle, onExplainStyleChange,
}) {
  const isEmpty    = !inputText.trim();
  const charCount  = inputText.length;
  const nearLimit  = charCount > CHAR_WARN;
  const atLimit    = charCount > CHAR_LIMIT;
  const isDisabled = loading || isEmpty;

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isDisabled) onSimplify();
    }
  };

  const btnPrimary = {
    padding: '10px 16px', fontSize: 13, fontWeight: 600,
    background: isDisabled ? '#E8E6E1' : '#1C1C1E',
    color: isDisabled ? '#6E6E73' : '#F2F0EB',
    border: 'none', borderRadius: 8,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'system-ui, sans-serif',
    flex: 1,
  };

  const btnSecondary = {
    padding: '10px 16px', fontSize: 13, fontWeight: 600,
    background: '#FFFFFF',
    color: isDisabled ? '#6E6E73' : '#1C1C1E',
    border: '1px solid #E8E6E1', borderRadius: 8,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'system-ui, sans-serif',
    flex: 1,
  };

  const selectStyle = {
    padding: '8px 10px', fontSize: 12,
    border: '1px solid #E8E6E1', borderRadius: 8,
    color: '#1C1C1E', background: '#FFFFFF',
    cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700,
    color: '#6E6E73', textTransform: 'uppercase',
    letterSpacing: '0.12em', marginBottom: 4,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <label htmlFor="input-text" style={labelStyle}>
          Paste Text
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: '#a88f6b' }}>
            (Ctrl+Enter to simplify)
          </span>
        </label>
        <textarea
          id="input-text"
          aria-label="Text to simplify. Press Ctrl+Enter to simplify."
          value={inputText}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste any text here: article, document, email, anything..."
          disabled={loading}
          style={{
            width: '100%', minHeight: 140,
            padding: '10px 12px',
            paddingBottom: charCount > 0 ? 28 : 12,
            fontSize: 13, lineHeight: 1.7,
            fontFamily: 'system-ui, sans-serif',
            color: '#1C1C1E',
            background: loading ? '#F2F0EB' : '#FFFFFF',
            border: `1px solid ${nearLimit ? '#a88f6b' : '#E8E6E1'}`,
            borderRadius: 8, resize: 'vertical', outline: 'none',
            cursor: loading ? 'not-allowed' : 'text',
          }}
          onFocus={e => { if (!loading) { e.target.style.outline = '2px solid #a88f6b'; e.target.style.outlineOffset = '2px'; }}}
          onBlur={e => { e.target.style.outline = 'none'; }}
        />
        {charCount > 0 && (
          <span style={{
            position: 'absolute', bottom: 8, right: 10, fontSize: 10,
            color: atLimit ? '#ef4444' : nearLimit ? '#a88f6b' : '#6E6E73',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: nearLimit ? 600 : 400,
          }}>
            {charCount.toLocaleString()} / {CHAR_LIMIT.toLocaleString()} chars
            {nearLimit && !atLimit && ' (approaching limit)'}
            {atLimit && ' (will be truncated)'}
          </span>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="level-select" style={labelStyle}>Level</label>
          <select id="level-select" value={level} onChange={e => onLevelChange(e.target.value)}
            title={LEVEL_DESCRIPTIONS[level]} style={selectStyle}>
            <option value="grade3">Grade 3</option>
            <option value="grade6">Grade 6</option>
            <option value="grade9">Grade 9</option>
            <option value="adult">Adult</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="language-select" style={labelStyle}>Output Language</label>
          <select id="language-select" value={language} onChange={e => onLanguageChange(e.target.value)} style={selectStyle}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Urdu">Urdu</option>
            <option value="Bengali">Bengali</option>
            <option value="Arabic">Arabic</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onSimplify} disabled={isDisabled}
          title={isEmpty ? 'Paste some text first' : 'Simplify text (Ctrl+Enter)'}
          aria-label="Simplify text"
          style={btnPrimary}
          onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,28,30,0.25)'; }}}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          ✦ Simplify
        </button>

        <button onClick={onExplain} disabled={isDisabled}
          title={isEmpty ? 'Paste some text first' : `Explain as ${STYLE_DESCRIPTIONS[explainStyle]}`}
          aria-label="Explain text"
          style={btnSecondary}
          onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#1C1C1E'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,28,30,0.1)'; }}}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#E8E6E1'; e.currentTarget.style.boxShadow = ''; }}>
          ◈ Explain
        </button>

        <select value={explainStyle} onChange={e => onExplainStyleChange(e.target.value)}
          title={STYLE_DESCRIPTIONS[explainStyle]}
          aria-label="Explanation style"
          style={{ ...selectStyle, fontSize: 11 }}>
          <option value="plain">Plain</option>
          <option value="bullets">Bullets</option>
          <option value="steps">Steps</option>
        </select>
      </div>

    </div>
  );
}
