// API PÚBLICA de la feature Pedidos.
// El código de fuera de src/orders importa SOLO desde aquí: import { … } from '../orders'.
// Lo que no se exporta es interno y puede cambiar sin avisar a nadie (eslint.boundaries.js lo hace cumplir).

// TODO Parte A · motivo de cancelación:
//   createCancellationReason y sus tipos (domain/cancellation-reason) · CANCELLATION_MESSAGES (ui/cancellation-messages)

// TODO Parte C · regla oficial de cancelación:
//   canCancel, cancelOrder y sus tipos (domain/cancellation)

// TODO Parte C · puente TEMPORAL para el código heredado (src/pages…): traduce sus modelos al dominio.
//   toOrder (infrastructure/order-mapper) · toActor (infrastructure/actor-mapper)
//   Desaparece cuando las pantallas se migren a src/orders/ui (Sesión 5).

export {};
