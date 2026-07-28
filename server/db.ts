import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:12345678@localhost:5432/direktori_mitra"
});

export async function query(sql: string, params?: any[]) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql: string, params?: any[]) {
  const rows = await query(sql, params);
  return rows[0] || null;
}