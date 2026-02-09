const fetch = require('node-fetch')

async function searchWeb(query) {
  // Implementadores: SerpAPI, Bing Web Search, etc.
  // Priorizar proveedor configurado mediante variables de entorno.
  if (!process.env.SERPAPI_KEY) {
    console.log('searchWeb: SERPAPI_KEY not set — returning empty results to trigger fallback')
    return []
  }

  // Construir URL SerpAPI (usar engine=google para mayor consistencia)
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}&num=10`
  console.log('searchWeb: fetching', url)

  try {
    const r = await fetch(url)
    console.log('searchWeb: response status', r.status)
    const json = await r.json()
    console.log('searchWeb: response keys', Object.keys(json || {}))

    const texts = []

    // organic_results is the main field from SerpAPI
    if (json.organic_results && Array.isArray(json.organic_results)) {
      for (const o of json.organic_results) {
        if (o.title) texts.push(o.title)
        if (o.snippet) texts.push(o.snippet)
        if (o.link) texts.push(o.link)
        // incluir sitelinks o rich snippets si existen
        if (o.rich_snippet && o.rich_snippet.top && o.rich_snippet.top.snippets) {
          for (const s of o.rich_snippet.top.snippets) if (s) texts.push(s)
        }
      }
    }

    // Otros posibles campos de interés
    if (json.answer_box) texts.push(JSON.stringify(json.answer_box))
    if (json.inline_links && Array.isArray(json.inline_links)) {
      for (const l of json.inline_links) if (l.title) texts.push(l.title)
    }

    // Extraer a partir de resultados generales si existen (compatibilidad)
    if (json.results && Array.isArray(json.results)) {
      for (const ritem of json.results) {
        if (ritem.title) texts.push(ritem.title)
        if (ritem.snippet) texts.push(ritem.snippet)
        if (ritem.link) texts.push(ritem.link)
      }
    }

    // Depuración: mostrar cuántos fragmentos devolvemos
    console.log('searchWeb: extracted', texts.length, 'text fragments')

    return texts
  } catch (err) {
    console.error('searchWeb: error fetching/parsing SerpAPI', err)
    return []
  }
}

module.exports = { searchWeb }
