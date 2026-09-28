import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const sql = postgres(databaseUrl, { max: 1 });
  try {
    const directory = path.join(process.cwd(), "src/server/db/migrations");
    const files = (await readdir(directory)).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
    await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(68721401)`;
      await tx`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
      for (const name of files) {
        const applied = await tx`SELECT name FROM schema_migrations WHERE name = ${name}`;
        if (applied.length) continue;
        await tx.unsafe(await readFile(path.join(directory, name), "utf8"));
        await tx`INSERT INTO schema_migrations (name) VALUES (${name})`;
        console.log(`Applied ${name}`);
      }
    });
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
