// Writes dist/package.json so `invenio-cli assets watch-module --link` can link
// dist/ into an Invenio instance: entry points are rewritten relative to dist/,
// and scripts/devDependencies are dropped so linking does not run `prepare`.
import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const DIST_PREFIX = /^\.\/dist\//;

const relink = value =>
  typeof value === 'string'
    ? value.replace(DIST_PREFIX, './')
    : Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, relink(entry)])
      );

for (const field of ['scripts', 'devDependencies', 'files']) {
  delete pkg[field];
}
for (const field of ['main', 'module', 'types', 'exports']) {
  if (pkg[field]) {
    pkg[field] = relink(pkg[field]);
  }
}

writeFileSync('dist/package.json', `${JSON.stringify(pkg, null, 2)}\n`);
