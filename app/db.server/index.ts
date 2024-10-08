// Make sure to install the 'postgres' package
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";

const queryClient = postgres(String(process.env.DATABASE_URL));
export const db = drizzle(queryClient);
