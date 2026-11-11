// @vitest-environment node
import type { Order } from '../../src/orders/domain/order';
import { needsCreditReview, pendingExposure } from './credit-risk';

const order = (id: string, status: Order['status'], unitPrice: number): Order => ({
  id, customerName: 'Cliente', customerTier: 'standard', status, ownerId: 'u1', createdAt: '2026-11-12T10:00:00Z',
  lines: [{ sku: 'A', quantity: 1, unitPrice }],
});

it('solo suma pendientes, con IVA', () => {
  expect(pendingExposure([order('P-1', 'pending', 10000), order('P-2', 'approved', 50000)])).toBeCloseTo(12100);
});

it('más de 20.000 € pendientes → revisión de crédito', () => {
  expect(needsCreditReview([order('P-1', 'pending', 10000), order('P-2', 'pending', 7000)])).toBe(true); // 20.570 €
  expect(needsCreditReview([order('P-1', 'pending', 10000), order('P-2', 'pending', 6000)])).toBe(false); // 19.360 €
});
