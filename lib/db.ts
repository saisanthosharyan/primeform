import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "primeform.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS setup_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    machine_checks TEXT NOT NULL,
    tools TEXT NOT NULL,
    workpiece_confirmed INTEGER NOT NULL DEFAULT 0,
    stage TEXT NOT NULL,
    operation_status TEXT NOT NULL
  )
`);

const existing = db
  .prepare("SELECT id FROM setup_state WHERE id = 1")
  .get();

if (!existing) {
  db.prepare(`
    INSERT INTO setup_state (
      id,
      machine_checks,
      tools,
      workpiece_confirmed,
      stage,
      operation_status
    )
    VALUES (1, ?, ?, ?, ?, ?)
  `).run(
    JSON.stringify([false, false, false, false, false, false]),
    JSON.stringify([false, false, false, false]),
    0,
    "checks",
    "READY"
  );
}

export default db;
