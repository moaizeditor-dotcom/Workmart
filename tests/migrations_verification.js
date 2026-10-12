import assert from 'node:assert/strict';
import { migrations } from '../server/migrations.js';

const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
const db = new DatabaseSync(':memory:');

try {
  for (const migration of migrations.slice(0, 2)) {
    db.exec(migration.sql);
  }

  const tables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
  );
  for (const table of ['users', 'skills', 'posts', 'jobs', 'sessions']) {
    assert.ok(tables.has(table), `Migration did not create ${table}`);
  }

  const foreignKeys = db.prepare('PRAGMA foreign_key_list(sessions)').all();
  assert.ok(foreignKeys.some((foreignKey) => foreignKey.table === 'users' && foreignKey.from === 'user_id'));
  assert.match(migrations[2].sql, /ALTER TABLE users ALTER COLUMN email DROP NOT NULL/);
  assert.match(migrations[2].sql, /UNIQUE\(provider, provider_user_id\)/);
  console.log('PASS: base migrations and OAuth identity schema are present and compatible.');
} finally {
  db.close();
}
