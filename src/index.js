import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import for React 18
import './index.css';
import App from './main/App';
import * as serviceWorkerRegistration from './main/serviceWorkerRegistration';

// Create the root element
const rootElement = document.getElementById('root');

// Create a React root and render the app
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Change unregister() to register() to enable service workers
serviceWorkerRegistration.register();
