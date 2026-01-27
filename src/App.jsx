import React, { useMemo, useState, useEffect } from 'react'
import universidadesData from './data/universidades'
import CountdownCard from './components/CountdownCard'

export default function App() {
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    // Aplicar clase dark en el root para estilos
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch (e) {}
  }, [dark])

  // Filtrado por nombre (case-insensitive)
  const universidades = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return universidadesData
    return universidadesData.filter(u => u.nombre.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="app">
      <header className="header">
        <h1>Cuenta regresiva - Inicio de clases (Perú)</h1>
        <div className="controls">
          <input
            type="search"
            placeholder="Buscar universidad..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Buscar universidad"
          />
          <button onClick={() => setDark(d => !d)} className="btn-toggle">
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </header>

      <main>
        <section className="grid">
          {universidades.map((u) => (
            <CountdownCard key={u.nombre} nombre={u.nombre} />
          ))}
        </section>
        {universidades.length === 0 && (
          <p className="no-results">No se encontró ninguna universidad.</p>
        )}
      </main>

      <footer className="footer">Hecho con ❤️ · Ejemplo React + Vite</footer>
    </div>
  )
}
