const express = require("express");
const router = express.Router();
const db = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];

function isValidId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
}

function validate(body) {
  const { title, category, description, status } = body || {};
  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 80)
    return "title must be 3 to 80 characters";
  if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 40)
    return "category must be 2 to 40 characters";
  if (typeof description !== "string" || description.trim().length < 5 || description.trim().length > 300)
    return "description must be 5 to 300 characters";
  if (!STATUSES.includes(status))
    return "status must be Pending, In progress, or Completed";
  return null;
}

// GET /api/records
router.get("/", (req, res) => {
  const { status, category, search, sort } = req.query;
  let sql = "SELECT * FROM records WHERE 1=1";
  const params = [];
  if (status) { sql += " AND status = ?"; params.push(status); }
  if (category) { sql += " AND category = ?"; params.push(category); }
  if (search) { sql += " AND (title LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
  if (sort === "title") sql += " ORDER BY title ASC";
  else if (sort === "status") sql += " ORDER BY status ASC, id ASC";
  else sql += " ORDER BY id ASC";
  res.json(db.prepare(sql).all(...params));
});

// GET /api/records/:id
router.get("/:id", (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid id. Id must be a positive integer." });
  const row = db.prepare("SELECT * FROM records WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ message: "Record not found." });
  res.json(row);
});

// POST /api/records
router.post("/", (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const { title, category, description, status } = req.body;
  const info = db.prepare("INSERT INTO records (title, category, description, status) VALUES (?,?,?,?)").run(title.trim(), category.trim(), description.trim(), status);
  res.status(201).json(db.prepare("SELECT * FROM records WHERE id = ?").get(info.lastInsertRowid));
});

// PUT /api/records/:id
router.put("/:id", (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid id. Id must be a positive integer." });
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const { title, category, description, status } = req.body;
  const info = db.prepare("UPDATE records SET title=?, category=?, description=?, status=? WHERE id=?").run(title.trim(), category.trim(), description.trim(), status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: "Record not found." });
  res.json(db.prepare("SELECT * FROM records WHERE id = ?").get(req.params.id));
});

// DELETE /api/records/:id
router.delete("/:id", (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid id. Id must be a positive integer." });
  const info = db.prepare("DELETE FROM records WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: "Record not found." });
  res.json({ message: "Record deleted." });
});

module.exports = router;