# Arquitectura objetivo de la feature Pedidos

```
src/orders/
├── domain/           Entidades, tipos y reglas del negocio (TypeScript puro)
├── application/      Casos de uso y puertos (interfaces que el núcleo necesita)
├── infrastructure/   Adapters: HTTP, memoria, storage, analytics + DTO y mappers
├── ui/               Hooks adaptadores, view models y componentes
├── composition.ts    Elige implementaciones concretas y las conecta
└── index.ts          API pública: lo único que el resto de la app puede importar
```

| Capa | Anillo de Clean Architecture | Puede importar | No puede importar |
|---|---|---|---|
| `domain` | Entidades | — | todo lo demás, frameworks, globales del navegador |
| `application` | Casos de uso | `domain` | `infrastructure`, `ui`, `composition`, frameworks |
| `infrastructure` | Adaptadores de interfaz (conducidos) | `domain`, `application` (puertos) | `ui`, `composition` |
| `ui` | Adaptadores de interfaz (presentación) | `domain`, `application`, `composition` | `infrastructure` |
| `composition.ts` | Frameworks y drivers / main | todo | — |

Reglas automáticas: `eslint.architecture.js` (`npm run lint:arch`) y su test (`npm run test:arch`); `eslint.boundaries.js` (`npm run lint:boundaries`) para la API pública.

## Mi clasificación del código heredado (tarea antes de la Sesión 3)
Copia este archivo como `docs/arquitectura-<tu-nombre>.md` y completa la tabla.

| Responsabilidad en el código actual | Evidencia `ruta:línea` | Capa destino | Primer paso para moverla |
|---|---|---|---|
| Total con descuento e IVA | `src/shared/utils.ts:13` | domain | Ya existe `calculateTotal` en `src/orders/domain/order.ts` |
| | | | |
