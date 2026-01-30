import React, { useEffect, useState, useRef } from 'react'

// Card que consulta el backend para determinar la fecha (oficial o estimada)
export default function CountdownCard({ nombre, expanded = false }) {
  const [now, setNow] = useState(Date.now())
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => { mounted.current = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, data: null, error: null })
    // Usar la misma IP/host que el frontend para el backend (cambiando solo el puerto)
    const currentHost = window.location.hostname
    const base = (import.meta.env.VITE_API_BASE) || `http://${currentHost}:5174`
    fetch(`${base}/api/university?name=${encodeURIComponent(nombre)}`)
      .then(r => r.json())
      .then(j => {
        if (cancelled) return
        setState({ loading: false, data: j, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setState({ loading: false, data: null, error: String(err) })
      })

    return () => { cancelled = true }
  }, [nombre])

  if (state.loading) {
    return (
      <article className={`card ${expanded ? 'card-expanded' : ''}`}>
        <div className="card-loading">
          <div className="loading-spinner"></div>
          <h3>{nombre}</h3>
          <p>Buscando información...</p>
        </div>
      </article>
    )
  }

  if (state.error) {
    return (
      <article className={`card card-error ${expanded ? 'card-expanded' : ''}`}>
        <h3>{nombre}</h3>
        <p className="error-message">Error al obtener datos</p>
        <p className="meta">{state.error}</p>
      </article>
    )
  }

  const info = state.data || {}

  // Regla de presentación: mostrar fecha solo si es oficial o confianza >= 0.6
  const showDate = info.date && (info.official === true || (typeof info.confidence === 'number' && info.confidence >= 0.6))

  if (!showDate) {
    return (
      <article className={`card card-pending ${expanded ? 'card-expanded' : ''}`}>
        <div className="card-header">
          <div className="card-status pending">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            Fecha pendiente
          </div>
        </div>
        <h3>{nombre}</h3>
        <p className="date">Fecha no confirmada oficialmente</p>
        <div className="card-meta">
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            {info.source || 'Estimación histórica'}
          </span>
          <span className="confidence-badge low">
            {Math.round((info.confidence || 0) * 100)}% confianza
          </span>
        </div>
        {info.usedFallback && (
          <p className="note">Se activó predicción histórica basada en años anteriores.</p>
        )}
      </article>
    )
  }

  const target = new Date(info.date).getTime()
  const diff = target - now

  if (diff <= 0) {
    return (
      <article className={`card started ${expanded ? 'card-expanded' : ''}`}>
        <div className="card-header">
          <div className="card-status started">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Clases iniciadas
          </div>
        </div>
        <h3>{nombre}</h3>
        <p className="date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
          </svg>
          {new Date(info.date).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="message success">¡Las clases ya iniciaron! 🎉</p>
        <div className="card-meta">
          <span className="meta-item">{info.official ? '✓ Fecha oficial' : 'Estimado'}</span>
          <span className="meta-item">{info.source || 'N/A'}</span>
          <span className="confidence-badge high">{Math.round(info.confidence * 100)}%</span>
        </div>
      </article>
    )
  }

  const seconds = Math.floor(diff / 1000)
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const soon = days < 7

  return (
    <article className={`card ${soon ? 'soon' : ''} ${expanded ? 'card-expanded' : ''}`} aria-live="polite">
      <div className="card-header">
        <div className={`card-status ${info.official ? 'official' : 'estimated'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {info.official ? (
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            ) : (
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            )}
          </svg>
          {info.official ? 'Fecha oficial' : 'Fecha estimada'}
        </div>
        {soon && <span className="soon-badge">¡Pronto!</span>}
      </div>
      
      <h3>{nombre}</h3>
      
      <p className="date">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
        </svg>
        {new Date(info.date).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="countdown-grid">
        <div className="countdown-item">
          <span className="countdown-value">{days}</span>
          <span className="countdown-label">días</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-value">{hours}</span>
          <span className="countdown-label">horas</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-value">{minutes}</span>
          <span className="countdown-label">min</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-value">{secs}</span>
          <span className="countdown-label">seg</span>
        </div>
      </div>

      <div className="card-meta">
        <span className="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          {info.source || 'N/A'}
        </span>
        <span className={`confidence-badge ${info.confidence >= 0.8 ? 'high' : info.confidence >= 0.6 ? 'medium' : 'low'}`}>
          {Math.round(info.confidence * 100)}% confianza
        </span>
      </div>
    </article>
  )
}
