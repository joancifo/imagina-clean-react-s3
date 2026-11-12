# ADR-001 · Estructura de la feature Pedidos

- **Estado:** aceptado (versión de referencia del profesor)
- **Fecha:** 12/11/2026
- **Autoría:** Joan Cifo

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
Opción 2: **feature modular** `src/orders` con capas internas y **API pública** (`src/orders/index.ts`).
Criterio: una sola feature de negocio con reglas compartidas por tres pantallas (total, urgencia, cancelación). Las capas internas protegen el núcleo; la API pública permite reorganizar por dentro sin romper a quien la usa.

Usaremos **slices dentro de la feature** (`src/orders/<capacidad>/`) solo cuando una capacidad tenga UI, caso de uso y adapter propios y cambie por su cuenta (candidata: «Aprobar pedido», ver `examples/tema5/approve-order`). Los slices comparten `domain/` y no se importan entre sí.

## Consecuencias
- Positivas: una regla de cancelación en lugar de tres; el heredado solo ve `../orders`; reglas comprobadas en CI (Sesión 9).
- Aceptadas: más carpetas que en una app trivial; un puente temporal (`toOrder`, `toActor`) en la API pública mientras convivan pantallas heredadas.
- Controles: `npm run lint:arch`, `npm run test:arch`, `npm run lint:boundaries`, `npm run rules`.

## Lo que decidimos NO hacer
- **CQRS**: lecturas y escrituras no tienen modelos ni ritmos distintos; separarlas duplicaría tipos.
- **Aggregates en todo el modelo**: solo `Order` protege la consistencia de sus líneas; cliente y usuario no tienen invariantes compartidas.
- **Specification como norma**: `isUrgent` basta mientras no haya combinaciones de filtros de negocio.
- **Capas globales**: con una segunda feature (p. ej. clientes), cada capa mezclaría features.
