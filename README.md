# Lambert — Simulador Técnico de Carrocerías sobre Chasis

Sistema web para la simulación técnica de carrocerías sobre chasis de camiones. Calcula distribución de cargas, verifica normativas vigentes y genera recomendaciones inteligentes de diseño.

## Tecnologías

| Capa | Stack |
|------|-------|
| **Frontend** | Angular 20, TypeScript, Bootstrap 5.3 |
| **Backend** | Node.js, Express, TypeScript |
| **Base de datos** | PostgreSQL 16 |
| **Autenticación** | JWT (httpOnly cookies) |
| **Validación** | Zod schemas |
| **Testing** | Jest (backend), Jasmine (frontend) |

## Estructura del proyecto

```
Lambert/
├── Lambert-app-front-main/     # Frontend Angular
│   ├── src/app/
│   │   ├── auth/               # Login y autenticación
│   │   ├── pages/
│   │   │   ├── dashboard/      # Panel principal
│   │   │   ├── formulario/     # Wizard de simulación (4 pasos)
│   │   │   ├── mis-pedidos/    # Gestión de pedidos
│   │   │   ├── camiones/       # CRUD de camiones
│   │   │   ├── clientes/       # CRUD de clientes
│   │   │   └── usuarios/       # Gestión de usuarios
│   │   ├── services/           # Servicios HTTP
│   │   ├── shared/             # Componentes reutilizables
│   │   └── types/              # Interfaces TypeScript
│   └── src/assets/             # Recursos estáticos
│
├── Lambert-app-back-main/      # Backend Express
│   ├── src/
│   │   ├── controllers/        # Controladores de rutas
│   │   ├── repositories/       # Acceso a base de datos
│   │   ├── routes/             # Definición de endpoints
│   │   ├── services/           # Lógica de negocio (simulación)
│   │   ├── schemas/            # Validación con Zod
│   │   ├── middleware/         # Auth, validación, error handling
│   │   ├── types/              # Tipos TypeScript
│   │   └── utils/              # Logger y utilidades
│   ├── index.ts                # Entry point
│   └── config.ts               # Configuración de entorno
│
└── documentacion-simulacion.html  # Documentación técnica completa
```

## Motor de Simulación

### Fórmula Maestra — Equilibrio de Momentos

El cálculo central se basa en la **fórmula de equilibrio de momentos pivotando sobre el eje trasero** (Celda N64 del modelo original):

```
momentoCarroceria = cargaUtilCarroceria × (distEjes - centroCargaCaja)
momentoTaraDel    = taraDelantera × distEjes
momentoCargaExtra = cargaExtraTotal × (distEjes - posCargaExtra)

pesoRealDelantero = (momentoCarroceria + momentoTaraDel + momentoCargaExtra) / distEjes
```

### Verificaciones normativas

| Verificación | 4x2 | 6x2 |
|-------------|-----|-----|
| **Distribución eje delantero** | 30% — 36% del PBT | 23% — 27% del PBT |
| **Voladizo trasero máximo** | 60% de distancia entre ejes | 60% de distancia entre ejes |
| **PBT máximo** | 16,500 kg | 24,000 kg |

### Sistema de recomendaciones

Las soluciones se clasifican en 3 niveles de prioridad:

- **Prioridad 1** — No requiere cambiar el camión (reducir carrocería, ajustar separación, mover cargas)
- **Prioridad 2** — Requiere modificar el chasis (desplazar eje, alargar/cortar chasis)
- **Prioridad 3** — Requiere cambiar el camión (cambiar a 6x2, ajustar PBT, otro modelo)

## Instalación

### Requisitos

- Node.js >= 18
- PostgreSQL 16
- npm >= 9

### Backend

```bash
cd Lambert-app-back-main
cp .env.example .env   # Configurar credenciales de base de datos
npm install
npm run dev            # Servidor en http://localhost:3000
```

### Frontend

```bash
cd Lambert-app-front-main
npm install
npm start              # Servidor en http://localhost:4200
```

### Variables de entorno (.env)

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=lambert
DB_PASSWORD=tu_password
DB_PORT=5432
SECRET_JWT_KEY=tu_clave_secreta
PORT=3000
```

## Base de datos

El sistema requiere PostgreSQL con las siguientes tablas principales:

- **users** — Usuarios del sistema (admin, vendedor)
- **clientes** — Clientes con CUIT como clave primaria
- **camiones** — Catálogo de camiones con sus especificaciones técnicas
- **pedidos** — Pedidos/simulaciones con estado (Pendiente, En Producción, Entregado)
- **configuracion_camion** — Configuración técnica del chasis
- **calculos** — Resultados de la simulación
- **carroceria** — Datos de la carrocería
- **cargas_extra** — Cargas adicionales por pedido

## Endpoints principales

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/register` | Registrar usuario |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/status` | Verificar sesión activa |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/pedidos` | Listar todos los pedidos |
| GET | `/api/admin/pedidos/:id` | Detalle de pedido |
| PUT | `/api/admin/pedidos/:id` | Actualizar estado/fecha |
| DELETE | `/api/admin/pedidos/:id` | Eliminar pedido |
| GET | `/api/admin/pedidos/:id/imprimir` | Vista de impresión |

### Simulación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/proyectos/simular` | Ejecutar simulación |
| POST | `/api/proyectos/guardar` | Guardar proyecto completo |

### Catálogos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/camiones` | Listar camiones verificados |
| POST | `/api/camiones` | Crear camión |
| DELETE | `/api/camiones/:id` | Eliminar camión |
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Crear cliente |
| DELETE | `/api/clientes/:cuit` | Eliminar cliente |

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total: gestión de pedidos, camiones, clientes, usuarios |
| **vendedor** | Crear simulaciones, ver sus pedidos, gestionar clientes |

## Flujo de simulación

1. **Paso 1 — Camión**: Selección del camión base (marca, modelo, tipo 4x2/6x2)
2. **Paso 2 — Configuración**: Datos del chasis, carrocería y cargas extra
3. **Paso 3 — Resultados**: Cálculos técnicos, verificaciones, diagrama de carga y recomendaciones
4. **Paso 4 — Cliente**: Asignación del pedido a un cliente y guardado

## Documentación técnica

Se incluye un documento HTML completo con todas las fórmulas, datos de entrada, verificaciones y recomendaciones:

```
documentacion-simulacion.html
```

Abrir en navegador y usar `Ctrl+P → Guardar como PDF` para exportar.

## Licencia

Proyecto privado — Lambert
