import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';
import { migrateLibsql } from '../server/migrations.js';

const originalCwd = process.cwd();
const dataDir = mkdtempSync(path.join(tmpdir(), 'workmark-libsql-'));
const databasePath = path.join(dataDir, 'workmark.db');
process.env.NODE_ENV = 'production';
process.env.NETLIFY = 'true';
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
delete process.env.TURSO_AUTH_TOKEN;
delete process.env.DATABASE_URL;
process.env.DATA_DIR = dataDir;
process.env.JWT_SECRET = 'libsql-serverless-test-secret-at-least-32-characters';
process.env.ADMIN_EMAIL = '';
process.env.ADMIN_PASSWORD = '';
process.chdir(dataDir);

const migrationClient = createClient({ url: `file:${databasePath}` });
try {
  await migrateLibsql(migrationClient);
  await migrateLibsql(migrationClient);
} finally {
  migrationClient.close();
}

const apiEntry = process.env.NETLIFY_API_BUNDLE
  ? pathToFileURL(path.resolve(process.env.NETLIFY_API_BUNDLE)).href
  : '../netlify/functions/api.mjs';
const { handler } = await import(apiEntry);
const db = process.env.NETLIFY_API_BUNDLE
  ? null
  : (await import('../server/db.js')).db;
const invoke = (route, { method = 'GET', body, headers = {} } = {}) => {
  const url = new URL(route, 'https://workmak.netlify.app');
  return handler({
    httpMethod: method,
    path: url.pathname,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: {
      host: 'workmak.netlify.app',
      'x-forwarded-proto': 'https',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers
    },
    body: body === undefined ? null : JSON.stringify(body),
    isBase64Encoded: false
  }, {});
};

try {
  const email = `libsql-${Date.now()}@example.test`;
  const password = 'ValidPassword2026';
  const registration = await invoke('/api/auth/register', {
    method: 'POST',
    body: { name: 'libSQL Verification', email, password }
  });
  const registered = JSON.parse(registration.body);
  assert.equal(registration.statusCode, 201);
  assert.equal(registered.user.email, email);
  assert.equal(typeof registered.token, 'string');

  const login = await invoke('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  const loggedIn = JSON.parse(login.body);
  assert.equal(login.statusCode, 200);
  assert.equal(loggedIn.user.email, email);
  assert.equal(typeof loggedIn.token, 'string');

  const me = await invoke('/api/auth/me', {
    headers: { authorization: `Bearer ${loggedIn.token}` }
  });
  assert.equal(me.statusCode, 200);
  assert.equal(JSON.parse(me.body).user.email, email);

  const logout = await invoke('/api/auth/logout', {
    method: 'POST',
    headers: { authorization: `Bearer ${loggedIn.token}` }
  });
  assert.equal(logout.statusCode, 200);

  const revokedSession = await invoke('/api/auth/me', {
    headers: { authorization: `Bearer ${loggedIn.token}` }
  });
  assert.equal(revokedSession.statusCode, 401);

  if (db) await db.close();
  const persistedClient = createClient({ url: `file:${databasePath}`, intMode: 'number' });
  const persistedUser = await persistedClient.execute({
    sql: 'SELECT email FROM users WHERE email = ?',
    args: [email]
  });
  const persistedSession = await persistedClient.execute({
    sql: 'SELECT revoked_at FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ?) ORDER BY created_at DESC LIMIT 1',
    args: [email]
  });
  assert.equal(persistedUser.rows[0]?.email, email);
  assert.ok(persistedSession.rows[0]?.revoked_at);
  persistedClient.close();

  console.log('PASS: libSQL schema migrations, signup, login, session persistence, and logout.');
} finally {
  process.chdir(originalCwd);
  rmSync(dataDir, { recursive: true, force: true });
}
