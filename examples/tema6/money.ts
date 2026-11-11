// VALUE OBJECT · Money. Sin identidad, inmutable, igualdad por valor y con invariantes propias.
// Problema que resuelve: 0.1 + 0.2 !== 0.3 en coma flotante. Se guardan céntimos enteros.
export type Money = Readonly<{ cents: number; currency: 'EUR' }>;

/** Factory: única puerta de entrada. Un importe imposible es un error de programación → excepción. */
export function euros(amount: number): Money {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError(`Importe no válido: ${amount}`);
  return Object.freeze({ cents: Math.round(amount * 100), currency: 'EUR' });
}

const fromCents = (cents: number): Money => Object.freeze({ cents, currency: 'EUR' });

export const add = (a: Money, b: Money): Money => fromCents(a.cents + b.cents);
export const times = (a: Money, quantity: number): Money => fromCents(a.cents * quantity);
/** Aplica un porcentaje (descuento −0.1, IVA +0.21) redondeando al céntimo. */
export const applyRate = (a: Money, rate: number): Money => fromCents(Math.round(a.cents * (1 + rate)));
export const equals = (a: Money, b: Money): boolean => a.cents === b.cents && a.currency === b.currency;
export const toNumber = (a: Money): number => a.cents / 100;
// Formatear («1.234,50 €») NO es responsabilidad del value object: es presentación (ui/formatters).
