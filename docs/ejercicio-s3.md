# Ejercicio Sesión 3 · Una sola regla de cancelación

**Duración:** 45 minutos (18:45 – 19:30) · **Corrección:** 15 minutos (19:30 – 19:45)
**Avance del proyecto final:** reglas de negocio en módulos puros, un value object, una entidad con transición y evento, y la API pública de la feature Pedidos.

```bash
git checkout -b s3/<tu-nombre>
npm install
npm test        # todo en verde; 4 bloques omitidos (skipped): los activarás tú
```

## Contexto: decisión de producto
OrderDesk tiene **tres** reglas de cancelación distintas (`npm run rules` las localiza):

| Pantalla | Regla actual | Problema |
|---|---|---|
| `OrdersPage.tsx` | admin: pendiente o aprobado · manager: pendiente y total < 5000 € | La única coherente |
| `OrderDetailPage.tsx` | admin: siempre · manager: si no está enviado | Un admin puede «cancelar» un pedido enviado o ya cancelado |
| `DashboardPage.tsx` | admin: si no está enviado · manager: pendiente y total ≤ 6000 € **sin descuento** | Otro límite y otro total |

Producto decide la **regla oficial**:
1. Sin sesión, nadie cancela.
2. Un pedido **enviado** o **cancelado** está cerrado: no se cancela nunca.
3. **Admin:** cancela pendientes y aprobados.
4. **Manager:** cancela pendientes con total (con descuento e IVA) **menor de 5000 €**.
5. **Agente:** no cancela.
6. El motivo es obligatorio: tras quitar espacios sobrantes, entre 10 y 280 caracteres.

## Parte A · Value object `CancellationReason` (15 min · 18:45 – 19:00)
Archivos: `src/orders/domain/cancellation-reason.ts` y su `.test.ts`.

1. Quita `.skip` del `describe` del test. Fallan 5 tests: es lo esperado.
2. Implementa `createCancellationReason(raw)`:
   - Normaliza: `trim()` y colapsa espacios interiores (`/\s+/g` → `' '`).
   - Devuelve `err('too-short')`, `err('too-long')` u `ok(texto as CancellationReason)` (usa `ok`/`err` de `domain/result.ts`).
3. Expón el value object y los mensajes en la API pública `src/orders/index.ts` (bloque «Parte A»).
4. En `src/pages/OrdersPage.tsx` (`handleCancel`), sustituye `reason.trim().length < 10` por la factory. Si falla, `alert(CANCELLATION_MESSAGES[parsed.error])`. Importa **solo** desde `'../orders'`.
5. En `src/pages/cancel-order.test.tsx`, quita `.skip` del bloque «Parte A».
6. `npm test` → verde en lo que has activado.

## Parte B · Regla oficial y transición con evento (15 min · 19:00 – 19:15)
Archivos: `src/orders/domain/cancellation.ts` y su `.test.ts`.

1. Quita `.skip` de los dos `describe`. Los tests fallan: es lo esperado.
2. `checkCancellation(order, actor)`: aplica la regla oficial **en este orden**: `no-session` → `already-closed` → admin ok → manager (pendiente y `calculateTotal(order) < MANAGER_CANCEL_LIMIT`, si no `over-manager-limit`) → `forbidden`. En caso de éxito devuelve `ok(actor)`.
3. `canCancel(order, actor)`: un booleano para la UI. **No repitas la regla.**
4. `cancelOrder(order, actor, reason, now)`: si la comprobación falla, devuelve el mismo error. Si no, devuelve `{ order, event }` con un pedido **nuevo** en estado `cancelled` (no modifiques el original) y el evento `OrderCancelled` (`occurredAt: now.toISOString()`).
5. `npm test && npm run typecheck && npm run lint:arch` → verde.

## Parte C · API pública y una sola regla en las pantallas (15 min · 19:15 – 19:30)
1. En `src/orders/index.ts`, bloque «Parte C»: exporta `canCancel`, `cancelOrder` y sus tipos, y el **puente temporal** `toOrder` (de `infrastructure/order-mapper`) y `toActor` (de `infrastructure/actor-mapper`).
2. Sustituye las tres reglas heredadas por `canCancel(toOrder(o), toActor(user))`:
   - `OrdersPage.tsx`: el cuerpo de `canCancelOrder`.
   - `OrderDetailPage.tsx`: la constante `canCancel` (renómbrala, p. ej. `cancellable`, para no ocultar la función importada).
   - `DashboardPage.tsx`: `cancellable`, filtrando `orders` (el pedido completo), no `rows`.
3. En `eslint.boundaries.js`, escribe la regla del bloque `TODO`: el código heredado no puede importar `**/orders/**` (sí `../orders`). Mensaje: `Usa Pedidos a través de su API pública: import { … } from "../orders".`
4. Quita `.skip` en `src/orders/boundaries.test.ts` y en el bloque «Parte C» de `src/pages/cancel-order.test.tsx`.
5. Comprobación final:
   ```bash
   npm test && npm run typecheck && npm run lint:arch && npm run lint:boundaries
   npm run rules        # antes: 29 candidatos · después: 23
   ```

## Entrega
```bash
git add -A
git commit -m "feat(orders): regla oficial de cancelación, value object y API pública"
git push -u origin s3/<tu-nombre>
```
Abre el Pull Request y completa la checklist de la plantilla (incluye el bloque «Dominio»).

## Ampliación (si terminas antes)
- Usa `needsCreditReview` (`examples/tema6/credit-risk.ts`) para el aviso «Revisar riesgo de crédito» de `OrdersPage`. ¿Dónde debe vivir la condición «solo admin»?
- Pide a Copilot el prompt P3 de `prompts/sesion-3.md` para extraer la regla de **aprobación** a `src/orders/domain`. Compara su propuesta con `examples/tema5/approve-order` y anota qué aceptarías y qué no.
- Completa `docs/adr/001-estructura-pedidos.md` con tu decisión de estructura (hito del proyecto final).
