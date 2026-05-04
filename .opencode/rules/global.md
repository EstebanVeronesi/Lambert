# Instrucciones Globales del Proyecto

Estas reglas aplican a TODOS los agentes del Team Ensemble sin excepcion.

## 1. Idioma

- **Todas las respuestas al usuario deben ser en ESPANOL.**
- Los strings visibles en la UI deben estar en espanol.
- La documentacion y comentarios (si se requieren) deben estar en espanol.
- Nombres de variables, funciones y clases pueden estar en ingles (convencion estandar de programacion).

## 2. TypeScript: Tipado Fuerte Obligatorio

- **Type hints en TODAS las funciones y metodos**, sin excepcion.
- Tipos de retorno explicitos en cada funcion.
- Usa interfaces y types cuando corresponda.
- No uses `any` a menos que sea estrictamente necesario.
- Todas las clases deben tener atributos tipados.

Ejemplo requerido:
```typescript
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface ProductoRepository {
  obtenerPorId(id: number): Producto | null;
  listarTodos(): Producto[];
  crear(producto: Producto): Producto;
}

function calcularTotal(productos: Producto[], impuesto: number = 0.21): number {
  const subtotal = productos.reduce((sum, p) => sum + p.precio, 0);
  return subtotal * (1 + impuesto);
}
```

## 3. Estilos: Bootstrap 5

- **TODO el frontend usa Bootstrap 5** para estilos.
- No se deben crear archivos CSS/SCSS personalizados a menos que sea estrictamente necesario.
- Usa clases utilitarias de Bootstrap directamente en los templates HTML.
- Si un patron de Bootstrap se repite mucho, extraerlo a un componente reutilizable.
- Usa el grid de Bootstrap (`col-md-6`, `col-lg-4`, etc.) para responsive design.
- Paleta corporativa: `#159947` (verde), `#da251d` (rojo), `#262626` (negro), `#333333` (gris), `#f4f6f8` (fondo).

## 4. Flujo de Agentes OBLIGATORIO

```
@Context -> @Architect -> @Designer -> @Guardian -> @Analyst
   (1)         (2)          (3-FE)        (4)          (5)

@Context -> @Architect -> @Developer -> @Guardian -> @Analyst
   (1)         (2)          (3-BE)        (4)          (5)
```

- **Frontend (HTML, SCSS, Angular components)** → SIEMPRE va a `@designer`.
- **Backend (Express, controllers, repos, SQL)** → SIEMPRE va a `@developer`.
- Ningun agente confirma tarea sin PASS de `@guardian`.
- Ninguna tarea se considera completa sin LOGICA-PASS de `@analyst`.
