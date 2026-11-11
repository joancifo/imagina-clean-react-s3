---
applyTo: "src/orders/domain/**,src/orders/application/**"
---
# Núcleo de pedidos (dominio y aplicación)

- Código TypeScript puro: sin React, router, axios, fetch, `window` ni `localStorage`.
- El dominio usa el lenguaje del negocio (`status`, `customerName`), nunca nombres del backend.
- Un caso de uso es una función con una intención de producto, entrada y salida explícitas, y sus dependencias como parámetros tipados con puertos de `application/ports.ts`.
- Cada caso de uso nuevo llega con tests en entorno `node` que usan un doble de prueba del puerto.

## Modelado de dominio (Sesión 3)
- Reglas de negocio como funciones puras en `domain/`. Nunca en JSX, handlers, efectos ni stores.
- Errores previsibles con `Result` (`domain/result.ts`) y códigos estables (`'too-short'`, `'forbidden'`); los textos para la persona usuaria viven en `ui/`.
- Value objects con factory: el cast al branded type solo se permite dentro de la factory.
- Transiciones inmutables: devuelven un objeto nuevo; los eventos de dominio llevan la fecha recibida por parámetro (nada de `new Date()` dentro del dominio).
- No introduzcas Aggregates, Specifications ni Domain Events si una función pura resuelve el caso.
