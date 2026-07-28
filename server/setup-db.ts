import { pool } from "./db.js";

async function setup() {
  console.log("Membuat database...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS metros (
      id BIGSERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id BIGSERIAL PRIMARY KEY,
      metro_id BIGINT REFERENCES metros(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      site TEXT NOT NULL,
      cid TEXT NOT NULL,
      contact_name TEXT,
      contact_phone TEXT,
      complaint_group TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS complaint_groups (
      id BIGSERIAL PRIMARY KEY,
      metro_id BIGINT REFERENCES metros(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    INSERT INTO metros (name) VALUES
      ('Jakarta Metro'), ('Bandung Metro'), ('Surabaya Metro'),
      ('Medan Metro'), ('Semarang Metro'), ('Makassar Metro')
    ON CONFLICT (name) DO NOTHING
  `);

  console.log("✅ Database siap!");
  await pool.end();
}

setup().catch((err) => { console.error(err); process.exit(1); });