import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { migrations } from '../server/migrations.js';

const dataDir = mkdtempSync(path.join(tmpdir(), 'workmark-schema-upgrade-'));
const databasePath = path.join(dataDir, 'workmark.sqlite');
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
const legacyDb = new DatabaseSync(databasePath);
let db;

process.env.NODE_ENV = 'test';
legacyDb.exec(migrations[0].sql);
legacyDb.exec(migrations[1].sql);
legacyDb.prepare(`
  INSERT INTO users (id, name, handle, email, created_at)
  VALUES (?, ?, ?, ?, ?)
`).run('legacy-user', 'Legacy User', '@legacy-user', 'legacy@example.test', Date.now());
legacyDb.prepare(`
  INSERT INTO posts (id, user_id, content, created_at)
  VALUES (?, ?, ?, ?)
`).run('legacy-post', 'legacy-user', 'Preserve on migration', Date.now());
legacyDb.close();

process.env.DATA_DIR = dataDir;
delete process.env.DATABASE_URL;
delete process.env.NETLIFY;
delete process.env.AWS_LAMBDA_FUNCTION_NAME;

try {
  ({ db } = await import('../server/db.js'));
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get('legacy-user');
  const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get('legacy-post');
  const emailColumn = db.prepare('PRAGMA table_info(users)').all().find((column) => column.name === 'email');
  const violations = db.prepare('PRAGMA foreign_key_check').all();

  assert.equal(user.id, 'legacy-user');
  assert.equal(user.email, 'legacy@example.test');
  assert.equal(post.id, 'legacy-post');
  assert.equal(post.user_id, 'legacy-user');
  assert.equal(emailColumn.notnull, 0);
  assert.deepEqual(violations, []);
  db.prepare('INSERT INTO users (id, name, handle, created_at) VALUES (?, ?, ?, ?)')
    .run('x-user', 'X User', '@x-user', Date.now());
  db.prepare('INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, created_at) VALUES (?, ?, ?, ?, ?)')
    .run('oauth-x-user', 'x-user', 'twitter', 'provider-id-123', Date.now());
  console.log('PASS: legacy SQLite users/posts survive email-nullable OAuth identity migration.');
} finally {
  if (db) await db.close();
  rmSync(dataDir, { recursive: true, force: true });
}
