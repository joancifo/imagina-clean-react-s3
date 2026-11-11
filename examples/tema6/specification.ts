// SPECIFICATION (opcional) · Reglas de selección como predicados con nombre que se combinan.
// Aporta cuando hay MUCHAS combinaciones (filtros, segmentos, campañas). Para una sola regla, isUrgent basta.
import { calculateTotal, type Order, type OrderStatus } from '../../src/orders/domain/order';

export type Spec<T> = (candidate: T) => boolean;

export const and = <T>(...specs: Spec<T>[]): Spec<T> => (c) => specs.every((s) => s(c));
export const or = <T>(...specs: Spec<T>[]): Spec<T> => (c) => specs.some((s) => s(c));
export const not = <T>(spec: Spec<T>): Spec<T> => (c) => !spec(c);

export const hasStatus = (status: OrderStatus): Spec<Order> => (o) => o.status === status;
export const totalAbove = (amount: number): Spec<Order> => (o) => calculateTotal(o) > amount;
export const isGoldCustomer: Spec<Order> = (o) => o.customerTier === 'gold';

// Equivale a isUrgent del dominio, compuesta a partir de piezas reutilizables.
export const urgent = and(hasStatus('pending'), totalAbove(3000));
// Una combinación nueva sin tocar las anteriores (Open/Closed).
export const priorityForSales = and(urgent, isGoldCustomer);
