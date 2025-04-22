import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import StackTrace from 'stacktrace-js';
import { BrowserRouter as Router } from 'react-router-dom';
import logMessage from './utilities/loggingConfig';
import { ErrorFallback, handleError } from './utilities/errorHandling';

function Root() {

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