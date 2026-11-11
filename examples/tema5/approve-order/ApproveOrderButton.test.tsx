// Tema 5 · La UI del slice, probada con el mismo fake: sin servidor, sin mocks de módulos.
import { fireEvent, render, screen } from '@testing-library/react';
import type { Order } from '../../../src/orders/domain/order';
import { ApproveOrderButton } from './ApproveOrderButton';

const pending: Order = {
  id: 'P-1005', customerName: 'Hotel Brisa', customerTier: 'silver', status: 'pending', ownerId: 'u2',
  createdAt: '2026-10-08T10:00:00Z', lines: [{ sku: 'A-10', quantity: 10, unitPrice: 32.5 }],
};

it('muestra la confirmación cuando el gateway aprueba', async () => {
  render(<ApproveOrderButton order={pending} approver={{ id: 'u2', role: 'manager' }} gateway={{ approve: async () => {} }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Pedido P-1005 aprobado');
});

it('muestra el motivo del dominio cuando la regla lo impide', async () => {
  render(<ApproveOrderButton order={pending} approver={{ id: 'u3', role: 'agent' }} gateway={{ approve: async () => {} }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Tu rol no permite aprobar pedidos');
});

it('muestra un error recuperable si falla la red', async () => {
  const failing = { approve: async () => { throw new Error('HTTP 500'); } };
  render(<ApproveOrderButton order={pending} approver={{ id: 'u2', role: 'manager' }} gateway={failing} />);
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
  expect(await screen.findByRole('status')).toHaveTextContent('No se pudo aprobar el pedido');
});
