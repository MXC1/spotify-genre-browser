import './errorHandling.css'
import React, { useState } from 'react';
import StackTrace from 'stacktrace-js';
import { logger } from './logger';
import {ErrorFallbackProps} from "./ErrorFallbackProps";

export function ErrorFallback({ error, resetErrorBoundary } : ErrorFallbackProps ) {
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
            logger.info('ERR001', 'User reset the error boundary');
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

export function handleError(error: Error) {
  StackTrace.fromError(error).then((stackframes) => {
    const stackString = stackframes
      .map((sf) => `${sf.functionName || 'anonymous'} (${sf.fileName}:${sf.lineNumber}:${sf.columnNumber})`)
      .join('\n');
    logger.error('ERR002', 'A fatal error occurred', {
      error,
      stack: stackString,
    });
  });
}
