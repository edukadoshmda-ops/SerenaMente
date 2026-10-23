import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Registro do Service Worker para funcionalidade PWA e Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SerenaMente PWA ServiceWorker registrado com sucesso:', registration.scope);
      })
      .catch((err) => {
        console.warn('Registro de ServiceWorker ignorado ou com erro:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
