// Módulo que envía textos a un modelo de IA para extraer si existe una fecha oficial.
// Soporta proveedores configurables mediante variables de entorno:
// - AI_PROVIDER=openai|anthropic
// - AI_API_KEY=...
// El módulo es conservador: devuelve `date: null` cuando la evidencia no es clara.

const fetch = require('node-fetch')
const universidades = require('../src/data/universidades').default || require('../src/data/universidades')

function safeParseJSON(text) {
  try { return JSON.parse(text) } catch (e) {
    // intentar extraer el primer JSON substring
    const m = text.match(/\{[\s\S]*\}/)
    if (m) {
      try { return JSON.parse(m[0]) } catch (e2) { return null }
    }
    return null
  }
}

function computeConfidence(parsed) {
  // parsed: { date, official, source }
  let confidence = 0
  // aceptar fechas YYYY-MM-DD o ISO (YYYY-MM-DDT...)
  const hasDate = !!parsed.date && /^\d{4}-\d{2}-\d{2}/.test(parsed.date)
  const official = !!parsed.official
  const source = parsed.source || ''

  const sourceInstitutional = /\.(edu|gob|gov)|universidad|universitary|universidad|comunicado|portal institucional|ministerio/i.test(source)
  if (hasDate && official && sourceInstitutional) confidence = 0.9
  else if (hasDate && official) confidence = 0.75
  else if (hasDate && sourceInstitutional) confidence = 0.6
  else if (hasDate) confidence = 0.5
  else confidence = 0.0

  return confidence
}

async function callOpenAI(prompt, apiKey) {
  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a strict extractor. Output ONLY valid JSON with the schema: {"date":"YYYY-MM-DD"|null,"official":boolean,"source":string|null,"confidence":number}. Do not invent dates. If evidence is unclear, return date:null and confidence:0.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })

    const status = res.status
    const textBody = await res.text()
    let j = null
    try { j = JSON.parse(textBody) } catch (e) { j = null }

    if (!res.ok) {
      console.error('OpenAI API error', status, textBody)
      return null
    }

    if (!j || !j.choices || !j.choices[0]) {
      console.log('OpenAI returned unexpected payload:', { status, body: j || textBody })
      return null
    }

    const text = j.choices[0].message && j.choices[0].message.content
    return text || null
  } catch (err) {
    console.error('callOpenAI fetch error', err)
    return null
  }
}

async function analyzeWithAI(name, texts) {
  if (!texts || texts.length === 0) return { date: null, official: false, source: null, confidence: 0 }

  // Modo mock para desarrollo
  if (process.env.AI_MOCK === 'true') {
    // buscar datos ficticios en `src/data/universidades`
    const u = universidades.find(x => x.nombre.toLowerCase() === name.toLowerCase())
    if (u) {
      if (u.inicioOficial) {
        return {
          date: new Date(u.inicioOficial).toISOString(),
          official: (u.tipo === 'oficial'),
          source: u.fuente || `https://www.${name.replace(/\s+/g, '').toLowerCase()}.edu.pe/calendario-academico`,
          confidence: typeof u.confianza === 'number' ? u.confianza : 0.82
        }
      }

      if (u.historic && u.historic.length > 0) {
        const date = new Date(u.historic[0]).toISOString()
        return {
          date,
          official: false,
          source: `historical:${name}`,
          confidence: 0.35
        }
      }
    }

    // valor por defecto si no hay datos para la universidad
    return {
      date: '2026-03-18T08:00:00Z',
      official: false,
      source: null,
      confidence: 0.25
    }
  }

  // Limitar textos (por presupuesto) y construir prompt conservador
  const ctx = texts.slice(0, 12).map((t, i) => `${i+1}. ${t}`).join('\n\n')
  const prompt = `You are given search results for the university: ${name}.\n\nONLY use the following snippets/links to determine whether there is a clear, official announced start date for classes (day, month, year).\n\nContext:\n${ctx}\n\nTask (strict):\n- If there is an explicit start date (day, month, year) in the provided texts and evidence shows it is an OFFICIAL announcement (institutional calendar, official comunicado, university website, ministry announcement), return a JSON object EXACTLY in this form:\n  {"date":"YYYY-MM-DD","official":true,"source":"URL or short source text","confidence":<number 0-1>}\n- If there is an explicit date but it appears in a non-official source (news, forum), you may return the date but set "official":false and a conservative confidence.\n- If the texts do not contain an explicit date (day/month/year) or the evidence is ambiguous, return: {"date":null,"official":false,"source":null,"confidence":0}\n\nImportant constraints:\n- Do NOT invent or assume dates.\n- Do NOT infer year/month if not present.\n- Output MUST be valid JSON and nothing else.\n\nRespond now.`

  const apiKey = process.env.AI_API_KEY
  if (!apiKey) {
    console.warn('AI_API_KEY not set; skipping AI analysis')
    return { date: null, official: false, source: null, confidence: 0 }
  }

  try {
    const raw = await callOpenAI(prompt, apiKey)

    if (!raw) {
      console.log('AI returned empty response')
      return { date: null, official: false, source: null, confidence: 0 }
    }

    console.log('AI raw response:', raw)
    const parsed = safeParseJSON(raw)
    if (!parsed) {
      console.log('Failed to parse AI response as JSON')
      return { date: null, official: false, source: null, confidence: 0 }
    }

    // Normalize fields
    const result = {
      date: parsed.date || null,
      official: !!parsed.official,
      source: parsed.source || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null
    }

    // Compute confidence heuristically if model didn't provide a numeric value
    if (result.confidence === null) {
      result.confidence = computeConfidence(result)
    }

    // Enforce conservative policy: if confidence < 0.5, treat as no-evidence
    if (typeof result.confidence === 'number' && result.confidence < 0.5) {
      console.log('AI confidence below threshold:', result.confidence)
      return { date: null, official: false, source: result.source || null, confidence: result.confidence }
    }

    // Validate date format: accept YYYY-MM-DD or ISO datetimes starting with YYYY-MM-DD
    if (result.date && !/^\d{4}-\d{2}-\d{2}([T ].*)?$/.test(result.date)) {
      console.log('AI returned date in unexpected format, discarding:', result.date)
      return { date: null, official: false, source: result.source || null, confidence: result.confidence }
    }

    return result
  } catch (err) {
    console.error('Error during AI analysis:', err)
    return { date: null, official: false, source: null, confidence: 0 }
  }
}

module.exports = { analyzeWithAI }
