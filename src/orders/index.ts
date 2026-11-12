// API PÚBLICA de la feature Pedidos.
// El código de fuera de src/orders importa SOLO desde aquí: import { … } from '../orders'.
// Lo que no se exporta es interno y puede cambiar sin avisar a nadie (eslint.boundaries.js lo hace cumplir).

// Parte A · motivo de cancelación
export { createCancellationReason, type CancellationReason, type ReasonError } from './domain/cancellation-reason';
export { CANCELLATION_MESSAGES } from './ui/cancellation-messages';

// Parte B y C · regla oficial de cancelación
export { canCancel, cancelOrder, type Actor, type CancellationDenied, type OrderCancelled } from './domain/cancellation';

// Puente TEMPORAL para el código heredado (src/pages…): traduce sus modelos al dominio.
// Desaparece cuando las pantallas se migren a src/orders/ui (Sesión 5).
export { toOrder } from './infrastructure/order-mapper';
export { toActor } from './infrastructure/actor-mapper';
