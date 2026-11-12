// @vitest-environment node
// Ejercicio S3 · Parte C · La API pública de Pedidos se hace cumplir con ESLint (eslint.boundaries.js).
import { ESLint } from 'eslint';

const eslint = new ESLint({ overrideConfigFile: 'eslint.boundaries.js' });

async function errorsFor(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((m) => m.ruleId ?? 'parse-error');
}

describe('API pública de Pedidos', () => {
  it('el código heredado no puede importar el interior de src/orders', async () => {
    expect(await errorsFor('src/pages/X.tsx', "import { canCancel } from '../orders/domain/cancellation';")).toContain('no-restricted-imports');
    expect(await errorsFor('src/hooks/x.ts', "import { toOrder } from '../orders/infrastructure/order-mapper';")).toContain('no-restricted-imports');
  });

  it('sí puede importar la API pública', async () => {
    expect(await errorsFor('src/pages/X.tsx', "import { canCancel } from '../orders';\nexport const f = canCancel;")).toEqual([]);
  });

  it('el código heredado real cumple la regla', async () => {
    const results = await eslint.lintFiles(['src/pages', 'src/components', 'src/hooks', 'src/store', 'src/shared', 'src/services']);
    const errors = results.flatMap((r) => r.messages.map((m) => `${r.filePath}:${m.line} ${m.message}`));
    expect(errors).toEqual([]);
  });
});
