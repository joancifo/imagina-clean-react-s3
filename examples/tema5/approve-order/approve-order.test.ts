// @vitest-environment node
// Tema 5 · El slice se prueba entero sin red: el gateway es un fake que registra las llamadas.
import type { Order } from '../../../src/orders/domain/order';
import { approveOrder, type ApprovalGateway, type Approver } from './approve-order';

const order = (status: Order['status'], unitPrice: number): Order => ({
  id: 'P-1', customerName: 'Talleres Norte', customerTier: 'standard', status, ownerId: 'u2',
  createdAt: '2026-11-12T10:00:00Z', lines: [{ sku: 'A-10', quantity: 1, unitPrice }],
});
const manager: Approver = { id: 'u2', role: 'manager' };
const admin: Approver = { id: 'u1', role: 'admin' };

function createFakeGateway() {
  const approved: string[] = [];
  const gateway: ApprovalGateway = { approve: async (orderId) => { approved.push(orderId); } };
  return { gateway, approved };
}

it('aprueba un pendiente y llama al gateway una vez', async () => {
  const { gateway, approved } = createFakeGateway();
  expect(await approveOrder(gateway, order('pending', 1000), manager)).toEqual({ ok: true });
  expect(approved).toEqual(['P-1']);
});

it('más de 10.000 € con IVA: el manager no puede y no se llama al gateway', async () => {
  const { gateway, approved } = createFakeGateway();
  expect(await approveOrder(gateway, order('pending', 9000), manager)).toEqual({ ok: false, reason: 'needs-admin' });
  expect(approved).toEqual([]);
});

it('el admin sí puede aprobar más de 10.000 €', async () => {
  const { gateway } = createFakeGateway();
  expect(await approveOrder(gateway, order('pending', 9000), admin)).toEqual({ ok: true });
});
