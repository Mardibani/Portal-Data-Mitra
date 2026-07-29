import express from "express";
import cors from "cors";
import { query, queryOne } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/metros", async (_req, res) => {
  res.json(await query("SELECT id, name FROM metros ORDER BY name"));
});

app.post("/api/metros", async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nama metro wajib diisi" });
  try {
    const row = await queryOne("INSERT INTO metros (name) VALUES ($1) RETURNING *", [name.trim()]);
    res.status(201).json(row);
  } catch (e: any) {
    if (e.message?.includes("duplicate")) return res.status(409).json({ error: "Metro sudah ada" });
    throw e;
  }
});

app.delete("/api/metros/:id", async (req, res) => {
  const row = await queryOne("DELETE FROM metros WHERE id = $1 RETURNING id", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.get("/api/partners", async (req, res) => {
  const { metro_id, search } = req.query;
  let sql = "SELECT p.*, m.name AS metro_name FROM partners p JOIN metros m ON m.id = p.metro_id";
  const params: any[] = [];
  const conditions: string[] = [];
  if (metro_id) { conditions.push(`p.metro_id = $${params.length + 1}`); params.push(metro_id); }
  if (search) {
    conditions.push(`(p.name ILIKE $${params.length + 1} OR p.site ILIKE $${params.length + 2} OR p.cid ILIKE $${params.length + 3})`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY p.name";
  res.json(await query(sql, params));
});

app.get("/api/partners/:id", async (req, res) => {
  const row = await queryOne(
    "SELECT p.*, m.name AS metro_name FROM partners p JOIN metros m ON m.id = p.metro_id WHERE p.id = $1",
    [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.post("/api/partners", async (req, res) => {
  const { metro_id, name, site, cid, contact_name, contact_phone, notes, complaint_group } = req.body;
  if (!name || !site || !cid || !metro_id) return res.status(400).json({ error: "Nama, site, CID, dan metro wajib diisi" });
  const row = await queryOne(
    `INSERT INTO partners (metro_id, name, site, cid, contact_name, contact_phone, notes, complaint_group)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [metro_id, name.trim(), site.trim(), cid.trim(), contact_name?.trim() || null, contact_phone?.trim() || null,
     notes?.trim() || null, complaint_group?.trim() || null]);
  res.status(201).json(row);
});

app.put("/api/partners/:id", async (req, res) => {
  const { metro_id, name, site, cid, contact_name, contact_phone, notes, complaint_group } = req.body;
  if (!name || !site || !cid || !metro_id) return res.status(400).json({ error: "Nama, site, CID, dan metro wajib diisi" });
  const row = await queryOne(
    `UPDATE partners SET metro_id=$1, name=$2, site=$3, cid=$4, contact_name=$5, contact_phone=$6,
     notes=$7, complaint_group=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
    [metro_id, name.trim(), site.trim(), cid.trim(), contact_name?.trim() || null, contact_phone?.trim() || null,
     notes?.trim() || null, complaint_group?.trim() || null, req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.delete("/api/partners/:id", async (req, res) => {
  const row = await queryOne("DELETE FROM partners WHERE id = $1 RETURNING id", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.get("/api/complaint-groups", async (req, res) => {
  const { metro_id } = req.query;
  const rows = metro_id
    ? await query("SELECT cg.*, m.name AS metro_name FROM complaint_groups cg JOIN metros m ON m.id = cg.metro_id WHERE cg.metro_id = $1 ORDER BY cg.label", [metro_id])
    : await query("SELECT cg.*, m.name AS metro_name FROM complaint_groups cg JOIN metros m ON m.id = cg.metro_id ORDER BY m.name, cg.label");
  res.json(rows);
});

app.post("/api/complaint-groups", async (req, res) => {
  const { metro_id, label, type, value, notes } = req.body;
  if (!metro_id || !label || !type || !value) return res.status(400).json({ error: "Metro, label, tipe, value wajib diisi" });
  const row = await queryOne(
    "INSERT INTO complaint_groups (metro_id, label, type, value, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [metro_id, label.trim(), type, value.trim(), notes?.trim() || null]);
  res.status(201).json(row);
});

app.delete("/api/complaint-groups/:id", async (req, res) => {
  const row = await queryOne("DELETE FROM complaint_groups WHERE id = $1 RETURNING id", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server berjalan di port ${PORT}`);
});