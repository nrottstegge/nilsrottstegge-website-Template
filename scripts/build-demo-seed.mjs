import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';

// The sandbox receives only copies of public content, never credentials.
const root = new URL('../', import.meta.url);
const files = {};
for (const folder of ['_data', '_projects']) {
  for (const name of await readdir(new URL(`${folder}/`, root))) {
    if (/\.(json|md)$/.test(name)) files[`${folder}/${name}`] = await readFile(new URL(`${folder}/${name}`, root), 'utf8');
  }
}
await mkdir(new URL('admin/demo/', root), { recursive: true });
await writeFile(new URL('admin/demo/seed.json', root), JSON.stringify(files));
console.log('Demo-Inhalte erzeugt.');
