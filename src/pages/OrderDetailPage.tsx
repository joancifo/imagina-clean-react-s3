import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doAction, getOrder } from '../services/api';
import { formatCurrency, formatDate, trackEvent } from '../shared/utils';
import { useAppStore } from '../store/appStore';
import Badge from '../components/Badge';
import type { Order } from '../shared/types';
import { canCancel, toActor, toOrder } from '../orders';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setToast } = useAppStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (id) getOrder(id).then(setOrder);
  }, [id]);

  // Estado derivado sincronizado con un efecto.
  useEffect(() => {
    if (!order) return;
    const sub = order.ln_items.reduce((acc, l) => acc + l.qty * l.unit_prc, 0);
    const pct = order.cust_tier === 'gold' ? 0.1 : order.cust_tier === 'silver' ? 0.05 : 0;
    setTotal(sub * (1 - pct) * 1.21);
  }, [order]);

  if (!order) return <main className="page">Cargando…</main>;

  // Regla oficial de cancelación (dominio).
  const cancellable = canCancel(toOrder(order), toActor(user));

  const cancel = async () => {
    await doAction(order.ord_id, 'cancel');
    trackEvent('order_cancelled_detail', { id: order.ord_id });
    setToast('Pedido cancelado');
    navigate('/');
  };

  return (
    <main className="page">
      <h1>Pedido {order.ord_id} <Badge status={order.ord_st} /></h1>
      <p>{order.cust_nm} · {formatDate(order.crt_ts)} · {order.cust_tier}</p>
      <table>
        <thead><tr><th>SKU</th><th>Cantidad</th><th>Precio</th><th>Importe</th></tr></thead>
        <tbody>
          {order.ln_items.map((l) => (
            <tr key={l.sku}><td>{l.sku}</td><td>{l.qty}</td><td>{formatCurrency(l.unit_prc)}</td><td>{formatCurrency(l.qty * l.unit_prc)}</td></tr>
          ))}
        </tbody>
      </table>
      <p><strong>Total con IVA: {formatCurrency(total)}</strong></p>
      {cancellable && <button onClick={cancel}>Cancelar pedido</button>}
    </main>
  );
}
