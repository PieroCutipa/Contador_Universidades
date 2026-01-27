const universidades = require('../src/data/universidades').default || require('../src/data/universidades')

async function predictHistorically(name) {
  // Implementación simple y conservadora:
  // - Si existe historial en `src/data/universidades` con una fecha, usar el patrón de mes
  // - Para mayor confiabilidad, devolver confianza baja (ej. 0.35)

  // Buscar coincidencia por nombre
  const u = universidades.find(x => x.nombre.toLowerCase() === name.toLowerCase())
  if (u && u.historic && u.historic.length > 0) {
    // calcular mediana de fechas históricas (día/mes) y construir próxima fecha en año actual o próximo
    const months = u.historic.map(d => new Date(d))
    const month = months[Math.floor(months.length / 2)].getMonth()
    const day = months[Math.floor(months.length / 2)].getDate()
    const year = new Date().getFullYear()
    const candidate = new Date(Date.UTC(year, month, day, 8, 0, 0))
    return { date: candidate.toISOString(), confidence: 0.35, source: 'historical-pattern' }
  }

  // Si no hay historial, devolver una predicción conservadora genérica (ej. inicio de marzo)
  const year = new Date().getFullYear()
  const candidate = new Date(Date.UTC(year, 2, 1, 8, 0, 0)) // 1 de marzo
  return { date: candidate.toISOString(), confidence: 0.25, source: 'historical-default' }
}

module.exports = { predictHistorically }
