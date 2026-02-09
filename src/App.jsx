import React, { useMemo, useState, useEffect, useRef } from 'react'
import universidadesData from './data/universidades'
import CountdownCard from './components/CountdownCard'
import GoogleAd from './components/GoogleAd'

export default function App() {
  const [query, setQuery] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)
  
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') !== 'light'
    } catch (e) {
      return true
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch (e) {}
  }, [dark])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrado por nombre (case-insensitive)
  const universidades = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return universidadesData.filter(u => u.nombre.toLowerCase().includes(q))
  }, [query])

  const handleSelectUniversity = (u) => {
    setSelectedUniversity(u)
    setQuery(u.nombre)
    setIsSearchFocused(false)
  }

  const handleClearSelection = () => {
    setSelectedUniversity(null)
    setQuery('')
    searchRef.current?.focus()
  }

  const showDropdown = isSearchFocused && query.length > 0 && universidades.length > 0 && !selectedUniversity

  return (
    <div className="app-container">
      {/* Theme Toggle */}
      <button 
        onClick={() => setDark(d => !d)} 
        className="theme-toggle"
        aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          {dark ? (
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          ) : (
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
          )}
        </svg>
      </button>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="logo-container">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="hero-icon">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
          <h1 className="hero-title">¿Cuándo inician las clases?</h1>
          <p className="hero-subtitle">Encuentra la fecha de inicio de tu universidad en Perú</p>
          
          {/* Search Box */}
          <div className="search-container">
            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Escribe el nombre de tu universidad..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  if (selectedUniversity) setSelectedUniversity(null)
                }}
                onFocus={() => setIsSearchFocused(true)}
                aria-label="Buscar universidad"
                className="search-input"
                autoComplete="off"
              />
              {query && (
                <button className="search-clear" onClick={handleClearSelection} aria-label="Limpiar búsqueda">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
            
            {/* Dropdown Results */}
            {showDropdown && (
              <div ref={dropdownRef} className="search-dropdown">
                {universidades.map((u) => (
                  <button
                    key={u.nombre}
                    className="dropdown-item"
                    onClick={() => handleSelectUniversity(u)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="dropdown-icon">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                    <span>{u.nombre}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {isSearchFocused && query.length > 0 && universidades.length === 0 && !selectedUniversity && (
              <div className="search-dropdown">
                <div className="dropdown-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="empty-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p>No se encontró "{query}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick tags */}
          {!selectedUniversity && (
            <div className="quick-tags">
              <span className="quick-label">Populares:</span>
              {universidadesData.slice(0, 4).map((u) => (
                <button 
                  key={u.nombre} 
                  className="quick-tag"
                  onClick={() => handleSelectUniversity(u)}
                >
                  {u.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Selected University Card */}
      {selectedUniversity && (
        <main className="result-section">
          <div className="result-header">
            <button className="back-button" onClick={handleClearSelection}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Buscar otra universidad
            </button>
          </div>
          <CountdownCard nombre={selectedUniversity.nombre} expanded />
        </main>
      )}

      {/* Ad Section */}
      <GoogleAd />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Hecho con ❤️ para estudiantes peruanos</p>
          <div className="footer-links">
            
          </div>
        </div>
      </footer>
    </div>
  )
}
