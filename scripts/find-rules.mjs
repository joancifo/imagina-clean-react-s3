// Caza de reglas de negocio escondidas fuera del dominio (src/orders queda excluido).
// Heurística: comparaciones de rol o estado, umbrales numéricos, longitudes mínimas y porcentajes.
// Da CANDIDATOS: cada línea se revisa a mano (un 5000 puede ser un timeout, no una regla).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve('src');
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const files = walk(root).filter((f) => /\.tsx?$/.test(f) && !/\.test\.|setupTests|main\.tsx/.test(f) && !f.includes(join('src', 'orders')));

const KINDS = [
  ['rol', /usr_role\s*[!=]==/],
  ['estado', /ord_st\s*[!=]==/],
  ['umbral', /[<>]=?\s*\d{3,}/],
  ['longitud', /\.length\s*[<>]=?\s*\d+/],
  ['porcentaje', /\b(1\.21|0\.1|0\.05)\b/],
];

const rows = [];
for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const kinds = KINDS.filter(([, re]) => re.test(line)).map(([k]) => k);
    if (kinds.length) rows.push({ ubicacion: `${relative('.', file).replaceAll('\\', '/')}:${i + 1}`, tipo: kinds.join('+'), codigo: line.trim().slice(0, 70) });
  });
}
console.table(rows);
const byFile = rows.reduce((acc, r) => ({ ...acc, [r.ubicacion.split(':')[0]]: (acc[r.ubicacion.split(':')[0]] ?? 0) + 1 }), {});
console.log('Candidatos por archivo:', byFile);
