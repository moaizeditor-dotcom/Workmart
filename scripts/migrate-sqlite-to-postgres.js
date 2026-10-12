import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { migratePostgres } from '../server/migrations.js';

const databaseUrl = process.env.DATABASE_URL;
const sqlitePath = process.env.SQLITE_SOURCE_PATH;

if (!databaseUrl || !sqlitePath) {
  throw new Error('Set DATABASE_URL and SQLITE_SOURCE_PATH before running this import.');
}
if (!fs.existsSync(sqlitePath)) {
  throw new Error(`SQLite source database does not exist: ${sqlitePath}`);
}

const source = new (process.getBuiltinModule('node:sqlite').DatabaseSync)(sqlitePath, { readOnly: true });
const { Pool } = pg;
const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: true }
});

const tables = [
  'users',
  'oauth_accounts',
  'skills',
  'artifacts',
  'experiences',
  'posts',
  'post_reactions',
  'poll_votes',
  'comments',
  'jobs',
  'job_applications',
  'connections',
  'messages',
  'notifications',
  'saved_items'
];

try {
  await migratePostgres(pool);
  const counts = await Promise.all(tables.map(async (table) => {
    const result = await pool.query(`SELECT count(*)::int AS count FROM "${table}"`);
    return [table, result.rows[0].count];
  }));
  const occupied = counts.filter(([, count]) => count !== 0);
  if (occupied.length > 0) {
    throw new Error(`Destination must be empty before importing; non-empty tables: ${occupied.map(([table]) => table).join(', ')}`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let imported = 0;
    for (const table of tables) {
      const columns = source.prepare(`PRAGMA table_info("${table}")`).all().map((column) => column.name);
      if (columns.length === 0) {
        if (table === 'oauth_accounts') {
          continue;
        }
        throw new Error(`Required source table is missing: ${table}`);
      }
      const rows = source.prepare(`SELECT * FROM "${table}"`).all();
      const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const insert = `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders})`;
      for (const row of rows) {
        await client.query(insert, columns.map((column) => row[column]));
      }
      imported += rows.length;
      console.log(`Imported ${rows.length} rows from ${table}.`);
    }
    await client.query('COMMIT');
    console.log(`Import complete: ${imported} rows copied. Source SQLite database was not modified.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} finally {
  source.close();
  await pool.end();
}
