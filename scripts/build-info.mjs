// Writes src/assets/build-info.json, shown at the bottom of the sidebar.
// The browser can't know which Node built the site, so it is captured at build time.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

function commit() {
  // Netlify exposes the deployed commit; fall back to git locally
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

const info = {
  node: process.versions.node,
  builtAt: new Date().toISOString(),
  commit: commit(),
};

writeFileSync(new URL('../src/assets/build-info.json', import.meta.url), JSON.stringify(info, null, 2) + '\n');
console.log('build-info:', info);
