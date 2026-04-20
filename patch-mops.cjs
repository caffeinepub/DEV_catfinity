#!/usr/bin/env node
// Patch mops to fix "Mismatched number of resolved packages: 15 vs 20" error
// Root cause: alias entries like "base", "base@0", "base@0.16" in deps all point to same package
// Fix 1: Deduplicate packageIds in integrity check (already applied)
// Fix 2: Deduplicate deps in resolve-packages so lock file writes 15 entries instead of 20

const fs = require('fs');

// === Patch 1: integrity.js - deduplicate packageIds ===
const integrityPath = '/home/ubuntu/.npm-global/lib/node_modules/ic-mops/dist/integrity.js';
let integrityContent = fs.readFileSync(integrityPath, 'utf8');

const integrityFuncStart = integrityContent.indexOf('async function getResolvedMopsPackageIds');
const integrityFuncEnd = integrityContent.indexOf('\n}', integrityFuncStart) + 2;
const integrityFuncContent = integrityContent.substring(integrityFuncStart, integrityFuncEnd);

console.log('integrity.js - getResolvedMopsPackageIds:\n' + integrityFuncContent + '\n');

if (!integrityFuncContent.includes('[...new Set(packageIds)]')) {
  const patched = integrityContent.substring(0, integrityFuncStart) + 
    integrityFuncContent.replace(
      '    return packageIds;\n}',
      '    // Deduplicate: alias entries like "base", "base@0", "base@0.16" all resolve to same package ID\n    return [...new Set(packageIds)];\n}'
    ) + 
    integrityContent.substring(integrityFuncEnd);
  fs.writeFileSync(integrityPath, patched, 'utf8');
  console.log('Patch 1 applied: integrity.js - deduplicated packageIds\n');
} else {
  console.log('Patch 1 already applied\n');
}

// === Patch 2: resolve-packages.js - deduplicate returned packages by canonical name@version ===
const resolvePath = '/home/ubuntu/.npm-global/lib/node_modules/ic-mops/dist/resolve-packages.js';
let resolveContent = fs.readFileSync(resolvePath, 'utf8');

// Find the final return statement at end of resolvePackages
// The function ends with: return Object.fromEntries(Object.entries(packages).map(...)...)
// We need to deduplicate by canonical package ID before returning

const returnTarget = '    return Object.fromEntries(Object.entries(packages)';
if (!resolveContent.includes('// Deduplicate by canonical') && resolveContent.includes(returnTarget)) {
  // Find the end of the return statement (the full return block)
  const retStart = resolveContent.lastIndexOf(returnTarget);
  // Find matching closing paren + semicolon
  let depth = 0;
  let retEnd = retStart;
  for (let i = retStart; i < resolveContent.length; i++) {
    if (resolveContent[i] === '(') depth++;
    if (resolveContent[i] === ')') depth--;
    if (depth === 0 && i > retStart + 10) {
      retEnd = i + 1; // include the closing paren
      // skip whitespace and find the semicolon
      while (retEnd < resolveContent.length && (resolveContent[retEnd] === '\n' || resolveContent[retEnd] === ' ')) retEnd++;
      if (resolveContent[retEnd] === ';') retEnd++;
      break;
    }
  }
  
  const originalReturn = resolveContent.substring(retStart, retEnd);
  console.log('Original return statement:\n' + originalReturn + '\n');
  
  // Replace with deduplication logic
  const newReturn = `    // Deduplicate by canonical package name (strip alias suffix) + version
    // e.g., "base", "base@0", "base@0.16" all → same "base@0.16.0" → keep one entry per unique canonical ID
    const allEntries = Object.entries(packages)
        .map(([name, pkg]) => {
        let version;
        if (pkg.path) {
            version = require('node:path').resolve(rootDir, pkg.path).replaceAll('{MOPS_ENV}', process.env.MOPS_ENV || 'local');
        } else if (pkg.repo) {
            version = pkg.repo;
        } else if (pkg.version) {
            version = pkg.version;
        } else {
            return [name, ''];
        }
        return [name, version];
    })
        .filter(([, version]) => version !== '');
    const seenCanonical = new Set();
    const deduped = allEntries.filter(([name, version]) => {
        const canonicalName = name.split('@')[0] || name;
        const canonicalId = canonicalName + '@' + version;
        if (seenCanonical.has(canonicalId)) return false;
        seenCanonical.add(canonicalId);
        return true;
    });
    return Object.fromEntries(deduped);`;
  
  const patched = resolveContent.substring(0, retStart) + newReturn + resolveContent.substring(retEnd);
  fs.writeFileSync(resolvePath, patched, 'utf8');
  console.log('Patch 2 applied: resolve-packages.js - deduplicated by canonical name@version');
} else if (resolveContent.includes('// Deduplicate by canonical')) {
  console.log('Patch 2 already applied');
} else {
  console.log('Patch 2 FAILED: could not find return target in resolve-packages.js');
  const idx = resolveContent.lastIndexOf('return Object.fromEntries');
  console.log('Context:', resolveContent.substring(idx - 100, idx + 200));
}
