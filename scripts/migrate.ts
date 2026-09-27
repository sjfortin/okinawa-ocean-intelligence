import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const sql = postgres(databaseUrl, { max: 1 });
  const migration = await readFile(
    path.join(process.cwd(), "src/server/db/migrations/0001_initial.sql"),
    "utf8",
  );

  try {
    await sql.unsafe(migration);
    console.log("Applied 0001_initial.sql");
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
