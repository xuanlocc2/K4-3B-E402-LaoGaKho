import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * App entry point.
 * Mounts the React tree into #root and enables StrictMode for
 * extra development checks (double renders, deprecated APIs).
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Fatal: #root element not found in index.html. ' +
    'Ensure index.html contains <div id="root"></div>.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
