// DOMINIO · Value object: motivo de cancelación.
// Origen: src/pages/OrdersPage.tsx (handleCancel) validaba «reason.trim().length < 10» dentro del handler.
// Un value object no tiene identidad: dos motivos con el mismo texto normalizado son el mismo motivo.
import { err, ok, type Result } from './result';

// Branded type: en tiempo de ejecución es un string; para el compilador, solo existe si pasó por la factory.
export type CancellationReason = string & { readonly __brand: 'CancellationReason' };
export type ReasonError = 'too-short' | 'too-long';

export const REASON_MIN_LENGTH = 10;
export const REASON_MAX_LENGTH = 280;

export function createCancellationReason(raw: string): Result<CancellationReason, ReasonError> {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (text.length < REASON_MIN_LENGTH) return err('too-short');
  if (text.length > REASON_MAX_LENGTH) return err('too-long');
  return ok(text as CancellationReason); // único punto del código donde se permite este cast
}
