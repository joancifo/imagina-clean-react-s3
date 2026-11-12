# Solución del ejercicio de la Sesión 3 (versión del profesor)

Repositorio de referencia: este mismo. Diferencias con el de prácticas:

| Archivo | Prácticas | Solución |
|---|---|---|
| `src/orders/domain/cancellation-reason.ts` | Factory «Por implementar» | Implementada |
| `src/orders/domain/cancellation.ts` | Tipos y firmas; funciones «Por implementar» | Regla oficial, `canCancel` y `cancelOrder` |
| `src/orders/index.ts` | Bloques vacíos | API pública completa |
| `eslint.boundaries.js` | Bloque `TODO` | Regla del código heredado |
| `src/pages/*.tsx` | Tres reglas distintas | `canCancel(toOrder(o), toActor(user))` |
| Tests (`.skip`) | 4 bloques omitidos | Todo activo |

## Parte A · paso a paso
```ts
export function createCancellationReason(raw: string): Result<CancellationReason, ReasonError> {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (text.length < REASON_MIN_LENGTH) return err('too-short');
  if (text.length > REASON_MAX_LENGTH) return err('too-long');
  return ok(text as CancellationReason);
}
```
`index.ts` (Parte A):
```ts
export { createCancellationReason, type CancellationReason, type ReasonError } from './domain/cancellation-reason';
export { CANCELLATION_MESSAGES } from './ui/cancellation-messages';
```
`OrdersPage.tsx` · `handleCancel`:
```ts
const parsed = createCancellationReason(reason);
if (!parsed.ok) {
  alert(CANCELLATION_MESSAGES[parsed.error]);
  return;
}
// … trackEvent('order_cancelled', { id: reasonFor.ord_id, reason: parsed.value });
```
Puntos a comentar:
- **Normalizar antes de validar.** El test `'a          b'` pasaba con `trim().length` (12 caracteres) y no es un motivo: tras colapsar quedan 3.
- **El cast vive solo en la factory.** Fuera de ella, `'texto' as CancellationReason` es saltarse la invariante; en revisión se rechaza.
- **Códigos estables, textos en UI.** El dominio no sabe español; `CANCELLATION_MESSAGES` con `satisfies` obliga a dar mensaje a cada código.

## Parte B · paso a paso
```ts
export function checkCancellation(order: Order, actor: Actor | null): Result<Actor, CancellationDenied> {
  if (actor === null) return err('no-session');
  if (order.status === 'shipped' || order.status === 'cancelled') return err('already-closed');
  if (actor.role === 'admin') return ok(actor);
  if (actor.role === 'manager' && order.status === 'pending') {
    return calculateTotal(order) < MANAGER_CANCEL_LIMIT ? ok(actor) : err('over-manager-limit');
  }
  return err('forbidden');
}

export function canCancel(order: Order, actor: Actor | null): boolean {
  return checkCancellation(order, actor).ok;
}

export function cancelOrder(order: Order, actor: Actor | null, reason: CancellationReason, now: Date) {
  const check = checkCancellation(order, actor);
  if (!check.ok) return check;
  return ok({
    order: { ...order, status: 'cancelled' },
    event: { type: 'OrderCancelled', orderId: order.id, cancelledBy: check.value.id, reason, occurredAt: now.toISOString() },
  });
}
```
Puntos a comentar:
- **El orden importa.** `already-closed` va antes que el rol: un pedido enviado está cerrado para todos, también para un admin. Es una invariante del pedido, no un permiso.
- **`ok(actor)` en lugar de `ok(undefined)`.** Quien recibe un `ok` ya tiene el actor autorizado sin volver a comprobar `null` (sin `actor!`).
- **`canCancel` delega.** Si alguien reescribe la regla dentro de `canCancel`, vuelve a haber dos versiones.
- **`now` por parámetro.** El dominio no llama a `new Date()`: el test es determinista y el reloj es un detalle (puerto `Clock` en la Sesión 4).
- **El evento es un hecho pasado** (`OrderCancelled`, no `CancelOrder`). Hoy nadie lo consume; publicarlo es trabajo de la aplicación (Sesión 4).

Errores frecuentes:
- `order.status = 'cancelled'` → el test con `Object.freeze` lanza `TypeError` en modo estricto.
- Comparar el subtotal con 5000 en lugar de `calculateTotal(order)`.
- `<= 5000` en lugar de `< 5000`: la regla dice «menor de 5000 €».

## Parte C · paso a paso
`index.ts` (Parte C):
```ts
export { canCancel, cancelOrder, type Actor, type CancellationDenied, type OrderCancelled } from './domain/cancellation';
export { toOrder } from './infrastructure/order-mapper';
export { toActor } from './infrastructure/actor-mapper';
```
`eslint.boundaries.js`:
```js
{
  files: LEGACY,
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['**/orders/**'], message: 'Usa Pedidos a través de su API pública: import { … } from "../orders".' }],
    }],
  },
},
```
Pantallas:
```ts
// OrdersPage.tsx
const actor = toActor(user);
const canCancelOrder = (o: Order) => canCancel(toOrder(o), actor);
// OrderDetailPage.tsx
const cancellable = canCancel(toOrder(order), toActor(user));
// DashboardPage.tsx
const actor = toActor(user);
const cancellable = orders.filter((o) => canCancel(toOrder(o), actor));
```
Puntos a comentar:
- **`**/orders/**` bloquea `../orders/domain/x` pero no `../orders`**: el patrón exige algo después de `orders/`.
- **El puente `toOrder`/`toActor` en la API pública es temporal** y está marcado como tal: permite que el heredado use el dominio sin conocer sus archivos. Se elimina al migrar las pantallas (Sesión 5).
- **Cambio de comportamiento deliberado**: el detalle ya no ofrece cancelar pedidos enviados o cancelados, y el panel cuenta 4 cancelables para un admin (antes 5). Es la corrección decidida por producto, cubierta por `cancel-order.test.tsx`.
- **El snapshot de `OrdersPage.test.tsx` no cambia**: la regla de la lista era ya la oficial. Si cambiara, habría que preguntarse por qué antes de actualizarlo.

## Verificación
```bash
npm test                 # 26 archivos · 99 tests en verde
npm run typecheck && npm run lint:arch && npm run lint:boundaries
npm run rules            # 29 → 23 candidatos
```
