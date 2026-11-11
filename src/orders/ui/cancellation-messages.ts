// PRESENTACIÓN · Traduce los errores del dominio a mensajes para la persona usuaria.
// El dominio devuelve códigos estables ('too-short'); el texto es una decisión de UX y vive aquí.
// satisfies Record<…>: si el dominio añade un código nuevo, npm run typecheck avisa de que falta su mensaje.
import type { CancellationDenied } from '../domain/cancellation';
import { REASON_MAX_LENGTH, REASON_MIN_LENGTH, type ReasonError } from '../domain/cancellation-reason';

export const CANCELLATION_MESSAGES = {
  'too-short': `El motivo debe tener al menos ${REASON_MIN_LENGTH} caracteres`,
  'too-long': `El motivo no puede superar los ${REASON_MAX_LENGTH} caracteres`,
  'no-session': 'Debes iniciar sesión',
  'already-closed': 'Este pedido ya está cerrado y no se puede cancelar',
  forbidden: 'Tu rol no permite cancelar este pedido',
  'over-manager-limit': 'Este pedido solo lo puede cancelar un administrador',
} satisfies Record<ReasonError | CancellationDenied, string>;
