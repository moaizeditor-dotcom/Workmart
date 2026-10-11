import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  requireAuth,
  optionalAuth,
  requireAdmin
} from './auth.js';

try {
  process.loadEnvFile();
} catch (_) {}

const app = express();
const PORT = process.env.PORT || 3001;

// Dynamic Application URL detection for local development, Netlify, and custom domains
export const getAppUrl = (req) => {
  if (process.env.APP_URL && !process.env.APP_URL.includes('localhost')) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (req) {
    const origin = req.get('origin');
    if (origin) return origin.replace(/\/+$/, '');
    const referer = req.get('referer');
    if (referer) {
      try {
        const u = new URL(referer);
        return `${u.protocol}//${u.host}`;
      } catch (_) {}
    }
    const host = req.get('x-forwarded-host') || req.get('host');
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    if (host) return `${proto}://${host}`;
  }
  return process.env.APP_URL || 'http://localhost:3000';
};

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Helper to generate IDs
const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Administrator Account Provisioning & Synchronization
const ensureAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@workmart.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminWorkMart2026!';
    const passwordHash = await hashPassword(adminPassword);

    const existingAdmin = db.prepare('SELECT id, is_admin FROM users WHERE email = ?').get(adminEmail);
    if (!existingAdmin) {
      const adminId = 'usr_admin_master';
      const now = Date.now();
      db.prepare(`
        INSERT INTO users (
          id, name, handle, email, password_hash, role, company, location,
          avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        adminId,
        'WorkMart Administrator',
        '@admin',
        adminEmail,
        passwordHash,
        'Chief System Administrator',
        'WorkMart Corporation',
        'Global Command Center',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
        'Platform Administrator for WorkMart Verified Talent Network.',
        1000,
        1,
        1,
        'local',
        now
      );
      console.log(`[WorkMart Admin] Primary administrator account provisioned: ${adminEmail}`);
    } else {
      db.prepare('UPDATE users SET is_admin = 1, password_hash = ? WHERE email = ?').run(passwordHash, adminEmail);
      console.log(`[WorkMart Admin] Administrator account credentials synchronized: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[WorkMart Admin] Failed to provision administrator account:', err);
  }
};
ensureAdminUser();

// ----------------------------------------------------
// 1. AUTHENTICATION ROUTES
// ----------------------------------------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const userId = uid('usr');
    const baseHandle = '@' + name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    let handle = baseHandle;
    
    // Ensure unique handle
    const handleCheck = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
    if (handleCheck) {
      handle = `${baseHandle}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // First user can be admin if no other user exists, or regular user
    const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
    const isAdmin = userCount === 0 ? 1 : 0;

    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`;
    const defaultBanner = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80`;

    const insertUser = db.prepare(`
      INSERT INTO users (
        id, name, handle, email, password_hash, role, company, location,
        avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    insertUser.run(
      userId,
      name.trim(),
      handle,
      cleanEmail,
      passwordHash,
      role || 'Software Engineer',
      'Independent Enterprise',
      'San Francisco, CA',
      defaultAvatar,
      defaultBanner,
      'Verified member of the Workmark talent network.',
      950,
      1, // verified
      isAdmin,
      'local',
      now
    );

    const newUser = db.prepare('SELECT id, name, handle, email, role, company, location, avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at FROM users WHERE id = ?').get(userId);
    const token = generateToken(newUser);

    return res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// ----------------------------------------------------
// OAUTH & SOCIAL AUTHENTICATION ROUTES
// ----------------------------------------------------

// OAuth Providers Configuration Status
app.get('/api/auth/oauth/config', (req, res) => {
  const currentAppUrl = getAppUrl(req);
  return res.json({
    google: {
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      callbackUrl: `${currentAppUrl}/api/auth/callback/google`
    },
    github: {
      configured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      clientId: process.env.GITHUB_CLIENT_ID || null,
      callbackUrl: `${currentAppUrl}/api/auth/callback/github`
    },
    twitter: {
      configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
      clientId: process.env.TWITTER_CLIENT_ID || null,
      callbackUrl: `${currentAppUrl}/api/auth/callback/twitter`
    }
  });
});

// OAuth Authorization Initiation (Redirect to Provider)
app.get('/api/auth/oauth/:provider', (req, res) => {
  const { provider } = req.params;
  const currentAppUrl = getAppUrl(req);
  const callbackUrl = `${currentAppUrl}/api/auth/callback/${provider}`;

  if (provider === 'google') {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${currentAppUrl}/?auth_error=${encodeURIComponent('Google OAuth is not configured on this server. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.')}`);
    }
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'select_account',
      state: uid('state')
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  if (provider === 'github') {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.redirect(`${currentAppUrl}/?auth_error=${encodeURIComponent('GitHub OAuth is not configured on this server. Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET.')}`);
    }
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: 'read:user user:email',
      state: uid('state')
    });
    return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  }

  if (provider === 'twitter') {
    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      return res.redirect(`${currentAppUrl}/?auth_error=${encodeURIComponent('Twitter/X OAuth is not configured on this server. Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET.')}`);
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.TWITTER_CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: 'users.read tweet.read',
      state: uid('state'),
      code_challenge: 'challenge',
      code_challenge_method: 'plain'
    });
    return res.redirect(`https://twitter.com/i/oauth2/authorize?${params.toString()}`);
  }

  return res.redirect(`${currentAppUrl}/?auth_error=${encodeURIComponent(`Unsupported OAuth provider: ${provider}`)}`);
});

// OAuth Callback (Code Exchange & User Session Generation)
app.get('/api/auth/callback/:provider', async (req, res) => {
  const { provider } = req.params;
  const { code, error, error_description } = req.query;
  const currentAppUrl = getAppUrl(req);
  const callbackUrl = `${currentAppUrl}/api/auth/callback/${provider}`;

  if (error || !code) {
    const errorMsg = error_description || error || 'OAuth authorization cancelled or failed.';
    return res.redirect(`${currentAppUrl}/?auth_error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    let email = null;
    let name = null;
    let avatar = null;

    if (provider === 'google') {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code'
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google OAuth code.');
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const profile = await profileRes.json();
      email = profile.email;
      name = profile.name || profile.given_name || 'Google User';
      avatar = profile.picture;
    } else if (provider === 'github') {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: callbackUrl
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub OAuth code.');
      }

      const profileRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Workmark-App'
        }
      });
      const profile = await profileRes.json();
      name = profile.name || profile.login || 'GitHub Developer';
      avatar = profile.avatar_url;
      email = profile.email;

      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'User-Agent': 'Workmark-App'
          }
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primary = emails.find((e) => e.primary && e.verified) || emails[0];
          if (primary) email = primary.email;
        }
      }
    } else if (provider === 'twitter') {
      const basicAuth = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
      const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: callbackUrl,
          code_verifier: 'challenge'
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Twitter OAuth code.');
      }

      const profileRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const profileJson = await profileRes.json();
      const profile = profileJson.data || {};
      name = profile.name || profile.username || 'Twitter User';
      email = profile.username ? `${profile.username.toLowerCase()}@x.com` : null;
      avatar = profile.profile_image_url;
    } else {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    if (!email) {
      throw new Error(`Could not retrieve verified email from ${provider}.`);
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      const userId = uid('usr');
      const baseHandle = '@' + (name || provider).trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      let handle = baseHandle;
      const handleCheck = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
      if (handleCheck) {
        handle = `${baseHandle}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
      const defaultBanner = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80';
      const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
      const isAdmin = userCount === 0 ? 1 : 0;
      const now = Date.now();

      db.prepare(`
        INSERT INTO users (
          id, name, handle, email, password_hash, role, company, location,
          avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name ? name.trim() : `${provider.toUpperCase()} Professional`,
        handle,
        cleanEmail,
        null,
        'Technology Professional',
        'Independent Network',
        'San Francisco, CA',
        defaultAvatar,
        defaultBanner,
        `Verified member authenticated via ${provider.toUpperCase()}.`,
        960,
        1,
        isAdmin,
        provider,
        now
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, user.id);
        user.avatar = avatar;
      }
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.redirect(`${currentAppUrl}/?token=${token}`);
  } catch (err) {
    console.error(`OAuth callback error [${provider}]:`, err);
    return res.redirect(`${currentAppUrl}/?auth_error=${encodeURIComponent(err.message || 'OAuth authentication failed')}`);
  }
});

// Social Auth API (requires verified email, rejects dummy fallbacks)
app.post('/api/auth/social', async (req, res) => {
  try {
    const { provider, name, email, avatar } = req.body;
    if (!provider) {
      return res.status(400).json({ error: 'OAuth provider required.' });
    }
    if (!email || !email.includes('@') || email.includes('@workmark.io') || email.includes('@workmark.local')) {
      return res.status(400).json({ error: 'Valid verified email is required for social authentication.' });
    }

    const userEmail = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail);

    if (!user) {
      const userId = uid('usr');
      const displayName = name || `${provider.toUpperCase()} Professional`;
      const handle = `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
      const userAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
      const now = Date.now();

      db.prepare(`
        INSERT INTO users (
          id, name, handle, email, password_hash, role, company, location,
          avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        displayName,
        handle,
        userEmail,
        null,
        'Technology Professional',
        'Independent Network',
        'San Francisco, CA',
        userAvatar,
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
        `Authenticated via verified ${provider.toUpperCase()} login.`,
        960,
        1,
        0,
        provider,
        now
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Social auth error:', err);
    return res.status(500).json({ error: 'Failed to authenticate social account.' });
  }
});

// Get Current User Profile (Me)
app.get('/api/auth/me', requireAuth, (req, res) => {
  const userId = req.user.id;
  const skills = db.prepare('SELECT id, name, score, endorsements FROM skills WHERE user_id = ?').all(userId);
  const artifacts = db.prepare('SELECT * FROM artifacts WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const experiences = db.prepare('SELECT * FROM experiences WHERE user_id = ? ORDER BY created_at DESC').all(userId);

  return res.json({
    user: {
      ...req.user,
      skills,
      artifacts,
      experience: experiences
    }
  });
});

// ----------------------------------------------------
// 2. USER PROFILE & PORTFOLIO ROUTES
// ----------------------------------------------------

// Get any user profile by ID
app.get('/api/users/:id', optionalAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, handle, email, role, company, location, avatar, banner, bio, workmark_score, verified, auth_provider, created_at FROM users WHERE id = ?').get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const skills = db.prepare('SELECT id, name, score, endorsements FROM skills WHERE user_id = ?').all(user.id);
  const artifacts = db.prepare('SELECT * FROM artifacts WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const experiences = db.prepare('SELECT * FROM experiences WHERE user_id = ? ORDER BY created_at DESC').all(user.id);

  return res.json({
    user: {
      ...user,
      skills,
      artifacts,
      experience: experiences
    }
  });
});

// Update Profile
app.put('/api/users/profile', requireAuth, (req, res) => {
  const { name, role, company, location, bio, avatar, banner } = req.body;

  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      role = COALESCE(?, role),
      company = COALESCE(?, company),
      location = COALESCE(?, location),
      bio = COALESCE(?, bio),
      avatar = COALESCE(?, avatar),
      banner = COALESCE(?, banner)
    WHERE id = ?
  `).run(
    name ?? null,
    role ?? null,
    company ?? null,
    location ?? null,
    bio ?? null,
    avatar ?? null,
    banner ?? null,
    req.user.id
  );

  const updated = db.prepare('SELECT id, name, handle, email, role, company, location, avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at FROM users WHERE id = ?').get(req.user.id);
  return res.json({ user: updated });
});

// Add Skill
app.post('/api/users/skills', requireAuth, (req, res) => {
  const { name, score } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Skill name is required.' });
  }

  const skillId = uid('skl');
  db.prepare('INSERT INTO skills (id, user_id, name, score, endorsements, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(skillId, req.user.id, name.trim(), score || 90, 0, Date.now());

  const skill = db.prepare('SELECT id, name, score, endorsements FROM skills WHERE id = ?').get(skillId);
  return res.status(201).json({ skill });
});

// Endorse Skill
app.post('/api/users/skills/:id/endorse', optionalAuth, (req, res) => {
  db.prepare('UPDATE skills SET endorsements = endorsements + 1, score = min(100, score + 1) WHERE id = ?').run(req.params.id);
  const updated = db.prepare('SELECT id, name, score, endorsements FROM skills WHERE id = ?').get(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Skill not found.' });
  }
  return res.json({ skill: updated });
});

// Add Work & Distribution Deliverable
app.post('/api/users/artifacts', requireAuth, (req, res) => {
  const { title, category, role, distribution, metric, techStack, demoUrl, repoUrl, image } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Project title is required.' });
  }

  const artifactId = uid('art');
  db.prepare(`
    INSERT INTO artifacts (
      id, user_id, title, category, role, distribution, metric, tech_stack,
      demo_url, repo_url, image, verified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    artifactId,
    req.user.id,
    title.trim(),
    category || 'Architecture',
    role || '',
    distribution || '',
    metric || '',
    techStack || '',
    demoUrl || '',
    repoUrl || '',
    image || '',
    1,
    Date.now()
  );

  const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId);
  return res.status(201).json({ artifact });
});

// Delete Artifact
app.delete('/api/users/artifacts/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM artifacts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return res.json({ success: true });
});

// ----------------------------------------------------
// 3. POSTS & FEED ROUTES
// ----------------------------------------------------

// Get All Posts
app.get('/api/posts', optionalAuth, (req, res) => {
  const currentUserId = req.user ? req.user.id : null;
  const rawPosts = db.prepare(`
    SELECT
      p.id, p.content, p.image_url, p.code_lang, p.code_snippet,
      p.poll_question, p.poll_options, p.tags, p.created_at,
      u.id as author_id, u.name as author_name, u.handle as author_handle,
      u.role as author_role, u.avatar as author_avatar, u.workmark_score as author_score,
      u.verified as author_verified
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all();

  const posts = rawPosts.map((p) => {
    // Reactions count
    const reactions = db.prepare('SELECT reaction_type, count(*) as count FROM post_reactions WHERE post_id = ? GROUP BY reaction_type').all(p.id);
    const reactionCounts = { like: 0, celebrate: 0, support: 0, love: 0, insightful: 0, vouch: 0 };
    let totalLikes = 0;
    reactions.forEach((r) => {
      reactionCounts[r.reaction_type] = r.count;
      totalLikes += r.count;
    });

    // Current user reaction
    let userReaction = null;
    if (currentUserId) {
      const myReact = db.prepare('SELECT reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?').get(p.id, currentUserId);
      if (myReact) userReaction = myReact.reaction_type;
    }

    // Comments
    const comments = db.prepare(`
      SELECT c.id, c.text, c.created_at, u.name as author, u.avatar, u.role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(p.id);

    // Poll data
    let poll = undefined;
    if (p.poll_question) {
      let optionsList = [];
      try {
        optionsList = JSON.parse(p.poll_options || '[]');
      } catch (_) {
        optionsList = ['Option 1', 'Option 2'];
      }

      const votes = db.prepare('SELECT option_index, count(*) as count FROM poll_votes WHERE post_id = ? GROUP BY option_index').all(p.id);
      const voteMap = {};
      let totalVotes = 0;
      votes.forEach((v) => {
        voteMap[v.option_index] = v.count;
        totalVotes += v.count;
      });

      let userVotedIndex = null;
      if (currentUserId) {
        const myVote = db.prepare('SELECT option_index FROM poll_votes WHERE post_id = ? AND user_id = ?').get(p.id, currentUserId);
        if (myVote) userVotedIndex = myVote.option_index;
      }

      poll = {
        question: p.poll_question,
        options: optionsList.map((optText, idx) => ({
          text: optText,
          votes: voteMap[idx] || 0
        })),
        totalVotes,
        userVotedIndex
      };
    }

    let tags = [];
    try {
      tags = JSON.parse(p.tags || '[]');
    } catch (_) {
      tags = [];
    }

    return {
      id: p.id,
      author: {
        id: p.author_id,
        name: p.author_name,
        handle: p.author_handle,
        role: p.author_role,
        avatar: p.author_avatar,
        workmarkScore: p.author_score,
        verified: p.author_verified === 1
      },
      timestamp: 'Just now',
      content: p.content,
      imageUrl: p.image_url || undefined,
      codeBlock: p.code_snippet ? { language: p.code_lang || 'rust', code: p.code_snippet } : undefined,
      poll,
      tags,
      stats: {
        likes: totalLikes,
        comments: comments.length,
        shares: 0,
        reactionCounts
      },
      userReaction,
      commentsList: comments.map((c) => ({
        id: c.id,
        author: c.author,
        avatar: c.avatar,
        role: c.role,
        text: c.text,
        timestamp: 'Just now'
      }))
    };
  });

  return res.json({ posts });
});

// Create Post
app.post('/api/posts', requireAuth, (req, res) => {
  const content = req.body.content || '';
  const imageUrl = req.body.imageUrl || req.body.image_url || '';
  const codeLang = req.body.codeLang || (req.body.codeBlock && req.body.codeBlock.language) || '';
  const codeSnippet = req.body.codeSnippet || (req.body.codeBlock && req.body.codeBlock.code) || '';
  const pollQuestion = req.body.pollQuestion || (req.body.poll && req.body.poll.question) || '';
  
  let pollOptions = [];
  if (Array.isArray(req.body.pollOptions)) {
    pollOptions = req.body.pollOptions;
  } else if (req.body.poll && Array.isArray(req.body.poll.options)) {
    pollOptions = req.body.poll.options.map((o) => (typeof o === 'string' ? o : o.text));
  }

  let tags = ['Engineering'];
  if (Array.isArray(req.body.tags) && req.body.tags.length > 0) {
    tags = req.body.tags;
  }

  if (!content && !imageUrl && !codeSnippet && !pollQuestion) {
    return res.status(400).json({ error: 'Post must contain text, an image, code, or a poll.' });
  }

  const postId = uid('post');
  db.prepare(`
    INSERT INTO posts (
      id, user_id, content, image_url, code_lang, code_snippet,
      poll_question, poll_options, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    postId,
    req.user.id,
    content,
    imageUrl,
    codeLang,
    codeSnippet,
    pollQuestion,
    JSON.stringify(pollOptions),
    JSON.stringify(tags),
    Date.now()
  );

  return res.status(201).json({ success: true, postId });
});

// React to Post
app.post('/api/posts/:id/react', requireAuth, (req, res) => {
  const { reactionType } = req.body;
  const postId = req.params.id;
  const userId = req.user.id;

  const existing = db.prepare('SELECT id, reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?').get(postId, userId);

  if (existing) {
    if (existing.reaction_type === reactionType) {
      // Toggle off
      db.prepare('DELETE FROM post_reactions WHERE id = ?').run(existing.id);
    } else {
      // Switch reaction
      db.prepare('UPDATE post_reactions SET reaction_type = ? WHERE id = ?').run(reactionType, existing.id);
    }
  } else {
    // Insert new
    db.prepare('INSERT INTO post_reactions (id, post_id, user_id, reaction_type, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(uid('rct'), postId, userId, reactionType, Date.now());
  }

  return res.json({ success: true });
});

// Vote in Poll
app.post('/api/posts/:id/poll/vote', requireAuth, (req, res) => {
  const { optionIndex } = req.body;
  const postId = req.params.id;
  const userId = req.user.id;

  const existing = db.prepare('SELECT id FROM poll_votes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  if (existing) {
    return res.status(400).json({ error: 'You have already voted in this poll.' });
  }

  db.prepare('INSERT INTO poll_votes (id, post_id, user_id, option_index, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(uid('pvt'), postId, userId, optionIndex, Date.now());

  return res.json({ success: true });
});

// Add Comment
app.post('/api/posts/:id/comments', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }

  const commentId = uid('cmt');
  db.prepare('INSERT INTO comments (id, post_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(commentId, req.params.id, req.user.id, text.trim(), Date.now());

  return res.status(201).json({ success: true, commentId });
});

// ----------------------------------------------------
// 4. JOBS & APPLICATIONS ROUTES
// ----------------------------------------------------

// List Jobs
app.get('/api/jobs', optionalAuth, (req, res) => {
  const jobs = db.prepare(`
    SELECT j.*, count(a.id) as applicants_count
    FROM jobs j
    LEFT JOIN job_applications a ON j.id = a.job_id
    GROUP BY j.id
    ORDER BY j.created_at DESC
  `).all();

  const formatted = jobs.map((j) => {
    let skillsRequired = [];
    let benefits = [];
    try { skillsRequired = JSON.parse(j.skills_required || '[]'); } catch (_) {}
    try { benefits = JSON.parse(j.benefits || '[]'); } catch (_) {}

    return {
      id: j.id,
      title: j.title,
      company: j.company,
      logo: j.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      location: j.location,
      type: j.type,
      salary: j.salary,
      matchScore: j.match_score,
      workmarkVerifiedEmployer: true,
      skillsRequired,
      description: j.description,
      applicantsCount: j.applicants_count,
      posted: 'Just now',
      benefits
    };
  });

  return res.json({ jobs: formatted });
});

// Post Job
app.post('/api/jobs', requireAuth, (req, res) => {
  const { title, company, logo, location, type, salary, skillsRequired, description, benefits } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Job title is required.' });
  }

  let parsedSkills = [];
  if (Array.isArray(skillsRequired)) {
    parsedSkills = skillsRequired;
  } else if (typeof skillsRequired === 'string') {
    parsedSkills = skillsRequired.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    parsedSkills = ['Software Architecture'];
  }

  let parsedBenefits = [];
  if (Array.isArray(benefits)) {
    parsedBenefits = benefits;
  } else if (typeof benefits === 'string') {
    parsedBenefits = benefits.split(',').map((b) => b.trim()).filter(Boolean);
  } else {
    parsedBenefits = ['Remote Flexibility'];
  }

  const jobId = uid('job');
  db.prepare(`
    INSERT INTO jobs (
      id, user_id, title, company, logo, location, type, salary,
      match_score, skills_required, description, benefits, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    jobId,
    req.user.id,
    title.trim(),
    company || req.user.company || 'Enterprise Partner',
    logo || '',
    location || 'Remote',
    type || 'Full-time',
    salary || '$180,000 - $260,000',
    96,
    JSON.stringify(parsedSkills),
    description || '',
    JSON.stringify(parsedBenefits),
    Date.now()
  );

  return res.status(201).json({ success: true, jobId });
});

// Apply to Job
app.post('/api/jobs/:id/apply', requireAuth, (req, res) => {
  const { fullName, email, phone, coverNote } = req.body;
  const jobId = req.params.id;

  const existing = db.prepare('SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?').get(jobId, req.user.id);
  if (existing) {
    return res.status(400).json({ error: 'You have already applied to this role.' });
  }

  const appId = uid('app');
  db.prepare(`
    INSERT INTO job_applications (
      id, job_id, user_id, full_name, email, phone, cover_note, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    appId,
    jobId,
    req.user.id,
    fullName || req.user.name,
    email || req.user.email,
    phone || '',
    coverNote || '',
    'Under Review',
    Date.now()
  );

  return res.status(201).json({ success: true, applicationId: appId });
});

// List User's Job Applications
app.get('/api/jobs/applications', requireAuth, (req, res) => {
  const applications = db.prepare(`
    SELECT
      a.id, a.status, a.created_at,
      j.id as job_id, j.title as job_title, j.company as job_company, j.logo as job_logo, j.location as job_location
    FROM job_applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user.id);

  const formatted = applications.map((a) => ({
    id: a.id,
    jobId: a.job_id,
    job: {
      id: a.job_id,
      title: a.job_title,
      company: a.job_company,
      logo: a.job_logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      location: a.job_location
    },
    date: 'Recent',
    status: a.status
  }));

  return res.json({ applications: formatted });
});

// ----------------------------------------------------
// 5. NETWORK & CONNECTIONS ROUTES
// ----------------------------------------------------

app.get('/api/network', requireAuth, (req, res) => {
  const currentUserId = req.user.id;

  // Real registered users in directory
  const allUsers = db.prepare('SELECT id, name, handle, role, company, location, avatar, workmark_score, verified FROM users WHERE id != ?').all(currentUserId);

  // My connections
  const connections = db.prepare(`
    SELECT c.id, c.status, c.requester_id, c.recipient_id,
      u.id as user_id, u.name, u.role, u.company, u.avatar, u.workmark_score
    FROM connections c
    JOIN users u ON (CASE WHEN c.requester_id = ? THEN c.recipient_id ELSE c.requester_id END) = u.id
    WHERE c.requester_id = ? OR c.recipient_id = ?
  `).all(currentUserId, currentUserId, currentUserId);

  const connectedMap = {};
  connections.forEach((c) => {
    connectedMap[c.user_id] = c.status;
  });

  const nodes = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    company: u.company || 'Enterprise',
    score: u.workmark_score,
    connections: 120,
    mutual: 4,
    avatar: u.avatar,
    category: 'Engineering',
    status: connectedMap[u.id] || 'discover'
  }));

  return res.json({ nodes });
});

app.post('/api/network/connect', requireAuth, (req, res) => {
  const { targetUserId, note } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'Target user ID required.' });

  const existing = db.prepare('SELECT id FROM connections WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)')
    .get(req.user.id, targetUserId, targetUserId, req.user.id);

  if (!existing) {
    db.prepare('INSERT INTO connections (id, requester_id, recipient_id, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uid('conn'), req.user.id, targetUserId, 'connected', note || '', Date.now());
  }

  return res.json({ success: true });
});

// ----------------------------------------------------
// 6. DIRECT MESSAGING ROUTES
// ----------------------------------------------------

app.get('/api/messages', requireAuth, (req, res) => {
  const currentUserId = req.user.id;

  const msgs = db.prepare(`
    SELECT m.*,
      sender.name as sender_name, sender.avatar as sender_avatar,
      recipient.name as recipient_name, recipient.avatar as recipient_avatar
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users recipient ON m.recipient_id = recipient.id
    WHERE m.sender_id = ? OR m.recipient_id = ?
    ORDER BY m.created_at ASC
  `).all(currentUserId, currentUserId);

  return res.json({ messages: msgs });
});

app.post('/api/messages', requireAuth, (req, res) => {
  const { recipientId, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const msgId = uid('msg');
  db.prepare('INSERT INTO messages (id, sender_id, recipient_id, text, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(msgId, req.user.id, recipientId || req.user.id, text.trim(), Date.now());

  return res.status(201).json({ success: true, messageId: msgId });
});

// ----------------------------------------------------
// 7. NOTIFICATIONS ROUTES
// ----------------------------------------------------

app.get('/api/notifications', requireAuth, (req, res) => {
  const notifs = db.prepare(`
    SELECT n.*, u.name as actor_name, u.avatar as actor_avatar, u.role as actor_role
    FROM notifications n
    LEFT JOIN users u ON n.actor_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
  `).all(req.user.id);

  return res.json({ notifications: notifs });
});

app.put('/api/notifications/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  return res.json({ success: true });
});

// ----------------------------------------------------
// 8. ADMIN DASHBOARD & TELEMETRY
// ----------------------------------------------------

app.get('/api/admin/stats', requireAuth, requireAdmin, (req, res) => {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  const postCount = db.prepare('SELECT count(*) as count FROM posts').get().count;
  const jobCount = db.prepare('SELECT count(*) as count FROM jobs').get().count;
  const appCount = db.prepare('SELECT count(*) as count FROM job_applications').get().count;

  return res.json({
    stats: {
      registeredUsers: userCount,
      activePosts: postCount,
      jobsPosted: jobCount,
      applicationsSubmitted: appCount,
      uptime: '99.99%',
      database: 'SQLite WAL Mode'
    }
  });
});

app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, handle, email, role, company, verified, is_admin, created_at FROM users ORDER BY created_at DESC').all();
  return res.json({ users });
});

// Start Server
if (process.env.NODE_ENV !== 'test' && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`[Workmark Backend API] Live on http://localhost:${PORT}`);
  });
}

export default app;
export { app };
