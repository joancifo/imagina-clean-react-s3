// @vitest-environment node
import { changeQuantity, createOrder, sameOrder, transition } from './order-entity';

const input = { id: 'P-1', customerName: 'Talleres Norte', customerTier: 'gold' as const, ownerId: 'u2', createdAt: '2026-11-12T10:00:00Z', lines: [{ sku: 'A-10', quantity: 2, unitPrice: 30 }] };

describe('factory', () => {
  it('crea pedidos válidos siempre en estado pendiente', () => {
    const result = createOrder(input);
    expect(result.ok && result.value.status).toBe('pending');
  });
  it.each([
    ['sin líneas', [], 'no-lines'],
    ['cantidad 0', [{ sku: 'A', quantity: 0, unitPrice: 1 }], 'invalid-quantity'],
    ['cantidad decimal', [{ sku: 'A', quantity: 1.5, unitPrice: 1 }], 'invalid-quantity'],
    ['SKU repetido', [{ sku: 'A', quantity: 1, unitPrice: 1 }, { sku: 'A', quantity: 2, unitPrice: 1 }], 'duplicated-sku'],
  ])('rechaza %s', (_name, lines, error) => {
    expect(createOrder({ ...input, lines })).toEqual({ ok: false, error });
  });
});

describe('identidad', () => {
  it('dos pedidos con el mismo id son la misma entidad aunque cambie su estado', () => {
    const order = createOrder(input);
    if (!order.ok) throw new Error();
    const approved = transition(order.value, 'approved');
    expect(approved.ok && sameOrder(order.value, approved.value)).toBe(true);
  });
});

describe('ciclo de vida', () => {
  const pending = { ...input, status: 'pending' as const };
  it('pendiente → aprobado → enviado', () => {
    const approved = transition(pending, 'approved');
    expect(approved.ok && transition(approved.value, 'shipped').ok).toBe(true);
  });
  it('enviado es un estado final', () => {
    expect(transition({ ...pending, status: 'shipped' }, 'cancelled')).toEqual({ ok: false, error: 'invalid-transition' });
  });
});

describe('aggregate root', () => {
  const pending = { ...input, status: 'pending' as const };
  it('cambia la cantidad de una línea a través del pedido', () => {
    const result = changeQuantity(pending, 'A-10', 5);
    expect(result.ok && result.value.lines[0].quantity).toBe(5);
  });
  it('protege las invariantes de las líneas y del estado', () => {
    expect(changeQuantity(pending, 'A-10', 0)).toEqual({ ok: false, error: 'invalid-quantity' });
    expect(changeQuantity({ ...pending, status: 'approved' }, 'A-10', 5)).toEqual({ ok: false, error: 'not-editable' });
  });
});
