// @vitest-environment node
import { add, applyRate, equals, euros, times, toNumber } from './money';

it('el problema: con number, 0.1 + 0.2 no es 0.3', () => {
  expect(0.1 + 0.2 === 0.3).toBe(false);
});

it('con Money sí: céntimos enteros', () => {
  expect(equals(add(euros(0.1), euros(0.2)), euros(0.3))).toBe(true);
});

it('igualdad por valor, no por referencia', () => {
  expect(euros(10) === euros(10)).toBe(false);
  expect(equals(euros(10), euros(10))).toBe(true);
});

it('es inmutable', () => {
  expect(Object.isFrozen(euros(5))).toBe(true);
});

it('protege su invariante: no hay importes negativos ni NaN', () => {
  expect(() => euros(-1)).toThrow(RangeError);
  expect(() => euros(Number.NaN)).toThrow(RangeError);
});

it('calcula una línea con descuento e IVA redondeando al céntimo', () => {
  const line = times(euros(32.5), 10); // 325,00 €
  expect(toNumber(applyRate(applyRate(line, -0.05), 0.21))).toBe(373.59);
});
