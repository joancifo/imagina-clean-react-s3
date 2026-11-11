// VERTICAL SLICE «Aprobar pedido» · Regla y comando de esta capacidad, en la misma carpeta que su UI y sus tests.
// Comparte con el resto de Pedidos solo el modelo de dominio (Order, calculateTotal): un contrato común, no un vertedero.
import { calculateTotal, type Order } from '../../../src/orders/domain/order';

export type Approver = { id: string; role: 'admin' | 'manager' | 'agent' };
export type ApprovalRejected = 'forbidden' | 'not-pending' | 'needs-admin';
export type ApproveResult = { ok: true } | { ok: false; reason: ApprovalRejected };

export const ADMIN_ONLY_FROM = 10000;

/** Puerto propio del slice: lo único que necesita del exterior. */
export interface ApprovalGateway {
  approve(orderId: string, approverId: string): Promise<void>;
}

export function decideApproval(order: Order, approver: Approver): ApproveResult {
  if (approver.role === 'agent') return { ok: false, reason: 'forbidden' };
  if (order.status !== 'pending') return { ok: false, reason: 'not-pending' };
  if (calculateTotal(order) > ADMIN_ONLY_FROM && approver.role !== 'admin') return { ok: false, reason: 'needs-admin' };
  return { ok: true };
}

/** Comando del slice: decide y, si procede, ejecuta. No sabe si el gateway es HTTP o un fake. */
export async function approveOrder(gateway: ApprovalGateway, order: Order, approver: Approver): Promise<ApproveResult> {
  const decision = decideApproval(order, approver);
  if (decision.ok) await gateway.approve(order.id, approver.id);
  return decision;
}
