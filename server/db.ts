import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

console.log("DATABASE_URL ada:", !!process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("✅ Berhasil terhubung ke database");
});

pool.on("error", (err) => {
  console.error("❌ Database error:", err);
});

export async function query(sql: string, params?: any[]) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql: string, params?: any[]) {
  const rows = await query(sql, params);
  return rows[0] || null;
}