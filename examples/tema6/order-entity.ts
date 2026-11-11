// ENTIDAD Y AGGREGATE · El pedido tiene identidad (id), ciclo de vida (estados) e invariantes.
// Order es el Aggregate Root de sus líneas: las líneas solo cambian a través del pedido.
import type { Order, OrderLine, OrderStatus } from '../../src/orders/domain/order';
import { err, ok, type Result } from '../../src/orders/domain/result';

export type OrderError = 'no-lines' | 'invalid-quantity' | 'duplicated-sku' | 'invalid-transition' | 'not-editable';

/** Igualdad de ENTIDAD: misma identidad aunque cambien sus atributos. */
export const sameOrder = (a: Pick<Order, 'id'>, b: Pick<Order, 'id'>): boolean => a.id === b.id;

/** Factory de dominio: si devuelve ok, el pedido cumple TODAS las invariantes. */
export function createOrder(input: Omit<Order, 'status'>): Result<Order, OrderError> {
  const invalid = checkLines(input.lines);
  return invalid ? err(invalid) : ok({ ...input, status: 'pending' });
}

function checkLines(lines: OrderLine[]): OrderError | null {
  if (lines.length === 0) return 'no-lines';
  if (lines.some((l) => !Number.isInteger(l.quantity) || l.quantity <= 0)) return 'invalid-quantity';
  if (new Set(lines.map((l) => l.sku)).size !== lines.length) return 'duplicated-sku';
  return null;
}

/** Ciclo de vida como tabla: añadir un estado obliga a decidir sus transiciones (satisfies). */
export const TRANSITIONS = {
  pending: ['approved', 'cancelled'],
  approved: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
} satisfies Record<OrderStatus, OrderStatus[]>;

export function transition(order: Order, to: OrderStatus): Result<Order, OrderError> {
  const allowed: OrderStatus[] = TRANSITIONS[order.status];
  return allowed.includes(to) ? ok({ ...order, status: to }) : err('invalid-transition');
}

/** Operación del Aggregate Root: la invariante «solo se edita un pendiente» se protege aquí, una vez. */
export function changeQuantity(order: Order, sku: string, quantity: number): Result<Order, OrderError> {
  if (order.status !== 'pending') return err('not-editable');
  const lines = order.lines.map((l) => (l.sku === sku ? { ...l, quantity } : l));
  const invalid = checkLines(lines);
  return invalid ? err(invalid) : ok({ ...order, lines });
}
