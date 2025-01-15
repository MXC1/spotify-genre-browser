import React from 'react';
import ReactDOM from 'react-dom';
import './main/index.css';
import App from './main/App';
import * as serviceWorkerRegistration from './main/serviceWorkerRegistration';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Change unregister() to register() to enable service workers
serviceWorkerRegistration.register();
