// Datos de universidades (mocks). Contienen opcionalmente campos:
// - historic: array de fechas históricas (ISO)
// - inicioOficial: fecha oficial conocida (ISO)
// - tipo: 'oficial' | 'estimada'
// - fuente: string
// - confianza: number (0-1)
const universidades = [
  { nombre: 'PUCP', inicioOficial: '2026-03-23T08:00:00Z', tipo: 'oficial', fuente: 'Cal.Académico PUCP', confianza: 0.85, historic: ['2026-03-22T08:00:00Z', '2026-03-25T08:00:00Z'] },
  { nombre: 'Universidad de Lima', inicioOficial: '2026-04-06T08:00:00Z', tipo: 'oficial', fuente: 'Calendario Admisión ULima', confianza: 0.75, historic: ['2026-04-06T08:00:00Z'] },
  { nombre: 'UNMSM', inicioOficial: '2026-03-16T08:00:00Z', tipo: 'estimada', fuente: 'estimación histórica', confianza: 0.30, historic: ['2026-04-01T08:00:00Z', '2026-04-03T08:00:00Z'] },
  { nombre: 'Universidad del Pacífico', inicioOficial: '2026-03-09T08:00:00Z', tipo: 'estimada', fuente: 'estimación histórica', confianza: 0.30, historic: [] },
  { nombre: 'UNI', inicioOficial: '2026-03-16T08:00:00Z', tipo: 'estimada', fuente: 'estimación histórica', confianza: 0.30, historic: ['2026-03-15T08:00:00Z', '2026-03-18T08:00:00Z'] },
  { nombre: 'UPCH', inicioOficial: '2026-03-16T08:00:00Z', tipo: 'estimada', fuente: 'estimación histórica', confianza: 0.30, historic: ['2026-03-20T08:00:00Z', '2026-03-22T08:00:00Z'] },
  { nombre: 'UCSUR', inicioOficial: '2026-03-17T08:00:00Z', tipo: 'estimada', fuente: 'estimación histórica', confianza: 0.30, historic: [] },
  { nombre: 'URP', inicioOficial: '2026-03-16T08:00:00Z', tipo: 'estimada', fuente: 'estimación histórica', confianza: 0.30, historic: [] },

  // resto de mocks previos (con historic donde aplica)
  { nombre: 'UNFV', historic: ['2026-04-05T08:00:00Z', '2026-04-07T08:00:00Z'] },
  { nombre: 'USMP', historic: ['2026-03-28T08:00:00Z', '2026-03-30T08:00:00Z'] },
  { nombre: 'UDEP', historic: ['2026-03-10T08:00:00Z', '2026-03-12T08:00:00Z'] },
  { nombre: 'UNALM', historic: ['2026-03-12T08:00:00Z', '2026-03-14T08:00:00Z'] },
  { nombre: 'UNALM-LIMA', historic: ['2026-03-12T08:00:00Z'] },
  { nombre: 'UNAJ', historic: ['2023-04-02T08:00:00Z'] },
  { nombre: 'UNPRG', historic: ['2026-03-18T08:00:00Z'] },
  { nombre: 'UNTR', historic: ['2026-04-04T08:00:00Z'] },
  { nombre: 'UNP', historic: ['2026-03-05T08:00:00Z'] },
  { nombre: 'UNAL', historic: ['2026-03-09T08:00:00Z'] },
  { nombre: 'UCV', historic: ['2026-03-21T08:00:00Z'] },
  { nombre: 'UPC', historic: ['2026-03-24T08:00:00Z'] },
  { nombre: 'UDEP-PIURA', historic: ['2026-03-11T08:00:00Z'] },
  { nombre: 'UNSA', historic: ['2026-03-26T08:00:00Z'] },
  { nombre: 'UNAJ-TACNA', historic: ['2026-04-06T08:00:00Z'] },
  { nombre: 'UNAM', historic: ['2026-03-14T08:00:00Z'] }
]

export default universidades

