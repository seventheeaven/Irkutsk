import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './fonts/fonts.css'
import './index.css'

function showError(msg: string) {
  try {
    const el = document.getElementById('root') || document.body
    el.innerHTML = '<p style="padding:1em;font-family:sans-serif;color:#c00;word-break:break-all">' + String(msg).replace(/</g, '&lt;') + '</p>'
  } catch (_) {}
}

try {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    showError('root not found')
  } else {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
} catch (e) {
  const msg = e instanceof Error ? e.message + (e.stack ? '\n' + e.stack : '') : String(e)
  showError('Ошибка: ' + msg)
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (ev) => {
    const msg = ev.message || String(ev.error)
    if (msg && !ev.message?.includes('ResizeObserver')) showError('Uncaught: ' + msg)
  })
  window.addEventListener('unhandledrejection', (ev) => {
    const msg = ev.reason instanceof Error ? ev.reason.message : String(ev.reason)
    if (msg) showError('Promise: ' + msg)
  })
}
