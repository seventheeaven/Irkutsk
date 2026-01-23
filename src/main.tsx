import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './fonts/fonts.css'
import './index.css'

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

