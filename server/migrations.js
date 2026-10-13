export const migrations = [
  {
    version: 1,
    sql: `
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
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        score INTEGER DEFAULT 90,
        endorsements INTEGER DEFAULT 0,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'Architecture',
        role TEXT DEFAULT '',
        distribution TEXT DEFAULT '',
        metric TEXT DEFAULT '',
        tech_stack TEXT DEFAULT '',
        demo_url TEXT DEFAULT '',
        repo_url TEXT DEFAULT '',
        image TEXT DEFAULT '',
        verified INTEGER DEFAULT 1,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        period TEXT DEFAULT '',
        location TEXT DEFAULT '',
        description TEXT DEFAULT '',
        skills_tagged TEXT DEFAULT '',
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        code_lang TEXT DEFAULT '',
        code_snippet TEXT DEFAULT '',
        poll_question TEXT DEFAULT '',
        poll_options TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_reactions (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction_type TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE(post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS poll_votes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        option_index INTEGER NOT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE(post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        logo TEXT DEFAULT '',
        location TEXT DEFAULT '',
        type TEXT DEFAULT 'Full-time',
        salary TEXT DEFAULT '',
        match_score INTEGER DEFAULT 95,
        skills_required TEXT DEFAULT '',
        description TEXT DEFAULT '',
        benefits TEXT DEFAULT '',
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT '',
        cover_note TEXT DEFAULT '',
        status TEXT DEFAULT 'Under Review',
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        note TEXT DEFAULT '',
        created_at BIGINT NOT NULL,
        UNIQUE(requester_id, recipient_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS saved_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE(user_id, item_type, item_id)
      );

      CREATE INDEX IF NOT EXISTS skills_user_id_idx ON skills(user_id);
      CREATE INDEX IF NOT EXISTS artifacts_user_created_idx ON artifacts(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS experiences_user_created_idx ON experiences(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS posts_created_idx ON posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS post_reactions_user_idx ON post_reactions(user_id);
      CREATE INDEX IF NOT EXISTS poll_votes_user_idx ON poll_votes(user_id);
      CREATE INDEX IF NOT EXISTS comments_post_created_idx ON comments(post_id, created_at);
      CREATE INDEX IF NOT EXISTS jobs_created_idx ON jobs(created_at DESC);
      CREATE INDEX IF NOT EXISTS applications_user_created_idx ON job_applications(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS connections_recipient_idx ON connections(recipient_id);
      CREATE INDEX IF NOT EXISTS messages_recipient_created_idx ON messages(recipient_id, created_at);
      CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications(user_id, created_at DESC);
    `
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at BIGINT NOT NULL,
        revoked_at BIGINT,
        created_at BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
    `
  },
  {
    version: 3,
    sql: `
      ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_user_id TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE(provider, provider_user_id),
        UNIQUE(user_id, provider)
      );
      CREATE INDEX IF NOT EXISTS oauth_accounts_user_idx ON oauth_accounts(user_id);
    `,
    libsqlSql: `
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_user_id TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE(provider, provider_user_id),
        UNIQUE(user_id, provider)
      );
      CREATE INDEX IF NOT EXISTS oauth_accounts_user_idx ON oauth_accounts(user_id);
    `
  }
];

export const migratePostgres = async (pool) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(723540921)');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at BIGINT NOT NULL
      )
    `);

    for (const migration of migrations) {
      const applied = await client.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [migration.version]
      );
      if (applied.rowCount === 0) {
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2)',
          [migration.version, Date.now()]
        );
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const migrateLibsql = async (client) => {
  const maxAttempts = 8;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let transaction;
    try {
      transaction = await client.transaction('write');
      await transaction.execute(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          applied_at BIGINT NOT NULL
        )
      `);

      for (const migration of migrations) {
        const applied = await transaction.execute({
          sql: 'SELECT version FROM schema_migrations WHERE version = ?',
          args: [migration.version]
        });
        if (applied.rows.length === 0) {
          const statements = (migration.libsqlSql || migration.sql)
            .split(';')
            .map((statement) => statement.trim())
            .filter(Boolean);
          for (const statement of statements) {
            await transaction.execute(statement);
          }
          await transaction.execute({
            sql: 'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
            args: [migration.version, Date.now()]
          });
        }
      }

      await transaction.commit();
      return;
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          throw new AggregateError([error, rollbackError], 'libSQL migration failed and could not be rolled back.');
        }
      }

      const isLocked = error.code === 'SQLITE_BUSY' || error.code === 'SQLITE_LOCKED';
      if (!isLocked || attempt === maxAttempts - 1) {
        throw error;
      }
      const delayMs = Math.min(1000, 100 * (2 ** attempt)) + Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
