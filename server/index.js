const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { searchWeb } = require('./search')
const { analyzeWithAI } = require('./ai')
const { predictHistorically } = require('./predict')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Mostrar si las variables de entorno críticas están cargadas (no mostrar las claves)
console.log('ENV: AI_PROVIDER=', process.env.AI_PROVIDER || 'not-set', 'OPENAI_MODEL=', process.env.OPENAI_MODEL || 'not-set')
console.log('ENV: AI_API_KEY loaded?', !!process.env.AI_API_KEY, 'SERPAPI_KEY loaded?', !!process.env.SERPAPI_KEY)

// GET /api/university?name=PUCP
app.get('/api/university', async (req, res) => {
  const name = req.query.name
  if (!name) return res.status(400).json({ error: 'missing name' })

  try {
    // 1) Buscar en la web (configurable provider)
    const searchResults = await searchWeb(name)

    // 2) Mandar textos al módulo de IA para extraer si hay fecha oficial
    const aiResponse = await analyzeWithAI(name, searchResults)

    // aiResponse should be: { date: ISO|null, official: boolean, source: string|null, confidence: number }
    if (aiResponse && aiResponse.date) {
      return res.json({ ...aiResponse, usedFallback: false })
    }

    // 3) Si AI no encontró fecha oficial -> activar predicción histórica
    const prediction = await predictHistorically(name)
    // prediction: { date: ISO|null, confidence: number, source: string }

    // Normalize response: mark as estimated (not official) and include source/confidence
    return res.json({
      date: prediction.date || null,
      official: false,
      source: prediction.source || null,
      confidence: prediction.confidence || 0,
      usedFallback: true
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal error' })
  }
})

const port = process.env.PORT || 5174
app.listen(port, () => console.log(`Server listening on ${port}`))
