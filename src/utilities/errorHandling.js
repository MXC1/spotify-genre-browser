import './errorHandling.css'
import React, { useState } from 'react';
import StackTrace from 'stacktrace-js';
import logMessage from '../utilities/loggingConfig';

export function ErrorFallback({ error, resetErrorBoundary }) {
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
      <p className="error-message">
        {error?.message || ''} <br/>
        {error?.response?.data?.message || ''}
      </p>
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

export function handleError(error) {
  StackTrace.fromError(error).then((stackframes) => {
    const stackString = stackframes
      .map((sf) => `${sf.functionName || 'anonymous'} (${sf.fileName}:${sf.lineNumber}:${sf.columnNumber})`)
      .join('\n');
    logMessage(`A fatal error occurred with error: ${error} and traceback:\n${stackString}`);
  });
}
