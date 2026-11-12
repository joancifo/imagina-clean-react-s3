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

/** Devuelve el actor ya autorizado: quien recibe un ok no necesita volver a comprobar null. */
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

export function cancelOrder(
  order: Order,
  actor: Actor | null,
  reason: CancellationReason,
  now: Date,
): Result<{ order: Order; event: OrderCancelled }, CancellationDenied> {
  const check = checkCancellation(order, actor);
  if (!check.ok) return check;
  return ok({
    order: { ...order, status: 'cancelled' },
    event: { type: 'OrderCancelled', orderId: order.id, cancelledBy: check.value.id, reason, occurredAt: now.toISOString() },
  });
}
