import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Application Error</h2>
          <p style={{ color: '#475569', marginBottom: '16px' }}>Something went wrong while rendering the page.</p>
          <pre style={{ background: '#f1f5f9', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', color: '#1e293b' }}>
            {this.state.error ? this.state.error.toString() : 'Unknown Error'}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
