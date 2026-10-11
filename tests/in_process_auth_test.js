import { hashPassword, comparePassword, generateToken, verifyToken } from '../server/auth.js';
import { db } from '../server/db.js';
import { getAppUrl } from '../server/index.js';

async function runDirectAuthVerification() {
  console.log('=== STARTING DIRECT IN-PROCESS AUTH VERIFICATION ===');
  let passed = 0;
  let failed = 0;

  const test = (name, ok) => {
    if (ok) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  // 1. Password Hashing & Verification
  const testPw = 'SecureSecret2026!';
  const hashed = await hashPassword(testPw);
  test('bcrypt hashes password securely', typeof hashed === 'string' && hashed.startsWith('$2'));
  test('bcrypt matches valid password', await comparePassword(testPw, hashed) === true);
  test('bcrypt rejects invalid password', await comparePassword('wrong_pw', hashed) === false);

  // 2. JWT Generation & Verification
  const mockUser = { id: 'usr_test_999', email: 'test@engineer.com', handle: '@test', is_admin: 0 };
  const token = generateToken(mockUser);
  test('Generates signed JWT token', typeof token === 'string' && token.split('.').length === 3);

  const decoded = verifyToken(token);
  test('Decodes and verifies valid JWT payload', decoded && decoded.id === mockUser.id && decoded.email === mockUser.email);
  test('Rejects corrupted JWT token', verifyToken(token + 'tampered') === null);

  // 3. Database Schema & User Table
  const userTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  test('SQLite users table exists', !!userTable);

  // 4. Admin Account in Database
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const admin = configuredAdminEmail
    ? db.prepare('SELECT id, email, is_admin, password_hash FROM users WHERE email = ?').get(configuredAdminEmail)
    : null;
  if (configuredAdminEmail && process.env.ADMIN_PASSWORD) {
    test('Configured administrator account exists', !!admin && admin.is_admin === 1);
    test('Configured administrator password is active', admin && await comparePassword(process.env.ADMIN_PASSWORD, admin.password_hash));
  } else {
    const defaultAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@workmart.com' AND is_admin = 1").get();
    test('No public default administrator account is provisioned', !defaultAdmin);
  }

  // 5. Dynamic App URL Detection
  const mockReqLocal = { get: (h) => (h === 'host' ? 'localhost:3000' : h === 'x-forwarded-proto' ? 'http' : null) };
  const urlLocal = getAppUrl(mockReqLocal);
  test('getAppUrl resolves local host correctly', urlLocal === 'http://localhost:3000');

  const mockReqNetlify = { get: (h) => (h === 'x-forwarded-host' ? 'workmart.netlify.app' : h === 'x-forwarded-proto' ? 'https' : null) };
  const urlNetlify = getAppUrl(mockReqNetlify);
  test('getAppUrl dynamically detects Netlify production domain', urlNetlify === 'https://workmart.netlify.app');

  // 6. User Registration & Duplicate Email Protection
  const testEmail = `verification_${Date.now()}@domain.com`;
  const newUserId = `usr_test_${Date.now()}`;
  const now = Date.now();
  const regHash = await hashPassword('UserPassword123!');

  db.prepare(`
    INSERT INTO users (id, name, handle, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(newUserId, 'Test User', `@test_${Date.now()}`, testEmail, regHash, 'Senior Engineer', now);

  const inserted = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(newUserId);
  test('Successfully creates user record in database', inserted && inserted.email === testEmail);

  let duplicateBlocked = false;
  try {
    db.prepare(`
      INSERT INTO users (id, name, handle, email, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr_dup', 'Dup', `@dup_${Date.now()}`, testEmail, regHash, now);
  } catch (err) {
    duplicateBlocked = true;
  }
  test('Enforces UNIQUE constraint on email (duplicate rejection)', duplicateBlocked);

  // 7. Cleanup test record
  db.prepare('DELETE FROM users WHERE id = ?').run(newUserId);
  const deletedCheck = db.prepare('SELECT id FROM users WHERE id = ?').get(newUserId);
  test('Test user record cleaned up safely', !deletedCheck);

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runDirectAuthVerification().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
