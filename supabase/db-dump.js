#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load ../.env
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// required env
const host = must("DB_HOST");
const port = process.env.DB_PORT || "5432";
const user = must("DB_USER");
const pass = must("DB_PASSWORD");


// Build a real Postgres URI for pg_dump
const DB_URI = `postgresql://postgres.${user}:${pass}@${host}:${port}/postgres`;

function createOutputDir(folderName) {
  const outDir = path.resolve(__dirname, folderName);
  fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

function must(name) {
  const v = encodeURIComponent(process.env[name]);
  if (!v) { console.error(`Missing ${name} in .env Contact Ismaeel`); process.exit(1); }
  return v;
}

function run(args) {
  execFileSync("npx", ["supabase", "db", ...args], { stdio: "inherit", shell: true });
}

// 1) public schema
run(["diff", "--schema", "public", "--db-url", DB_URI, "-f", "public_schema"]);
// 2) public data
run(["dump", "--data-only", "--schema", "public", "--db-url", DB_URI, "-f", path.join(createOutputDir("seeds"), "public_data.sql")]);
// 3) auth schema
run(["diff", "--schema", "auth", "--db-url", DB_URI, "-f", "auth_schema"]);
// 4) auth data
run(["dump", "--data-only", "--schema", "auth", "--db-url", DB_URI, "-f", path.join(createOutputDir("seeds"), "auth_data.sql")]);

console.log("Done.");
