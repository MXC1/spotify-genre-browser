import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import StackTrace from 'stacktrace-js';
import { BrowserRouter as Router } from 'react-router-dom';
import logMessage from './utilities/loggingConfig';

function Root() {

  function ErrorFallback({ error, resetErrorBoundary }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
      <div className="error-fallback">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <h1 className="error-title">
          Something went wrong. <br />
          This has been reported to the developers.</h1>
        <p className="error-message">{error.message}</p>
        <button 
          className="error-button" 
          onClick={async () => {
            if (!isLoading) {
              setIsLoading(true);
              logMessage('User reset the error boundary.');
              await new Promise(r => setTimeout(r, 2000));
              resetErrorBoundary();
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Try Again'}
        </button>
      </div>
    );
  }

  function handleError(error, info) {
    StackTrace.fromError(error).then((stackframes) => {
      const stackString = stackframes
        .map((sf) => `${sf.functionName || 'anonymous'} (${sf.fileName}:${sf.lineNumber}:${sf.columnNumber})`)
        .join('\n');
      logMessage(`A fatal error occurred with error: ${error} and traceback:\n${stackString}`);
    });
  }

  return (
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <Router>
          <App />
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));

// Change unregister() to register() to enable service workers
serviceWorkerRegistration.register();