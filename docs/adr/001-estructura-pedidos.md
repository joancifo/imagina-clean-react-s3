# ADR-001 · Estructura de la feature Pedidos

- **Estado:** propuesto
- **Fecha:** 12/11/2026
- **Autoría:** <tu-nombre>

## Contexto
- OrderDesk organiza el código heredado **por tipo** (`pages`, `components`, `hooks`, `services`, `shared`, `store`). `npm run boundaries`: 14 pares de carpetas acopladas.
- «Cancelar pedido» participa en 7 archivos de 5 carpetas (`pages` ×3, `components/OrderRow`, `services/api`, `shared/utils`, `store/appStore`).
- `src/orders` ya existe con capas internas (`domain`, `application`, `infrastructure`, `ui`) y reglas en `eslint.architecture.js`.
- Tamaño: una feature de negocio principal (Pedidos), 3 pantallas, unas 700 líneas de código de producción. Equipo pequeño.

## Opciones consideradas
| Opción | A favor | En contra |
|---|---|---|
| 1. Capas globales (`src/domain`, `src/application`…) | Simple con una sola feature | Al crecer, cada capa mezcla features |
| 2. Feature modular con capas internas (`src/orders/{domain,application,…}`) | Cohesión por feature y regla de dependencia | Más carpetas que en una app trivial |
| 3. Vertical Slice por capacidad (`src/orders/approve-order/…`) | Cada cambio en una carpeta | Riesgo de duplicar reglas entre slices |

## Decisión
<!-- Escribe tu decisión y el criterio que la justifica. Ejemplo de formato:
Elegimos la opción N porque… Aplicaremos slices dentro de la feature solo cuando… -->

## Consecuencias
<!-- Qué ganamos, qué aceptamos perder, qué controles automáticos lo protegen (comandos). -->

## Lo que decidimos NO hacer
<!-- p. ej. CQRS, contenedor IoC, Aggregates en todo el modelo… y por qué. -->
