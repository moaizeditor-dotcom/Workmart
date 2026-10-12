import path from 'node:path';
import fs from 'node:fs';
import pg from 'pg';
import { migratePostgres } from './migrations.js';
import './config.js';

export const IS_SERVERLESS = process.env.NODE_ENV !== 'test' &&
  Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATABASE_URL = process.env.NODE_ENV === 'test' ? undefined : process.env.DATABASE_URL;
const sqlite = process.getBuiltinModule('node:sqlite');

if (IS_SERVERLESS && !DATABASE_URL) {
  throw new Error('DATABASE_URL is required in serverless production; local SQLite storage is not durable.');
}

const normalizeSql = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};

let db;
let ready;

if (DATABASE_URL) {
  const { Pool, types } = pg;
  types.setTypeParser(20, (value) => Number(value));

  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: IS_SERVERLESS ? 1 : 4,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: true }
  });

  db = {
    prepare(sql) {
      const query = normalizeSql(sql);
      return {
        async get(...params) {
          const result = await pool.query(query, params);
          return result.rows[0];
        },
        async all(...params) {
          const result = await pool.query(query, params);
          return result.rows;
        },
        async run(...params) {
          const result = await pool.query(query, params);
          return { changes: result.rowCount };
        }
      };
    },
    async close() {
      await pool.end();
    }
  };

  ready = migratePostgres(pool);
} else {
  const { DatabaseSync } = sqlite;
  const DATA_DIR = process.env.DATA_DIR || (IS_SERVERLESS ? '/tmp' : path.resolve(process.cwd(), 'data'));
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'workmark.sqlite');
  const sqliteDb = new DatabaseSync(DB_PATH);

  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      handle TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'Software Engineer',
      company TEXT DEFAULT '',
      location TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      banner TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      workmark_score INTEGER DEFAULT 950,
      verified INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      auth_provider TEXT DEFAULT 'local',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL,
      score INTEGER DEFAULT 90, endorsements INTEGER DEFAULT 0, created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
      category TEXT DEFAULT 'Architecture', role TEXT DEFAULT '', distribution TEXT DEFAULT '',
      metric TEXT DEFAULT '', tech_stack TEXT DEFAULT '', demo_url TEXT DEFAULT '',
      repo_url TEXT DEFAULT '', image TEXT DEFAULT '', verified INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, role TEXT NOT NULL, company TEXT NOT NULL,
      period TEXT DEFAULT '', location TEXT DEFAULT '', description TEXT DEFAULT '',
      skills_tagged TEXT DEFAULT '', created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, content TEXT DEFAULT '',
      image_url TEXT DEFAULT '', code_lang TEXT DEFAULT '', code_snippet TEXT DEFAULT '',
      poll_question TEXT DEFAULT '', poll_options TEXT DEFAULT '', tags TEXT DEFAULT '',
      created_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS post_reactions (
      id TEXT PRIMARY KEY, post_id TEXT NOT NULL, user_id TEXT NOT NULL,
      reaction_type TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(post_id, user_id),
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS poll_votes (
      id TEXT PRIMARY KEY, post_id TEXT NOT NULL, user_id TEXT NOT NULL,
      option_index INTEGER NOT NULL, created_at INTEGER NOT NULL, UNIQUE(post_id, user_id),
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY, post_id TEXT NOT NULL, user_id TEXT NOT NULL,
      text TEXT NOT NULL, created_at INTEGER NOT NULL,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, company TEXT NOT NULL,
      logo TEXT DEFAULT '', location TEXT DEFAULT '', type TEXT DEFAULT 'Full-time',
      salary TEXT DEFAULT '', match_score INTEGER DEFAULT 95, skills_required TEXT DEFAULT '',
      description TEXT DEFAULT '', benefits TEXT DEFAULT '', created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY, job_id TEXT NOT NULL, user_id TEXT NOT NULL,
      full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT DEFAULT '',
      cover_note TEXT DEFAULT '', status TEXT DEFAULT 'Under Review', created_at INTEGER NOT NULL,
      FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY, requester_id TEXT NOT NULL, recipient_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending', note TEXT DEFAULT '', created_at INTEGER NOT NULL,
      UNIQUE(requester_id, recipient_id),
      FOREIGN KEY(requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, sender_id TEXT NOT NULL, recipient_id TEXT NOT NULL,
      text TEXT NOT NULL, created_at INTEGER NOT NULL,
      FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, actor_id TEXT, type TEXT NOT NULL,
      title TEXT NOT NULL, detail TEXT DEFAULT '', is_read INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS saved_items (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, item_type TEXT NOT NULL,
      item_id TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(user_id, item_type, item_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL,
      revoked_at INTEGER, created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS oauth_accounts (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL, created_at INTEGER NOT NULL,
      UNIQUE(provider, provider_user_id), UNIQUE(user_id, provider),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS oauth_accounts_user_idx ON oauth_accounts(user_id);
  `);

  const emailColumn = sqliteDb.prepare('PRAGMA table_info(users)').all()
    .find((column) => column.name === 'email');
  if (emailColumn?.notnull) {
    sqliteDb.exec('PRAGMA foreign_keys = OFF;');
    try {
      sqliteDb.exec('BEGIN;');
      sqliteDb.exec(`
        CREATE TABLE users_new (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          handle TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password_hash TEXT,
          role TEXT DEFAULT 'Software Engineer',
          company TEXT DEFAULT '',
          location TEXT DEFAULT '',
          avatar TEXT DEFAULT '',
          banner TEXT DEFAULT '',
          bio TEXT DEFAULT '',
          workmark_score INTEGER DEFAULT 950,
          verified INTEGER DEFAULT 0,
          is_admin INTEGER DEFAULT 0,
          auth_provider TEXT DEFAULT 'local',
          created_at INTEGER NOT NULL
        );
        INSERT INTO users_new SELECT * FROM users;
        DROP TABLE users;
        ALTER TABLE users_new RENAME TO users;
        COMMIT;
      `);
    } catch (error) {
      sqliteDb.exec('ROLLBACK;');
      throw error;
    } finally {
      sqliteDb.exec('PRAGMA foreign_keys = ON;');
    }
    const violations = sqliteDb.prepare('PRAGMA foreign_key_check').all();
    if (violations.length > 0) {
      throw new Error(`SQLite users schema migration left ${violations.length} foreign-key violation(s).`);
    }
  }

  db = {
    prepare(sql) {
      return sqliteDb.prepare(sql);
    },
    async close() {
      sqliteDb.close();
    }
  };
  ready = Promise.resolve();
  console.log('[Workmark Database] SQLite schema initialized successfully at:', DB_PATH);
}

export { db, ready };
