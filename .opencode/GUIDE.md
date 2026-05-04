# Team Ensemble — Guia de Usuario

## Formacion del Equipo

El Team Ensemble es un equipo freelance de 6 agentes de IA especializados, orquestados bajo OpenCode. Cada agente corre sobre un modelo distinto optimizado para su funcion.

```
                               USUARIO
                                  |
                            @architect (PRIMARY)
                           Qwen3.6 Plus · Go
                     /           |           \
                    /            |            \
             @context      @designer      @developer
           Gemini 3       MiniMax M2.7   DeepSeek V4 Pro
             Flash                         Go
                \            |            /
                 \           |           /
                  @guardian  |  @analyst
                DeepSeek V4  |  Claude Sonnet 4.6
                  Flash      |  Zen
```

### Miembros

| # | Agente | Modelo | Proveedor | Color | Funcion |
|---|--------|--------|-----------|-------|---------|
| 1 | `@architect` | Qwen3.6 Plus | Go | `#7c3aed` | Estratega de Sistemas |
| 2 | `@context` | Gemini 3 Flash | Zen | `#f59e0b` | Gestor de Conocimiento |
| 3 | `@designer` | MiniMax M2.7 | Go | `#ec4899` | Especialista UI/Frontend |
| 4 | `@developer` | DeepSeek V4 Pro | Go | `#10b981` | Ingeniero de Backend |
| 5 | `@guardian` | DeepSeek V4 Flash | Go | `#ef4444` | Control de Calidad |
| 6 | `@analyst` | Claude Sonnet 4.6 | Zen | `#0ea5e9` | Validacion Logica y Seguridad |

---

## Como Iniciar

```bash
cd C:\Lambert
opencode
```

El agente por defecto es `@architect`. Escribi tu requerimiento y el equipo se organiza solo. Para cambiar manualmente de agente, usa **Tab**.

---

## Flujo de Trabajo (Inalterable)

Toda tarea sigue este pipeline secuencial. No se puede saltear pasos.

```
FASE 1              FASE 2              FASE 3 (PARALELO)         FASE 4              FASE 5
@context  --------> @architect --------> @designer (FE) ──┐      @guardian --------> @analyst
Descubrimiento      Diseno              @developer (BE) ──┘      Blindaje              Validacion
                                        (trabajan juntos)
```

### Fase 1 — Descubrimiento (`@context`)
- Confirma versiones de librerias desde lockfiles (`package.json`, etc.).
- Lee documentacion externa usando `webfetch` con `https://r.jina.ai/` como prefijo (Clean Scraper).
- Busca patrones y convenciones en el codigo existente.
- **Regla de Oro**: No alucina. Si no hay datos, reporta `INSUFICIENTE`.

### Fase 2 — Diseno (`@architect`)
- Define Input / Output / Transformacion de la tarea.
- Selecciona stack, librerias y patrones.
- **Define el contrato de interfaz** entre frontend y backend (endpoints, tipos de datos, codigos HTTP).
- Delega a `@designer` y `@developer` **EN PARALELO** con especificaciones separadas pero consistentes.
- **Solo el Architect toma decisiones de estructura.**

### Fase 3 — Construccion Paralela (`@designer` + `@developer`)
- **@designer**: Implementa TODO lo frontend (HTML, SCSS, componentes Angular, servicios de UI). Trabaja asumiendo el contrato de interfaz.
- **@developer**: Implementa TODO lo backend (controllers, repositorios, servicios Express, queries SQL). Asegura que el response cumpla el contrato.
- **Ambos trabajan simultaneamente** en sus directorios separados sin interferencia.
- Modularizacion obligatoria: funciones cortas, responsabilidad unica.
- Usan **FORMATO DIFF** (nunca reescriben archivos enteros).
- Si usan una libreria nueva, invocan a `@context` antes.

### Fase 4 — Blindaje (`@guardian`)
- Ejecuta linter automaticamente (`npm run lint` + `npx tsc --noEmit`) en AMBOS proyectos.
- Revisa bugs, seguridad (OWASP Top 10), tipado TypeScript.
- **Verifica consistencia del contrato**: el response del backend matchea los tipos del frontend.
- **Poder de veto**: FAIL automatico si falta `try/catch` o hay `catch {}` vacios.
- Emite `PASS` o `FAIL` por cada lado. Sin PASS en ambos, la tarea no se entrega.

### Fase 5 — Validacion (`@analyst`)
- Valida logica de negocio: formulas, calculos, reglas de dominio.
- Verifica seguridad logica: IDOR, escalada de privilegios, bypass de validaciones.
- Confirma consistencia entre capas (frontend ↔ backend ↔ BD).
- Emite `LOGICA-PASS` o `LOGICA-FAIL`. Sin LOGICA-PASS, la tarea no se considera completa.

---

## Regla de Bloqueo

```
Ni @designer ni @developer confirman tarea sin PASS de @guardian.
Si @guardian emite FAIL en un lado → ese agente corrige → @guardian revisa de nuevo.
El agente que paso WAIT hasta que el otro tambien pase.
Ciclo repetido hasta obtener PASS en AMBOS lados.

Ninguna tarea se considera completa sin LOGICA-PASS de @analyst.
```

## Contrato de Interfaz (Clave para Trabajo Paralelo)

El Architect define el contrato ANTES de delegar. Ambos agentes lo reciben:

```typescript
// Contrato ejemplo: GET /api/pedidos
// Architect le pasa esto a AMBOS agentes:

interface PedidoResponse {
  id: number;
  cliente: string;
  fecha: string;  // ISO 8601
  total: number;
}

// Success: 200 → PedidoResponse[]
// Error: 401 → { error: string }
// Error: 500 → { error: string }
```

- **@designer** implementa el componente asumiendo esta forma de datos.
- **@developer** implementa el endpoint asegurando que el response matchee exactamente.
- **@guardian** verifica que ambos lados coincidan.

---

## Separacion Frontend/Backend (Inquebrantable)

| Capa | Responsable | Directorio |
|------|-------------|------------|
| **Frontend** (HTML, SCSS, Angular components, servicios UI) | `@designer` | `Lambert-app-front-main/` |
| **Backend** (Express, controllers, repos, SQL, middlewares) | `@developer` | `Lambert-app-back-main/` |

- El Designer **NUNCA** toca archivos del backend.
- El Developer **NUNCA** toca archivos del frontend.
- **Trabajan EN PARALELO** cuando la tarea es fullstack, coordinados por el contrato de interfaz del Architect.
- Si una tarea requiere cambios en ambos lados, el Architect delega a ambos simultaneamente.

---

## Herramientas por Agente

### `@designer`
| Herramienta | Uso |
|-------------|-----|
| `read / write / edit` | Manipulacion de archivos frontend (HTML, SCSS, TS components) |
| `webfetch` | Documentacion de Bootstrap, Angular, patrones UX |
| `bash: npm run lint` | Verificar linting del frontend |
| `bash: npx tsc --noEmit` | Verificar tipado TypeScript del frontend |

### `@developer`
| Herramienta | Uso |
|-------------|-----|
| `bash` | Scripts Node, `npm install`, servidores |
| `skill: sql-executor` | DESCRIBE de tablas, queries reales, verificacion de constraints |
| `skill: api-client` | curl, requests, payloads de prueba a webhooks y APIs |
| `read / write / edit` | Manipulacion directa de archivos backend |
| `task: context` | Delegar investigacion de librerias nuevas |

### `@context`
| Herramienta | Uso |
|-------------|-----|
| `webfetch` | Navegar documentacion (con prefijo `r.jina.ai`) |
| `websearch` | Buscar informacion actualizada |
| `read / grep / glob` | Analizar codebase, logs, PDFs |

### `@guardian`
| Herramienta | Uso |
|-------------|-----|
| `read / grep / glob` | Inspeccion de codigo |
| `bash: npm run lint` | Linter JS/TS |
| `bash: npx tsc --noEmit` | Verificacion de tipos TypeScript |

---

## Estandares Globales

| Estandar | Detalle |
|----------|---------|
| **Idioma** | Respuestas, UI y docs en espanol |
| **TypeScript** | Type hints en TODAS las funciones. Sin `any` injustificado |
| **Estilos** | Bootstrap 5 exclusivamente. Nada de CSS custom innecesario |
| **DIFF** | Solo bloques `<<<< BUSQUEDA / ==== / >>>> REEMPLAZO`. Sin archivos enteros |
| **Clean Scraper** | `https://r.jina.ai/` antepuesto a toda URL |
| **Auto-Linter** | Linter ejecutado por guardian antes de aprobar |
| **Separacion** | Designer = frontend, Developer = backend. Nunca se cruzan |

---

## Ejemplo de Sesion

```
Usuario: Necesito un dashboard con tarjetas de estadisticas y un endpoint que devuelva totales

@context: Verifica versiones de Angular, Bootstrap, Express instaladas.
          Reporta: Angular 20, Bootstrap 5.3, Express 4.21, compatibles.

@architect: Define contrato de interfaz:
            GET /api/dashboard/totales → { pedidosHoy: number, ingresos: number, clientes: number }
            Delega EN PARALELO:
              → @designer: componente dashboard-cards con esos tipos
              → @developer: endpoint GET /api/dashboard/totales con esa response

@designer: (trabaja en paralelo) Crea dashboard-cards con HTML Bootstrap, SCSS, logica TS.
           Usa tipos del contrato. Estados loading/error. No espera al developer.

@developer: (trabaja en paralelo) Crea dashboard.controller.ts con endpoint GET /totals.
            Query SQL con agregaciones. Response matchea contrato exacto. No espera al designer.

@guardian: Ejecuta npm run lint + tsc --noEmit en AMBOS proyectos.
           Verifica que el response del backend matchea los tipos del frontend.
           Revisa try/catch, tipado, Bootstrap correcto. Emite PASS en ambos lados.

@analyst: Valida que las agregaciones SQL sean correctas.
           Verifica que el frontend muestra los mismos datos que el backend.
           Emite LOGICA-PASS.

@architect: Tarea completada. Entrega resumen al usuario.
```
