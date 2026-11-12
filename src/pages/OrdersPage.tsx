import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sortBy } from 'lodash';
import OrderRow from '../components/OrderRow';
import useOrders from '../hooks/useOrders';
import { useAppStore } from '../store/appStore';
import { doAction } from '../services/api';
import { formatCurrency, trackEvent } from '../shared/utils';
import type { Order } from '../shared/types';
import { CANCELLATION_MESSAGES, canCancel, createCancellationReason, toActor, toOrder } from '../orders';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, setOrders, loading } = useOrders();
  const { user, filters, setFilters, toast, setToast } = useAppStore();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [sortField, setSortField] = useState('crt_ts');
  const [reason, setReason] = useState('');
  const [reasonFor, setReasonFor] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [compact, setCompact] = useState(false);

  // Efecto 1: restaurar filtros guardados.
  useEffect(() => {
    const saved = localStorage.getItem('orders.filters');
    if (saved) setFilters(JSON.parse(saved));
  }, []);

  // Efecto 2: guardar filtros.
  useEffect(() => {
    localStorage.setItem('orders.filters', JSON.stringify(filters));
  }, [filters]);

  // Efecto 3: estado derivado (lista filtrada).
  useEffect(() => {
    let result = orders;
    if (filters.text) {
      const text = filters.text.toLowerCase();
      result = result.filter((o) => o.cust_nm.toLowerCase().includes(text) || o.ord_id.toLowerCase().includes(text));
    }
    if (filters.status !== 'all') result = result.filter((o) => o.ord_st === filters.status);
    if (filters.onlyMine && user) result = result.filter((o) => o.owner_id === user.usr_id);
    setFilteredOrders(sortBy(result, sortField));
  }, [orders, filters, user, sortField]);

  // Efecto 4: estado derivado de otro estado derivado (contadores).
  useEffect(() => {
    const pending = filteredOrders.filter((o) => o.ord_st === 'pending');
    setPendingCount(pending.length);
    setPendingAmount(pending.reduce((acc, o) => acc + (o.total ?? 0), 0));
    setUrgentCount(pending.filter((o) => (o.total ?? 0) > 3000).length);
  }, [filteredOrders]);

  // Efecto 5: el aviso desaparece solo.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Regla oficial de cancelación: vive en el dominio (src/orders/domain/cancellation.ts).
  const actor = toActor(user);
  const canCancelOrder = (o: Order) => canCancel(toOrder(o), actor);

  const updateOrder = (updated: Order, total: number | undefined) => {
    setOrders(orders.map((o) => (o.ord_id === updated.ord_id ? { ...o, ...updated, total } : o)));
  };

  // Un solo handler valida, autoriza, llama a la API, actualiza estado, mide y navega.
  const handleApprove = async (order: Order) => {
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }
    if (user.usr_role !== 'admin' && user.usr_role !== 'manager') {
      alert('No tienes permisos para aprobar');
      return;
    }
    if (order.ord_st !== 'pending') {
      alert('Solo se aprueban pedidos pendientes');
      return;
    }
    if (order.ln_items.length === 0 || order.ln_items.some((l) => l.qty <= 0)) {
      alert('El pedido tiene líneas no válidas');
      return;
    }
    if ((order.total ?? 0) > 10000 && user.usr_role !== 'admin') {
      alert('Los pedidos de más de 10000 € los aprueba un administrador');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.ord_id}/approve`, { method: 'POST', headers: { 'x-user-id': user.usr_id } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const updated: Order = await res.json();
      updateOrder(updated, order.total);
      trackEvent('order_approved', { id: order.ord_id, total: order.total, role: user.usr_role });
      setToast('Pedido ' + order.ord_id + ' aprobado');
      if ((order.total ?? 0) > 5000) navigate('/orders/' + order.ord_id);
    } catch (error) {
      console.error(error);
      alert('No se pudo aprobar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!reasonFor) return;
    const parsed = createCancellationReason(reason);
    if (!parsed.ok) {
      alert(CANCELLATION_MESSAGES[parsed.error]);
      return;
    }
    setSaving(true);
    const updated = await doAction(reasonFor.ord_id, 'cancel');
    updateOrder(updated, reasonFor.total);
    trackEvent('order_cancelled', { id: reasonFor.ord_id, reason: parsed.value });
    setToast('Pedido cancelado');
    setReasonFor(null);
    setReason('');
    setSaving(false);
  };

  if (loading) return <main className="page">Cargando…</main>;

  return (
    <main className="page">
      <h1>Pedidos</h1>
      <div className="filters">
        <input aria-label="Buscar cliente o pedido" placeholder="Buscar" value={filters.text} onChange={(e) => setFilters({ ...filters, text: e.target.value })} />
        <select aria-label="Estado" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="shipped">Enviados</option>
          <option value="cancelled">Cancelados</option>
        </select>
        <label>
          <input type="checkbox" checked={filters.onlyMine} onChange={(e) => setFilters({ ...filters, onlyMine: e.target.checked })} /> Solo míos
        </label>
        <select aria-label="Ordenar" value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="crt_ts">Fecha</option>
          <option value="total">Importe</option>
          <option value="cust_nm">Cliente</option>
        </select>
        <label>
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Compacto
        </label>
      </div>
      <p className="summary">
        {pendingCount} pendientes por {formatCurrency(pendingAmount)}
        {urgentCount > 0 ? ` · ${urgentCount} urgentes` : ''}
        {user?.usr_role === 'admin' && pendingAmount > 20000 ? ' · Revisar riesgo de crédito' : ''}
      </p>
      {filteredOrders.length === 0 ? (
        <p>{filters.text || filters.status !== 'all' || filters.onlyMine ? 'Sin resultados para estos filtros' : 'Todavía no hay pedidos'}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              {user?.usr_role !== 'agent' && <th>Responsable</th>}
              <th>Estado</th>
              {user?.usr_role !== 'agent' && <th>Total</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <OrderRow
                key={o.ord_id}
                order={o}
                showTotal={user?.usr_role !== 'agent'}
                showDate
                showOwner={user?.usr_role !== 'agent'}
                isAdmin={user?.usr_role === 'admin'}
                isManager={user?.usr_role === 'manager'}
                isCompact={compact}
                isHighlighted={o.ord_st === 'pending' && (o.total ?? 0) > 3000}
                canApprove={o.ord_st === 'pending'}
                canCancel={canCancelOrder(o)}
                disabled={saving}
                ownerName={o.owner_id === user?.usr_id ? 'Yo' : undefined}
                onApprove={handleApprove}
                onCancel={setReasonFor}
                onOpen={(id) => navigate('/orders/' + id)}
              />
            ))}
          </tbody>
        </table>
      )}
      {reasonFor && (
        <div className="dialog" role="dialog" aria-label="Cancelar pedido">
          <h2>Cancelar {reasonFor.ord_id}</h2>
          <textarea aria-label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button onClick={handleCancel} disabled={saving}>Confirmar</button>
          <button onClick={() => setReasonFor(null)}>Volver</button>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
