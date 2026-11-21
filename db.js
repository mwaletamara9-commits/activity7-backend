const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(path.join(__dirname, "database.db"));

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

const count = db.prepare("SELECT COUNT(*) AS c FROM records").get().c;
if (count === 0) {
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  db.exec(seed);
  console.log("Database seeded with 8 records");
}

module.exports = db;