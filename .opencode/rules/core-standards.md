# Core Standards — Reglas Inquebrantables para Ahorrar Tokens

## 1. FORMATO DIFF — Obligatorio para @developer y @designer

**Nunca devuelvas un archivo entero reescrito.**

Usa siempre bloques de busqueda y reemplazo con el formato:

```
ARCHIVO: [path]
<<<< BUSQUEDA
[codigo exacto a encontrar — minimo 5 lineas de contexto, sin lineas ambiguas]
====
[codigo de reemplazo]
>>>> REEMPLAZO
```

Reglas:
- El bloque BUSQUEDA debe ser suficientemente unico para matchear una sola ocurrencia. Si no es unico, agrega mas lineas de contexto.
- Si necesitas modificar varias secciones del mismo archivo, usa bloques separados, no reescribas el archivo entero.
- Si creas un archivo nuevo desde cero, usa `write`, no diff.
- Esta regla aplica tanto a @developer (backend) como a @designer (frontend).

## 2. CLEAN SCRAPER — Obligatorio para @context

**Cada vez que leas una URL externa, antepone `https://r.jina.ai/` para extraer solo el texto limpio en Markdown.**

```
❌ INCORRECTO: webfetch("https://docs.ejemplo.com/api/v2")
✅ CORRECTO:   webfetch("https://r.jina.ai/https://docs.ejemplo.com/api/v2")
```

Esto elimina HTML, scripts, estilos y ruido. Recibis solo el contenido relevante en Markdown, ahorrando tokens.

## 3. AUTO-LINTER — Obligatorio para @guardian

**Antes de emitir PASS, ejecuta automaticamente el linter correspondiente.**

```
Backend:  bash("npm run lint") en Lambert-app-back-main
Frontend: bash("npm run lint") en Lambert-app-front-main
TS Check: bash("npx tsc --noEmit") en ambos proyectos
```

Reglas:
- Si el linter arroja errores, **NO me preguntes a mi**. Pasale el log de errores directamente al agente correspondiente (@developer para backend, @designer para frontend).
- El PASS solo se emite si el linter pasa limpio (exit code 0).
- Si el proyecto no tiene linter configurado, advertilo como FAIL con severidad ALTO.

## 4. SEPARACION FRONTEND/BACKEND — Inquebrantable

- **@designer** trabaja SOLO en `Lambert-app-front-main/`. Nunca toca backend.
- **@developer** trabaja SOLO en `Lambert-app-back-main/`. Nunca toca frontend.
- Si una tarea requiere cambios en ambos lados, el Architect la divide en dos sub-tareas.
