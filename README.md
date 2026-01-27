# Cuenta regresiva - Inicio de clases (Universidades Perú)

Proyecto sencillo con React + Vite que muestra contadores en tiempo real para el inicio de clases de universidades.

Comandos para iniciar el proyecto:

```bash
npm install
npm run dev
```

Comandos para crear el proyecto con Vite (si prefieres generar el scaffolding manualmente):

```bash
# Usando npm
npm create vite@latest mi-app -- --template react
cd mi-app
npm install
npm run dev
```

Este repositorio contiene:

- `src/components/CountdownCard.jsx` - componente de la card y lógica de contador.
- `src/data/universidades.js` - datos iniciales.
- `src/App.jsx` - UI principal con buscador y modo oscuro.
- `src/main.jsx` - punto de entrada.
- `src/index.css` - estilos.

Backend (nuevo)
- `server/` - servidor Express que orquesta búsqueda web, envío a IA y predicción histórica.

Arquitectura propuesta (resumen):
- Frontend: consulta `GET /api/university?name=...` y muestra fecha sólo si hay evidencia oficial o confianza alta.
- Backend: realiza búsqueda web (SerpAPI/Bing configurable), envía textos a un modelo de IA (configurable), si IA no encuentra evidencia devuelve null y se activa una predicción histórica conservadora.

Ejecución (desarrollo):
1. Backend:
```bash
cd server
npm install
# configurar variables en .env (ver .env.example)
npm start
```
2. Frontend:
```bash
npm install
npm run dev
```

Notas importantes:
- Para priorizar confiabilidad, la IA debe ser instruida para devolver `null` cuando no haya evidencia clara.
- Configure `SERPAPI_KEY` o un proveedor de búsqueda en `server/.env` y un `AI_API_KEY` para integrar el modelo real.
- El frontend evita mostrar fechas estimadas si la confianza es baja (configurable en `src/components/CountdownCard.jsx`).