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
const host = must("LOCAL_DB_HOST");
const port = process.env.LOCAL_DB_PORT || "5432";
const user = must("LOCAL_DB_SuperUser");
const pass = must("LOCAL_DB_PASSWORD");

// Build a real Postgres URI for pg_dump
const DB_URI = `postgresql://${user}:${pass}@${host}:${port}/postgres`;

function must(name) {
  const v = encodeURIComponent(process.env[name]);
  if (!v) { console.error(`Missing ${name} in .env Contact Ismaeel`); process.exit(1); }
  return v;
}

function Run(args) {
    execFileSync("psql", ["--dbname=\"" + DB_URI + "\"", ...args], { stdio: "inherit", shell: true });
}

Run(["-f", "supabase/dump/database-dump.sql"]);