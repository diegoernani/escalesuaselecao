import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { setupImageShareButtons } from './shareButtonsImageMode.js';

setupImageShareButtons();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
