import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/config/env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to use the database client");
}

const queryClient = postgres(env.DATABASE_URL, { max: 10 });
export const db = drizzle(queryClient);

