// Adapter del slice: implementa ApprovalGateway con fetch. Es el único archivo del slice que conoce HTTP.
import type { ApprovalGateway } from './approve-order';

export function createHttpApprovalGateway(fetchFn: typeof fetch = fetch, baseUrl = '/api'): ApprovalGateway {
  return {
    async approve(orderId, approverId) {
      const response = await fetchFn(`${baseUrl}/orders/${orderId}/approve`, { method: 'POST', headers: { 'x-user-id': approverId } });
      if (!response.ok) throw new Error(`No se pudo aprobar ${orderId} (HTTP ${response.status})`);
    },
  };
}
