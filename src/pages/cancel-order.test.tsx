// Ejercicio S3 · Partes A y C · Comportamiento visible de la regla de cancelación en las pantallas heredadas.
// Se prueba lo que ve la persona usuaria (botones, textos, avisos), no cómo está escrito el código.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import * as api from '../services/api';
import { AppStoreProvider, useAppStore } from '../store/appStore';
import type { Order, User } from '../shared/types';
import OrdersPage from './OrdersPage';
import OrderDetailPage from './OrderDetailPage';
import DashboardPage from './DashboardPage';

vi.mock('../services/api');

const ADMIN: User = { usr_id: 'u1', usr_nm: 'Marta', usr_role: 'admin' };
const MANAGER: User = { usr_id: 'u2', usr_nm: 'Pau', usr_role: 'manager' };

// Mismos datos que server/index.mjs (totales con descuento e IVA entre paréntesis).
const ORDERS: Order[] = [
  { ord_id: 'P-1001', cust_nm: 'Talleres Norte', cust_tier: 'gold', ord_st: 'pending', owner_id: 'u2', crt_ts: '2026-10-02T09:15:00Z', ln_items: [{ sku: 'A-10', qty: 40, unit_prc: 32.5 }, { sku: 'B-20', qty: 4, unit_prc: 210 }] }, // 2330,46 €
  { ord_id: 'P-1002', cust_nm: 'Ferretería Sol', cust_tier: 'silver', ord_st: 'approved', owner_id: 'u2', crt_ts: '2026-10-03T11:40:00Z', ln_items: [{ sku: 'C-30', qty: 12, unit_prc: 18 }] }, // 248,29 €
  { ord_id: 'P-1003', cust_nm: 'Construcciones Vega', cust_tier: 'gold', ord_st: 'pending', owner_id: 'u3', crt_ts: '2026-10-05T08:05:00Z', ln_items: [{ sku: 'D-40', qty: 60, unit_prc: 95 }] }, // 6207,30 €
  { ord_id: 'P-1004', cust_nm: 'Clínica Dental Mar', cust_tier: 'standard', ord_st: 'shipped', owner_id: 'u3', crt_ts: '2026-10-06T16:20:00Z', ln_items: [{ sku: 'E-50', qty: 3, unit_prc: 140 }] }, // 508,20 €
  { ord_id: 'P-1005', cust_nm: 'Hotel Brisa', cust_tier: 'silver', ord_st: 'pending', owner_id: 'u2', crt_ts: '2026-10-08T10:00:00Z', ln_items: [{ sku: 'A-10', qty: 10, unit_prc: 32.5 }] }, // 373,59 €
  { ord_id: 'P-1006', cust_nm: 'Logística Ebro', cust_tier: 'standard', ord_st: 'cancelled', owner_id: 'u3', crt_ts: '2026-10-09T12:30:00Z', ln_items: [{ sku: 'F-60', qty: 1, unit_prc: 900 }] }, // 1089,00 €
];
const byId = (id: string) => ORDERS.find((o) => o.ord_id === id)!;

function SeedUser({ user }: { user: User }) {
  const { setUser } = useAppStore();
  useEffect(() => setUser(user), [setUser, user]);
  return null;
}

function renderAt(path: string, user: User) {
  vi.mocked(api.getMe).mockResolvedValue(user);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppStoreProvider>
        <SeedUser user={user} />
        <Routes>
          <Route path="/" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </AppStoreProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(api.getOrders).mockResolvedValue(ORDERS);
  vi.mocked(api.getOrder).mockImplementation(async (id) => byId(id));
  vi.mocked(api.sendLog).mockResolvedValue(undefined);
  vi.mocked(api.doAction).mockImplementation(async (id) => ({ ...byId(id), ord_st: 'cancelled' }));
});

afterEach(() => vi.restoreAllMocks());

describe('Parte A · el motivo se valida con el value object', () => {
  it('un motivo de espacios no cuenta como texto: avisa y no llama a la API', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderAt('/', MANAGER);
    const row = (await screen.findByRole('button', { name: 'P-1005' })).closest('tr') as HTMLElement;
    fireEvent.click(within(row).getByRole('button', { name: 'Cancelar' }));
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'a          b' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(alert).toHaveBeenCalledWith('El motivo debe tener al menos 10 caracteres');
    expect(api.doAction).not.toHaveBeenCalled();
  });
});

describe('Parte C · una sola regla de cancelación en las tres pantallas', () => {
  it('detalle: un admin NO puede cancelar un pedido ya enviado', async () => {
    renderAt('/orders/P-1004', ADMIN);
    await screen.findByText(/Total con IVA/);
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).toBeNull();
  });

  it('detalle: un manager NO puede cancelar un pendiente de 6207,30 €', async () => {
    renderAt('/orders/P-1003', MANAGER);
    await screen.findByText(/Total con IVA/);
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).toBeNull();
  });

  it('detalle: un manager SÍ puede cancelar un pendiente de 373,59 €', async () => {
    renderAt('/orders/P-1005', MANAGER);
    expect(await screen.findByRole('button', { name: 'Cancelar pedido' })).toBeInTheDocument();
  });

  it('panel: un admin puede cancelar 4 pedidos (pendientes y aprobados, nunca cerrados)', async () => {
    renderAt('/dashboard', ADMIN);
    await waitFor(() => expect(screen.getByText('Cancelables por ti').querySelector('h2')?.textContent).toBe('4'));
  });
});
