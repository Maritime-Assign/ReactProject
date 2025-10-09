#!/usr/bin/env node
/**
 * Supabase DB Dumper (Windows-friendly, sequential)
 * - Human-readable logs
 * - One generic run(mode, schema) entry point
 * - Uses keyword/value DB URL + PGPASSWORD (no URL-encoding headaches)
 * - Outputs to supabase/dumps/<schema>_<mode>.sql
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Load the root .env (../.env relative to this file)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// ---- Configuration ---------------------------------------------------------

// Put the DB password where pg_dump expects it.
process.env.PGPASSWORD = process.env.PGPASSWORD || process.env.DB_PASSWORD;

const CFG = {
  host:   mustGet('DB_HOST'),
  port:   process.env.DB_PORT || '5432',
  user:   mustGet('DB_USER'),     // e.g. postgres.<PROJECT_REF>
  dbname: process.env.DB_NAME || 'postgres',
  ssl:    process.env.DB_SSLMODE || 'require',
  outDir: path.resolve(__dirname, 'dumps')
};

// Build keyword/value connection string (works cross-platform, respects PGPASSWORD).
const DB_URL_KV = `host=${CFG.host} port=${CFG.port} user=${CFG.user} dbname=${CFG.dbname} sslmode=${CFG.ssl}`;

// Ensure output directory exists
fs.mkdirSync(CFG.outDir, { recursive: true });

// ---- Helpers ---------------------------------------------------------------

function mustGet(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Missing required env var: ${name}. Contact Ismaeel K.`);
    process.exit(1);
  }
  return v;
}

function pretty(label, schema, mode) {
  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
  return `${pad(label, 8)}  ${pad(schema, 8)}  ${pad(mode, 7)}`;
}

/**
 * Low-level executor (spawns `npx supabase db dump ...`)
 */
function execSupabase(args, label) {
  return new Promise((resolve, reject) => {
    console.log(`▶️  ${label}`);
    const p = spawn('npx', ['supabase', 'db', 'dump', ...args], {
      stdio: 'inherit',
      shell: true
    });
    p.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${label}`);
        resolve();
      } else {
        reject(new Error(`Command failed (${code}): npx supabase db dump ${args.join(' ')}`));
      }
    });
  });
}

/**
 * Generic run step
 * @param {'schema'|'data'} mode
 * @param {'public'|'auth'|string} schema
 */
async function run(mode, schema) {
  const outFile = path.join(CFG.outDir, `${schema}_${mode}.sql`);

  // Choose flags by mode
  const modeFlags = mode === 'schema'
    ? ['--schema-only']
    : ['--data-only', '--use-copy'];

  const args = [
    ...modeFlags,
    '--schema', schema,
    '--db-url', DB_URL_KV,
    '-f', outFile
  ];

  const label = pretty('dumping', schema, mode);
  await execSupabase(args, label);
  return outFile;
}

// ---- Main ------------------------------------------------------------------

(async () => {
  try {
    console.log('--- Supabase dump (sequential) -----------------------------------');
    console.log(`Host: ${CFG.host}  DB: ${CFG.dbname}  User: ${CFG.user}`);
    console.log(`Out : ${CFG.outDir}\n`);

    // 👇 Edit this list to change order / add storage, etc.
    const steps = [
      ['schema', 'public'],
      ['data',   'public'],
      ['schema', 'auth'],
      ['data',   'auth'],
    ];

    for (const [mode, schema] of steps) {
      await run(mode, schema);
    }

    console.log('\n All dumps completed successfully.');
  } catch (err) {
    console.error('\n❌ Dump failed.');
    console.error(err.message);
    process.exit(1);
  }
})();
