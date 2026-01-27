import React, { useEffect, useState, useRef } from 'react'

// Card que consulta el backend para determinar la fecha (oficial o estimada)
export default function CountdownCard({ nombre }) {
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
    const base = (import.meta.env.VITE_API_BASE) || 'http://localhost:5174'
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
      <article className="card">
        <h3>{nombre}</h3>
        <p>Cargando información...</p>
      </article>
    )
  }

  if (state.error) {
    return (
      <article className="card">
        <h3>{nombre}</h3>
        <p>Error al obtener datos: {state.error}</p>
      </article>
    )
  }

  const info = state.data || {}

  // Regla de presentación: mostrar fecha solo si es oficial o confianza >= 0.6
  const showDate = info.date && (info.official === true || (typeof info.confidence === 'number' && info.confidence >= 0.6))

  if (!showDate) {
    // No mostramos la fecha para priorizar confiabilidad
    return (
      <article className="card">
        <h3>{nombre}</h3>
        <p className="date">Fecha no confirmada</p>
        <p className="meta">Fuente: {info.source || 'N/A'} · Confianza: {Math.round((info.confidence || 0) * 100)}%</p>
        {info.usedFallback && <p className="note">Se activó predicción histórica (fecha estimada no mostrada por baja evidencia).</p>}
      </article>
    )
  }

  const target = new Date(info.date).getTime()
  const diff = target - now

  if (diff <= 0) {
    return (
      <article className="card started">
        <h3>{nombre}</h3>
        <p className="date">Inicio: {new Date(info.date).toLocaleString()}</p>
        <p className="meta">{info.official ? 'Fecha oficial' : 'Estimado'} · Fuente: {info.source || 'N/A'} · Confianza: {Math.round(info.confidence * 100)}%</p>
        <p className="message">¡Ya iniciaron las clases!</p>
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
    <article className={"card" + (soon ? ' soon' : '')} aria-live="polite">
      <h3>{nombre}</h3>
      <p className="date">Inicio: {new Date(info.date).toLocaleString()}</p>
      <p className="countdown">{days}d {hours}h {minutes}m {secs}s</p>
      <p className="meta">{info.official ? 'Fecha oficial' : 'Estimado'} · Fuente: {info.source || 'N/A'} · Confianza: {Math.round(info.confidence * 100)}%</p>
    </article>
  )
}
