// DOMAIN SERVICE · Una regla que no pertenece a UN pedido: depende de varios.
// Origen: src/pages/OrdersPage.tsx (resumen) · «pendingAmount > 20000 → Revisar riesgo de crédito».
// Quién VE el aviso (solo admin) es presentación/permisos; cuándo HAY riesgo es negocio.
import { calculateTotal, type Order } from '../../src/orders/domain/order';

export const CREDIT_REVIEW_FROM = 20000;

export function pendingExposure(orders: Order[]): number {
  return orders.filter((o) => o.status === 'pending').reduce((sum, o) => sum + calculateTotal(o), 0);
}

export function needsCreditReview(orders: Order[]): boolean {
  return pendingExposure(orders) > CREDIT_REVIEW_FROM;
}
