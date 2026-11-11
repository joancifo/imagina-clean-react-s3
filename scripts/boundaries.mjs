// Mapa de dependencias entre carpetas de primer nivel de src/ y accesos al interior de src/orders.
// Pregunta que responde: ¿cuánto se conocen las carpetas entre sí? ¿Quién se salta la API pública de Pedidos?
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = resolve('src');
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const files = walk(root).filter((f) => /\.tsx?$/.test(f) && !/\.test\.|setupTests|main\.tsx/.test(f));
const folderOf = (file) => {
  const parts = relative(root, file).split(sep);
  return parts.length > 1 ? parts[0] : '(raíz)';
};
const resolveImport = (from, spec) => {
  const base = resolve(dirname(from), spec);
  return [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')].find((c) => files.includes(c));
};

const matrix = {};
const deep = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const [, spec] of source.matchAll(/from\s+'(\.[^']+)'/g)) {
    const target = resolveImport(file, spec);
    if (!target) continue;
    const [a, b] = [folderOf(file), folderOf(target)];
    if (a === b) continue;
    matrix[a] ??= {};
    matrix[a][b] = (matrix[a][b] ?? 0) + 1;
    if (b === 'orders' && a !== 'orders' && !target.endsWith(join('orders', 'index.ts'))) {
      deep.push(`${relative('.', file).replaceAll('\\', '/')} → ${spec}`);
    }
  }
}

console.log('\nImports entre carpetas (fila importa de columna)');
console.table(matrix);
const pairs = Object.values(matrix).reduce((n, row) => n + Object.keys(row).length, 0);
console.log(`Pares de carpetas acopladas: ${pairs}`);
console.log(`\nAccesos al interior de src/orders saltándose su API pública: ${deep.length}`);
for (const line of deep) console.log(`  ${line}`);
