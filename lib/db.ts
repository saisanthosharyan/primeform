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
    operation_status TEXT NOT NULL,
    operation_progress INTEGER NOT NULL DEFAULT 0,
    operation_elapsed_seconds INTEGER NOT NULL DEFAULT 0,

    emergency_stop INTEGER NOT NULL DEFAULT 0,
    safety_doors INTEGER NOT NULL DEFAULT 1,
    coolant_ready INTEGER NOT NULL DEFAULT 1,
    lubrication_ready INTEGER NOT NULL DEFAULT 1,
    machine_power INTEGER NOT NULL DEFAULT 1,
    control_system_ready INTEGER NOT NULL DEFAULT 1
  )
`);

const columns = db
  .prepare("PRAGMA table_info(setup_state)")
  .all() as { name: string }[];

const columnNames = columns.map((column) => column.name);

const requiredColumns = [
  {
    name: "operation_progress",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN operation_progress INTEGER NOT NULL DEFAULT 0
    `,
  },
  {
    name: "operation_elapsed_seconds",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN operation_elapsed_seconds INTEGER NOT NULL DEFAULT 0
    `,
  },
  {
    name: "emergency_stop",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN emergency_stop INTEGER NOT NULL DEFAULT 0
    `,
  },
  {
    name: "safety_doors",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN safety_doors INTEGER NOT NULL DEFAULT 1
    `,
  },
  {
    name: "coolant_ready",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN coolant_ready INTEGER NOT NULL DEFAULT 1
    `,
  },
  {
    name: "lubrication_ready",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN lubrication_ready INTEGER NOT NULL DEFAULT 1
    `,
  },
  {
    name: "machine_power",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN machine_power INTEGER NOT NULL DEFAULT 1
    `,
  },
  {
    name: "control_system_ready",
    sql: `
      ALTER TABLE setup_state
      ADD COLUMN control_system_ready INTEGER NOT NULL DEFAULT 1
    `,
  },
];

for (const column of requiredColumns) {
  if (!columnNames.includes(column.name)) {
    db.exec(column.sql);
  }
}

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
      operation_status,
      operation_progress,
      operation_elapsed_seconds,
      emergency_stop,
      safety_doors,
      coolant_ready,
      lubrication_ready,
      machine_power,
      control_system_ready
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    JSON.stringify([
      false,
      false,
      false,
      false,
      false,
      false,
    ]),
    JSON.stringify([
      false,
      false,
      false,
      false,
    ]),
    0,
    "checks",
    "READY",
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1
  );
}

export default db;
