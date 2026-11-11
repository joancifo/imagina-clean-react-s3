// DOMINIO · Value object: motivo de cancelación.
// Origen: src/pages/OrdersPage.tsx (handleCancel) validaba «reason.trim().length < 10» dentro del handler.
// Un value object no tiene identidad: dos motivos con el mismo texto normalizado son el mismo motivo.
import type { Result } from './result';
// Necesitarás también: import { err, ok } from './result';

// Branded type: en tiempo de ejecución es un string; para el compilador, solo existe si pasó por la factory.
export type CancellationReason = string & { readonly __brand: 'CancellationReason' };
export type ReasonError = 'too-short' | 'too-long';

export const REASON_MIN_LENGTH = 10;
export const REASON_MAX_LENGTH = 280;

// Ejercicio S3 · Parte A: normaliza (trim y espacios interiores colapsados) y valida la longitud.
// Devuelve err('too-short'), err('too-long') u ok(texto as CancellationReason).
export function createCancellationReason(raw: string): Result<CancellationReason, ReasonError> {
  void raw;
  throw new Error('Por implementar (ejercicio S3 · Parte A)');
}
