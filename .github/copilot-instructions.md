# Instrucciones para GitHub Copilot — OrderDesk

Este repositorio es material de formación con code smells intencionados en el código heredado (`src/pages`, `src/services`, `src/shared`, `src/store`, `src/hooks`, `src/components`).

## Forma de trabajar
- Durante el diagnóstico, no modifiques archivos: analiza y propón.
- Cita siempre la evidencia como `ruta:línea`. Si no encuentras evidencia, indícalo.
- Separa hechos observados de hipótesis.
- Propón cambios pequeños, reversibles y revisables en un solo Pull Request.
- No propongas reescrituras completas ni nuevas librerías sin justificar el coste.

## Arquitectura objetivo (`src/orders`)
- Capas: `domain` → `application` → `infrastructure` / `ui`, conectadas en `composition.ts`.
- Las dependencias de código fuente apuntan hacia dentro: `domain` no importa nada de otras capas.
- `domain` y `application` no importan React, react-router ni axios, ni usan `window`, `document`, `localStorage` o `fetch`.
- `ui` no importa `infrastructure`: usa casos de uso y la composición.
- Los nombres del backend (`ord_st`, `cust_nm`…) solo aparecen en `infrastructure/order-dto.ts` y `order-mapper.ts`.
- El código de fuera de `src/orders` importa solo su API pública: `import { … } from '../orders'` (`npm run lint:boundaries`).
- Comprueba cualquier propuesta con `npm run lint:arch`, `npm run test:arch` y `npm run lint:boundaries`.
- No crees interfaces con una sola implementación si no cruzan un límite de capa.
