# Checklist SOLID para revisar un Pull Request

Cada pregunta se responde con evidencia (`ruta:línea`, salida de un comando o un test). «Sí» sin evidencia cuenta como «no lo sé».

| Principio | Pregunta de revisión | Señal de alarma en React/TypeScript | Comprobación |
|---|---|---|---|
| SRP | ¿Cuántos actores (negocio, UX, analítica, backend) pueden pedir cambios en este archivo? | Un handler que valida, autoriza, llama a la API, mide y navega | Lista de responsabilidades; test de la regla sin React |
| OCP | Para añadir un estado/rol/nivel, ¿cuántos archivos hay que editar? | Cadenas de ternarios o `switch` repetidos en varias pantallas | `satisfies Record<Union, …>` y `npm run typecheck` |
| LSP | ¿La nueva implementación cumple lo que promete el contrato, no solo la firma? | Un fake que nunca falla; un adapter que lanza donde el contrato devuelve `null` | Test de contrato ejecutado contra cada implementación |
| ISP | ¿Recibe datos que no usa? | Props con el modelo completo del backend; un contexto que lo expone todo | Contar props/campos usados frente a recibidos |
| DIP | ¿El núcleo importa detalles? | `fetch`, axios, `localStorage` o React en reglas y casos de uso | `npm run lint:arch` |
| Abstracción | ¿La interfaz nueva aporta? | `IFoo` + `FooImpl` con una sola implementación y sin límite que cruzar | ¿Hay 2 implementaciones reales (contando los tests) o un límite de capa? |

## Dominio (Sesión 3)
| Pregunta | Señal de alarma | Comprobación |
|---|---|---|
| ¿La regla de negocio vive en `domain/` una sola vez? | El mismo umbral o rol comparado en varias pantallas | `npm run rules` |
| ¿Los valores con reglas propias son value objects? | `string`/`number` validados en el handler | Factory + tests del value object |
| ¿Los errores previsibles están en el tipo de retorno? | `throw` o `alert` para una regla de negocio | `Result<…>` y `satisfies Record<Error, string>` |
| ¿Las transiciones son inmutables? | Mutar el pedido recibido | Test con `Object.freeze` |
| ¿Se respeta la API pública de la feature? | `import … from '../orders/domain/…'` desde fuera | `npm run lint:boundaries` |

Fuentes: R. C. Martin, *Clean Architecture* (2017), caps. 7–11; E. Evans, *Domain-Driven Design* (2003); V. Vernon, *Implementing Domain-Driven Design* (2013); documentación de ESLint (`no-restricted-imports`, `no-restricted-globals`); TypeScript 4.9 (`satisfies`).
