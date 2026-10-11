import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure secret management
const SECRET_DIR = process.env.DATA_DIR || (process.env.NETLIFY ? '/tmp' : path.resolve(__dirname, '../data'));
const SECRET_FILE = path.join(SECRET_DIR, '.jwt_secret');
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (fs.existsSync(SECRET_FILE)) {
    JWT_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } else {
    JWT_SECRET = randomBytes(48).toString('base64url');
    fs.mkdirSync(SECRET_DIR, { recursive: true });
    try {
      fs.writeFileSync(SECRET_FILE, JWT_SECRET, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      JWT_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    }
  }

  if (process.env.NETLIFY) {
    console.warn('[Workmark Auth] JWT_SECRET is not configured; using an instance-local key. Configure JWT_SECRET in Netlify for stable sessions.');
  }
}

export const hashPassword = async (plaintext) => {
  return bcrypt.hash(plaintext, 10);
};

export const comparePassword = async (plaintext, hash) => {
  if (!hash) return false;
  return bcrypt.compare(plaintext, hash);
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      handle: user.handle,
      is_admin: user.is_admin || 0
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const createOAuthState = (provider) => {
  const nonce = randomBytes(32).toString('base64url');
  const verifier = provider === 'twitter' ? randomBytes(32).toString('base64url') : undefined;
  const state = jwt.sign({ provider, nonce, verifier }, JWT_SECRET, { expiresIn: '10m' });
  return { state, nonce, verifier };
};

export const verifyOAuthState = (state, provider, nonce) => {
  try {
    const payload = jwt.verify(state, JWT_SECRET);
    if (payload.provider !== provider || typeof payload.nonce !== 'string' || typeof nonce !== 'string') {
      return null;
    }
    const expected = Buffer.from(payload.nonce);
    const actual = Buffer.from(nonce);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }
    return { verifier: payload.verifier };
  } catch {
    return null;
  }
};

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }

  const stmt = db.prepare('SELECT id, name, handle, email, role, company, location, avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at FROM users WHERE id = ?');
  const user = stmt.get(payload.id);

  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  req.user = user;
  next();
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      const stmt = db.prepare('SELECT id, name, handle, email, role, company, location, avatar, banner, bio, workmark_score, verified, is_admin, auth_provider, created_at FROM users WHERE id = ?');
      const user = stmt.get(payload.id);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.is_admin !== 1) {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  next();
};
