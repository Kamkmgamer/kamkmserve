#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'drizzle');
const ALLOW_ANNOTATION = /@unsafe:\s*allow/i;

// Patterns considered dangerous unless explicitly annotated with `-- @unsafe: allow`
const DANGEROUS_PATTERNS = [
  [/\bDROP\s+TABLE\b/i, 'DROP TABLE'],
  [/\bDROP\s+COLUMN\b/i, 'DROP COLUMN'],
  [/\bTRUNCATE\b/i, 'TRUNCATE'],
  [/\bALTER\s+TABLE\b[^;]*\bDROP\b/i, 'ALTER TABLE ... DROP'],
  [/\bDELETE\s+FROM\b(?![^;]*\bWHERE\b)/i, 'DELETE without WHERE'],
  [/\bUPDATE\b(?![^;]*\bWHERE\b)/i, 'UPDATE without WHERE'],
];

function findFindings(sql) {
  const findings = [];
  for (const [regex, label] of DANGEROUS_PATTERNS) {
    let m;
    while ((m = regex.exec(sql)) !== null) {
      const idx = m.index;
      const start = Math.max(0, idx - 120);
      const end = Math.min(sql.length, idx + 180);
      const snippet = sql.slice(start, end).replace(/\s+/g, ' ').trim();
      findings.push({ label, index: idx, snippet });
    }
  }
  return findings;
}

async function main() {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
  const sqlFiles = entries
    .filter((e) => e.isFile() && extname(e.name).toLowerCase() === '.sql')
    .map((e) => join(MIGRATIONS_DIR, e.name));

  let violations = [];

  for (const file of sqlFiles) {
    const raw = await readFile(file, 'utf8');

    // Allow bypass with explicit annotation anywhere in the file
    const isAllowed = ALLOW_ANNOTATION.test(raw);
    if (isAllowed) continue;

    const findings = findFindings(raw);
    if (findings.length) {
      for (const f of findings) {
        violations.push({ file, ...f });
      }
    }
  }

  if (violations.length) {
    console.error('Migration safety check failed. Dangerous statements detected:');
    for (const v of violations) {
      console.error(`\nFile: ${v.file}`);
      console.error(`Issue: ${v.label}`);
      console.error(`Snippet: ${v.snippet}`);
    }
    console.error('\nIf this is intentional, add a comment line with `-- @unsafe: allow` to the migration file.');
    process.exit(1);
  } else {
    console.log('✔ Migration safety check passed.');
  }
}

main().catch((err) => {
  console.error('Migration safety check encountered an error:', err);
  process.exit(1);
});
