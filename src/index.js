import React from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { BrowserRouter as Router } from 'react-router-dom';
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

serviceWorkerRegistration.register();