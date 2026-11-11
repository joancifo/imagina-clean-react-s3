// DOMINIO · Regla oficial de cancelación y transición del pedido.
// Sustituye a las TRES versiones contradictorias del código heredado:
//   src/pages/OrdersPage.tsx (canCancelOrder) · src/pages/OrderDetailPage.tsx (canCancel) · src/pages/DashboardPage.tsx (cancellable)
import type { CancellationReason } from './cancellation-reason';
import { calculateTotal, type Order } from './order';
import { err, ok, type Result } from './result';

export type Role = 'admin' | 'manager' | 'agent';
export type Actor = { id: string; role: Role };

/** Un manager solo cancela pedidos pendientes por debajo de este total (con descuento e IVA). */
export const MANAGER_CANCEL_LIMIT = 5000;

export type CancellationDenied = 'no-session' | 'already-closed' | 'forbidden' | 'over-manager-limit';

/** Domain Event: algo relevante que YA ha ocurrido. Datos, no comportamiento. */
export type OrderCancelled = {
  type: 'OrderCancelled';
  orderId: string;
  cancelledBy: string;
  reason: CancellationReason;
  occurredAt: string; // ISO 8601
};

// Ejercicio S3 · Parte B · paso 2: regla oficial, en este orden:
// no-session → already-closed → admin ok → manager (pendiente y total < MANAGER_CANCEL_LIMIT) → forbidden.
/** Devuelve el actor ya autorizado: quien recibe un ok no necesita volver a comprobar null. */
export function checkCancellation(order: Order, actor: Actor | null): Result<Actor, CancellationDenied> {
  void [order, actor, calculateTotal, err, ok];
  throw new Error('Por implementar (ejercicio S3 · Parte B · paso 2)');
}

// Paso 3: booleano para la UI. No repitas la regla: delega.
export function canCancel(order: Order, actor: Actor | null): boolean {
  void [order, actor];
  throw new Error('Por implementar (ejercicio S3 · Parte B · paso 3)');
}

// Paso 4: pedido NUEVO en estado 'cancelled' + evento OrderCancelled (occurredAt = now.toISOString()).
export function cancelOrder(
  order: Order,
  actor: Actor | null,
  reason: CancellationReason,
  now: Date,
): Result<{ order: Order; event: OrderCancelled }, CancellationDenied> {
  void [order, actor, reason, now];
  throw new Error('Por implementar (ejercicio S3 · Parte B · paso 4)');
}
