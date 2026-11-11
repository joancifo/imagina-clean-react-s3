// @vitest-environment node
import { isUrgent, type Order } from '../../src/orders/domain/order';
import { not, priorityForSales, urgent } from './specification';

const order = (status: Order['status'], unitPrice: number, customerTier: Order['customerTier'] = 'standard'): Order => ({
  id: 'P-1', customerName: 'Cliente', customerTier, status, ownerId: 'u1', createdAt: '2026-11-12T10:00:00Z',
  lines: [{ sku: 'A', quantity: 1, unitPrice }],
});
const samples = [order('pending', 3000), order('pending', 100), order('approved', 9000), order('pending', 5000, 'gold')];

it('la especificación compuesta equivale a la regla del dominio', () => {
  expect(samples.map(urgent)).toEqual(samples.map(isUrgent));
});

it('las combinaciones nuevas no modifican las existentes', () => {
  expect(samples.filter(priorityForSales)).toHaveLength(1);
  expect(samples.filter(not(urgent))).toHaveLength(2);
});
