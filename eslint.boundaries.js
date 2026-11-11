// BOUNDARIES ENTRE FEATURES · El código de fuera de src/orders solo usa Pedidos a través de su API pública.
// Así src/orders puede reorganizarse por dentro (capas, slices…) sin romper a quien la usa.
// Documentación: https://eslint.org/docs/latest/rules/no-restricted-imports
import tseslint from 'typescript-eslint';

const LEGACY = ['pages', 'components', 'hooks', 'store', 'shared', 'services'].map((dir) => `src/${dir}/**/*.{ts,tsx}`);

export default tseslint.config(
  // El plugin se registra para que los comentarios «eslint-disable» del heredado se reconozcan.
  { files: ['src/**/*.{ts,tsx}'], languageOptions: { parser: tseslint.parser }, plugins: { '@typescript-eslint': tseslint.plugin }, linterOptions: { reportUnusedDisableDirectives: 'off' } },

  // CÓDIGO HEREDADO: «../orders» sí; «../orders/domain/…», «../orders/infrastructure/…» no.
  // TODO (Parte C): files: LEGACY
  //   no-restricted-imports → patrón '**/orders/**'
  //   mensaje: 'Usa Pedidos a través de su API pública: import { … } from "../orders".'
);
