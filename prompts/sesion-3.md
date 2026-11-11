# Prompts de la Sesión 3 — GitHub Copilot en Visual Studio Code

Chat: `Ctrl+Alt+I` (Windows/Linux) · `⌃⌘I` (macOS). Usa **Ask** para analizar y **Edit/Agent** solo cuando decidas aplicar un cambio.

## P1 · Analizar la estructura (Tema 5)
```
#codebase Para la capacidad "Cancelar pedido", lista TODOS los archivos que participan
(regla, botón, diálogo, llamada HTTP, analítica, aviso) con ruta:línea y su carpeta.
Después compara cuántos archivos y carpetas habría que tocar en: capas globales,
feature modular con capas internas y Vertical Slice. No propongas cambios todavía.
```
Contrasta el resultado con `npm run boundaries` y `grep -rn cancel src`.

## P2 · Cazar reglas de negocio escondidas (Tema 6)
```
#codebase Localiza reglas de negocio dentro de JSX, handlers, useEffect y stores
fuera de src/orders. Para cada una: ruta:línea, la regla en lenguaje de negocio,
si está duplicada o contradice a otra, y si es negocio, permisos o presentación.
Separa hechos de hipótesis.
```
Contrasta con `npm run rules`: el script da candidatos; la clasificación la haces tú.

## P3 · Extraer una regla a un módulo puro conservando el comportamiento
```
#file:src/pages/OrdersPage.tsx #file:src/orders/domain/cancellation.ts
Extrae la regla de APROBACIÓN de handleApprove a src/orders/domain/approval.ts
con el mismo estilo que cancellation.ts (Result con códigos de error estables).
Antes de mover nada, escribe tests que fijen el comportamiento actual.
Sin React, sin alert, sin fetch. No modifiques OrdersPage todavía.
```
Después: `npm test && npm run lint:arch`. Revisa que los tests fijan el comportamiento actual, no el que la IA cree correcto.

## P4 · Casos límite de un value object
```
#file:src/orders/domain/cancellation-reason.ts ¿Qué casos límite no cubren
los tests de cancellation-reason.test.ts? (saltos de línea, tabuladores, emojis,
cadenas vacías…). Propón tests nuevos y di cuáles cambiarían el comportamiento
si se añadieran. No modifiques la implementación.
```

## Criterio de revisión de las respuestas
1. ¿La regla extraída es idéntica a la original o la IA la ha «corregido» sin decirlo?
2. ¿El dominio sigue sin importar React, fetch ni `localStorage`? (`npm run lint:arch`)
3. ¿Crea Aggregates, Specifications o eventos donde una función basta?
4. ¿Los tests describen comportamiento en lenguaje de negocio?
