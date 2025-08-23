// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schema";
import { logger } from "~/lib/logger";
import { recordDatabaseOperation } from "~/lib/metrics";

config({ path: ".env" }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
const rawDb: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

// Helpers to safely work with unknown values without using any
function getSqlText(input: unknown): string {
  if (typeof input === "string") return input;
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const candidate = obj.query ?? obj.sql;
    if (typeof candidate === "string") return candidate;
    if (candidate && typeof candidate === "object") {
      const candObj = candidate as { toString?: unknown };
      if (typeof candObj.toString === "function") {
        try {
          return (candObj.toString as () => string)();
        } catch {
          return "";
        }
      }
      return "";
    }
  }
  // Only return primitives; avoid stringifying objects that would yield [object Object]
  if (typeof input === "number" || typeof input === "boolean" || typeof input === "bigint") {
    return String(input);
  }
  return "";
}

function inferOp(sqlText: string): string {
  const m = /^(select|insert|update|delete)/i.exec(sqlText);
  return (m?.[1] ?? "execute").toUpperCase();
}

function inferTable(sqlText: string): string {
  const m = /(from|into|update)\s+([a-zA-Z0-9_\.]+)/i.exec(sqlText);
  return m?.[2] ?? "unknown";
}

// Wrap execute to add basic, sanitized query logging and timing without unsafe any
type ExecuteFn = (query: unknown) => Promise<unknown>;
const dbWithMaybeExecute = rawDb as unknown as { execute?: ExecuteFn };
const origExecute: ExecuteFn | undefined = dbWithMaybeExecute.execute?.bind(rawDb);
if (origExecute) {
  dbWithMaybeExecute.execute = async (query: unknown) => {
    const start = performance.now();
    try {
      const res = await origExecute(query);
      const duration = Math.round(performance.now() - start);
      const sqlText = getSqlText(query);
      const op = inferOp(sqlText);
      const table = inferTable(sqlText);

      // Determine rows length in a type-safe manner
      let rowsLength: number | undefined;
      if (res && typeof res === "object" && "rows" in res) {
        const rowsVal = res.rows;
        if (Array.isArray(rowsVal)) rowsLength = rowsVal.length;
      }

      logger.database(op, table, duration, { rows: rowsLength });
      try {
        recordDatabaseOperation(op, table, duration, true);
      } catch {}
      return res;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      const sqlText = getSqlText(query);
      const op = inferOp(sqlText);
      const table = inferTable(sqlText);
      logger.error(`DB ${op} on ${table} failed`, { duration });
      try {
        recordDatabaseOperation(op, table, duration, false, err instanceof Error ? err : new Error("DB error"));
      } catch {}
      throw err;
    }
  };
}

export const db = rawDb;
