// UI del slice: recibe el gateway por props (inyección) y traduce el resultado a un mensaje.
import { useState } from 'react';
import type { Order } from '../../../src/orders/domain/order';
import { approveOrder, type ApprovalGateway, type ApprovalRejected, type Approver } from './approve-order';

const MESSAGES = {
  forbidden: 'Tu rol no permite aprobar pedidos',
  'not-pending': 'Solo se aprueban pedidos pendientes',
  'needs-admin': 'Los pedidos de más de 10.000 € los aprueba un administrador',
} satisfies Record<ApprovalRejected, string>;

type Props = { order: Order; approver: Approver; gateway: ApprovalGateway };

export function ApproveOrderButton({ order, approver, gateway }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      const result = await approveOrder(gateway, order, approver);
      setMessage(result.ok ? `Pedido ${order.id} aprobado` : MESSAGES[result.reason]);
    } catch {
      setMessage('No se pudo aprobar el pedido. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={onClick} disabled={busy}>Aprobar</button>
      {message && <p role="status">{message}</p>}
    </>
  );
}
