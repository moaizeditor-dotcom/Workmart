import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure secret management
const SECRET_FILE = path.resolve(__dirname, '../data/.jwt_secret');
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (fs.existsSync(SECRET_FILE)) {
    JWT_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } else {
    JWT_SECRET = 'workmark_sec_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      fs.writeFileSync(SECRET_FILE, JWT_SECRET, 'utf8');
    } catch (_) {}
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
