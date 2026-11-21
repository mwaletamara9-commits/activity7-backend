require("dotenv").config();
const express = require("express");
const cors = require("cors");
const recordsRouter = require("./routes/records");

const app = express();
const PORT = process.env.PORT || 3000;

const allowed = (process.env.CLIENT_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json());

// Malformed JSON -> 400 with message
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON in request body." });
  }
  next(err);
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Campus Maintenance Request - API Guide</title>
  <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}code{background:#f2f2f2;padding:2px 6px}</style>
  </head><body>
  <h1>Campus Maintenance Request System</h1>
  <p><strong>Student:</strong> Tamara Mwale</p>
  <p><strong>Student Number:</strong> 202407137</p>
  <p><strong>Project:</strong> Campus Maintenance Request - track maintenance requests on campus (broken lights, desks, plumbing, etc.)</p>
  <h2>Routes</h2>
  <table><tr><th>Method</th><th>Route</th><th>Description</th></tr>
  <tr><td>GET</td><td><code>/</code></td><td>This guide page</td></tr>
  <tr><td>GET</td><td><code>/health</code></td><td>Health check</td></tr>
  <tr><td>GET</td><td><code>/api/records</code></td><td>List all records (supports ?status= &amp; ?category= &amp; ?search= &amp; ?sort=)</td></tr>
  <tr><td>GET</td><td><code>/api/records/:id</code></td><td>Get one record by id</td></tr>
  <tr><td>POST</td><td><code>/api/records</code></td><td>Create a record</td></tr>
  <tr><td>PUT</td><td><code>/api/records/:id</code></td><td>Update a record</td></tr>
  <tr><td>DELETE</td><td><code>/api/records/:id</code></td><td>Delete a record</td></tr>
  </table>
  <h2>Record Fields</h2>
  <ul><li><code>id</code> - integer, auto-generated</li>
  <li><code>title</code> - string, 3 to 80 characters, required</li>
  <li><code>category</code> - string, 2 to 40 characters, required (e.g. Electrical, Furniture, Plumbing)</li>
  <li><code>description</code> - string, 5 to 300 characters, required</li>
  <li><code>status</code> - must be one of: Pending, In progress, Completed</li></ul>
  <h2>Example Request Body (POST / PUT)</h2>
  <pre><code>{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The ceiling light in Room B2 is flickering and needs replacement.",
  "status": "Pending"
}</code></pre>
  <h2>Example Responses</h2>
  <p>Success: <code>201</code> with created record. Error: <code>{"message": "..."}</code></p>
  </body></html>`);
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/records", recordsRouter);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));