// @vitest-environment node
// Ejercicio S3 · Parte B · Especificación de la regla oficial de cancelación y de la transición.
import { cancelOrder, canCancel, checkCancellation, type Actor, type CancellationDenied } from './cancellation';
import { createCancellationReason, type CancellationReason } from './cancellation-reason';
import type { Order, OrderStatus } from './order';

// Builder: crea pedidos válidos y deja cambiar solo lo que importa en cada test.
const anOrder = (status: OrderStatus, unitPrice = 1000): Order => ({
  id: 'P-1', customerName: 'Talleres Norte', customerTier: 'standard', status, ownerId: 'u2',
  createdAt: '2026-11-12T10:00:00Z', lines: [{ sku: 'A-10', quantity: 1, unitPrice }],
});
const admin: Actor = { id: 'u1', role: 'admin' };
const manager: Actor = { id: 'u2', role: 'manager' };
const agent: Actor = { id: 'u3', role: 'agent' };
const reason = (text: string): CancellationReason => {
  const result = createCancellationReason(text);
  if (!result.ok) throw new Error('motivo de prueba no válido');
  return result.value;
};

describe('regla oficial de cancelación', () => {
  // Totales con IVA (cliente standard): 1000 → 1210 € · 4000 → 4840 € · 4200 → 5082 €
  const cases: [string, Order, Actor | null, true | CancellationDenied][] = [
    ['sin sesión', anOrder('pending'), null, 'no-session'],
    ['admin · pendiente', anOrder('pending'), admin, true],
    ['admin · aprobado', anOrder('approved'), admin, true],
    ['admin · enviado', anOrder('shipped'), admin, 'already-closed'],
    ['admin · ya cancelado', anOrder('cancelled'), admin, 'already-closed'],
    ['manager · pendiente de 4840 €', anOrder('pending', 4000), manager, true],
    ['manager · pendiente de 5082 €', anOrder('pending', 4200), manager, 'over-manager-limit'],
    ['manager · aprobado', anOrder('approved'), manager, 'forbidden'],
    ['manager · enviado', anOrder('shipped'), manager, 'already-closed'],
    ['agente · pendiente', anOrder('pending'), agent, 'forbidden'],
  ];

  it.each(cases)('%s', (_name, order, actor, expected) => {
    const check = checkCancellation(order, actor);
    expect(check.ok ? true : check.error).toBe(expected);
    expect(canCancel(order, actor)).toBe(expected === true);
  });
});

describe('cancelOrder', () => {
  const now = new Date('2026-11-12T18:00:00Z');

  it('devuelve el pedido cancelado y el evento OrderCancelled', () => {
    const result = cancelOrder(anOrder('pending'), admin, reason('Cliente duplicado en el ERP'), now);
    expect(result).toEqual({
      ok: true,
      value: {
        order: expect.objectContaining({ id: 'P-1', status: 'cancelled' }),
        event: { type: 'OrderCancelled', orderId: 'P-1', cancelledBy: 'u1', reason: 'Cliente duplicado en el ERP', occurredAt: '2026-11-12T18:00:00.000Z' },
      },
    });
  });

  it('no modifica el pedido original (inmutabilidad)', () => {
    const original = Object.freeze(anOrder('pending'));
    cancelOrder(original, admin, reason('Cliente duplicado en el ERP'), now);
    expect(original.status).toBe('pending');
  });

  it('si la regla lo impide, devuelve el motivo y no hay evento', () => {
    expect(cancelOrder(anOrder('shipped'), admin, reason('Cliente duplicado en el ERP'), now)).toEqual({ ok: false, error: 'already-closed' });
  });

  it('solo acepta motivos que hayan pasado por la factory (comprobación de tipos)', () => {
    // npm run typecheck falla si CancellationReason deja de ser un branded type.
    const typeOnly = () =>
      // @ts-expect-error un string sin validar no es un CancellationReason
      cancelOrder(anOrder('pending'), admin, 'motivo sin validar', now);
    expect(typeof typeOnly).toBe('function');
  });
});
