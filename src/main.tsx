import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './fonts/fonts.css'
import './index.css'

// Принудительное удаление старых Service Worker (если есть)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => {
      console.log('Unregistering old service worker:', r.scope);
      r.unregister();
    });
  }).catch(err => {
    console.error('Error unregistering service workers:', err);
  });
}

// Тестовый alert для диагностики мобильных проблем
if (typeof window !== 'undefined') {
  try {
    alert('JS STARTED');
  } catch (e) {
    console.error('Alert failed:', e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

