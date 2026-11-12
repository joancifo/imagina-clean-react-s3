// @vitest-environment node
// Ejercicio S3 · Parte A · Especificación del value object CancellationReason.
import { createCancellationReason, REASON_MAX_LENGTH, REASON_MIN_LENGTH } from './cancellation-reason';

describe('CancellationReason', () => {
  it('normaliza: quita espacios en los extremos y colapsa los interiores', () => {
    expect(createCancellationReason('  Cliente   duplicado  en el ERP ')).toEqual({ ok: true, value: 'Cliente duplicado en el ERP' });
  });

  it('rechaza un motivo corto aunque esté relleno de espacios', () => {
    expect(createCancellationReason('     corto      ')).toEqual({ ok: false, error: 'too-short' });
    expect(createCancellationReason('a          b')).toEqual({ ok: false, error: 'too-short' });
  });

  it(`acepta exactamente ${REASON_MIN_LENGTH} caracteres y rechaza uno menos`, () => {
    expect(createCancellationReason('x'.repeat(REASON_MIN_LENGTH)).ok).toBe(true);
    expect(createCancellationReason('x'.repeat(REASON_MIN_LENGTH - 1))).toEqual({ ok: false, error: 'too-short' });
  });

  it(`acepta exactamente ${REASON_MAX_LENGTH} caracteres y rechaza uno más`, () => {
    expect(createCancellationReason('x'.repeat(REASON_MAX_LENGTH)).ok).toBe(true);
    expect(createCancellationReason('x'.repeat(REASON_MAX_LENGTH + 1))).toEqual({ ok: false, error: 'too-long' });
  });

  it('la igualdad es por valor: mismo texto normalizado, mismo motivo', () => {
    const a = createCancellationReason('Pedido   duplicado');
    const b = createCancellationReason(' Pedido duplicado ');
    expect(a.ok && b.ok && a.value === b.value).toBe(true);
  });
});
