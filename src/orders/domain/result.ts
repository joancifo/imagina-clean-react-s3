// DOMINIO · Resultado explícito para errores PREVISIBLES (entrada no válida, regla incumplida).
// Un error previsible forma parte del contrato: el compilador obliga a tratarlo.
// Los errores de programación o de infraestructura siguen siendo excepciones.
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
