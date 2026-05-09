// ErrorBoundary.jsx
// Catches any render-time error and shows a recovery UI instead of a blank page.
// React error boundaries must be class components — this is the only class in the project.

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('QuietText crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        background: '#F2F0EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FFCDD2',
          borderRadius: 12,
          padding: '32px 28px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: '#6E6E73', marginBottom: 6, lineHeight: 1.6 }}>
            {this.state.message}
          </p>
          <p style={{ fontSize: 12, color: '#6E6E73', marginBottom: 20 }}>
            Your text and history are safe in localStorage.
          </p>
          <button
            onClick={() => window.location.reload()}
            title="Reload the page"
            style={{
              padding: '10px 24px',
              background: '#1C1C1E',
              color: '#F2F0EB',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
