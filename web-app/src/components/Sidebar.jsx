// Sidebar.jsx
// Navigation sidebar with Tools and Data sections
// Theme: Pure Charcoal (matches v1.0 aesthetic)

export default function Sidebar({ activeView, onViewChange }) {
  const navItem = (id, label, isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#1C1C1E' : '#6E6E73',
    cursor: 'pointer',
    borderLeft: `3px solid ${isActive ? '#a88f6b' : 'transparent'}`,
    background: isActive ? 'rgba(168,143,107,0.15)' : 'transparent',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    fontFamily: 'system-ui, sans-serif',
  });

  const navDot = (isActive) => ({
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: isActive ? '#a88f6b' : 'currentColor',
    opacity: isActive ? 1 : 0.3,
    flexShrink: 0,
    transition: 'opacity 0.15s',
  });

  const sectionLabel = {
    fontSize: 9,
    fontWeight: 700,
    color: '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    padding: '0 16px',
    margin: '14px 0 5px',
    fontFamily: 'system-ui, sans-serif',
  };

  const handleClick = (view) => {
    onViewChange(view);
  };

  const handleHover = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.background = '#F2F0EB';
      e.currentTarget.style.color = '#1C1C1E';
    }
  };

  const handleLeave = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#6E6E73';
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      style={{
        width: 168,
        flexShrink: 0,
        padding: '18px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowY: 'auto',
        background: '#FFFFFF',
        borderRight: '1px solid #E8E6E1',
      }}
    >
      {/* Tools section */}
      <div style={sectionLabel}>Tools</div>
      
      <div
        role="button"
        tabIndex={0}
        aria-label="Simplify text"
        aria-current={activeView === 'simplify' ? 'page' : undefined}
        style={navItem('simplify', 'Simplify', activeView === 'simplify')}
        onClick={() => handleClick('simplify')}
        onMouseEnter={(e) => handleHover(e, activeView === 'simplify')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'simplify')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('simplify'); }}
      >
        <div style={navDot(activeView === 'simplify')} aria-hidden="true" />
        Simplify
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF"
        aria-current={activeView === 'pdf' ? 'page' : undefined}
        style={navItem('pdf', 'PDF', activeView === 'pdf')}
        onClick={() => handleClick('pdf')}
        onMouseEnter={(e) => handleHover(e, activeView === 'pdf')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'pdf')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('pdf'); }}
      >
        <div style={navDot(activeView === 'pdf')} aria-hidden="true" />
        PDF
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        aria-current={activeView === 'image' ? 'page' : undefined}
        style={navItem('image', 'Image', activeView === 'image')}
        onClick={() => handleClick('image')}
        onMouseEnter={(e) => handleHover(e, activeView === 'image')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'image')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('image'); }}
      >
        <div style={navDot(activeView === 'image')} aria-hidden="true" />
        Image
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Question and answer"
        aria-current={activeView === 'qa' ? 'page' : undefined}
        style={navItem('qa', 'Q&A', activeView === 'qa')}
        onClick={() => handleClick('qa')}
        onMouseEnter={(e) => handleHover(e, activeView === 'qa')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'qa')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('qa'); }}
      >
        <div style={navDot(activeView === 'qa')} aria-hidden="true" />
        Q&amp;A
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Assignment Decoder"
        aria-current={activeView === 'assignment' ? 'page' : undefined}
        style={navItem('assignment', 'Assignment', activeView === 'assignment')}
        onClick={() => handleClick('assignment')}
        onMouseEnter={(e) => handleHover(e, activeView === 'assignment')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'assignment')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('assignment'); }}
      >
        <div style={navDot(activeView === 'assignment')} aria-hidden="true" />
        Assignment
      </div>

      {/* Data section */}
      <div style={{ ...sectionLabel, marginTop: 14 }}>Data</div>

      <div
        role="button"
        tabIndex={0}
        aria-label="View history"
        aria-current={activeView === 'history' ? 'page' : undefined}
        style={navItem('history', 'History', activeView === 'history')}
        onClick={() => handleClick('history')}
        onMouseEnter={(e) => handleHover(e, activeView === 'history')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'history')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('history'); }}
      >
        <div style={navDot(activeView === 'history')} aria-hidden="true" />
        History
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Settings"
        aria-current={activeView === 'settings' ? 'page' : undefined}
        style={navItem('settings', 'Settings', activeView === 'settings')}
        onClick={() => handleClick('settings')}
        onMouseEnter={(e) => handleHover(e, activeView === 'settings')}
        onMouseLeave={(e) => handleLeave(e, activeView === 'settings')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick('settings'); }}
      >
        <div style={navDot(activeView === 'settings')} aria-hidden="true" />
        Settings
      </div>
    </nav>
  );
}
