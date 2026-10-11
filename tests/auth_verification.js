const API_BASE = 'http://localhost:3001/api';

async function runAuthTests() {
  console.log('=== STARTING WORKMARK AUTHENTICATION VERIFICATION SUITE ===');
  let passed = 0;
  let failed = 0;

  const test = (name, assertion) => {
    if (assertion) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  // 1. OAuth Configuration endpoint
  const cfgRes = await fetch(`${API_BASE}/auth/oauth/config`);
  const cfg = await cfgRes.json();
  test('OAuth config returns google, github, and twitter fields',
    cfgRes.status === 200 &&
    typeof cfg.google?.configured === 'boolean' &&
    typeof cfg.github?.configured === 'boolean' &&
    typeof cfg.twitter?.configured === 'boolean'
  );
  test('OAuth callback URLs point to /api/auth/callback/:provider',
    cfg.google?.callbackUrl?.includes('/api/auth/callback/google') &&
    cfg.github?.callbackUrl?.includes('/api/auth/callback/github') &&
    cfg.twitter?.callbackUrl?.includes('/api/auth/callback/twitter')
  );

  // 2. OAuth initiation without env credentials redirects cleanly to auth_error
  const googleRes = await fetch(`${API_BASE}/auth/oauth/google`, { redirect: 'manual' });
  const googleLoc = googleRes.headers.get('location') || '';
  test('Unconfigured Google OAuth redirects cleanly with auth_error explanation',
    (googleRes.status === 302 || googleRes.status === 301) &&
    googleLoc.includes('auth_error=') &&
    googleLoc.includes('Google')
  );

  const githubRes = await fetch(`${API_BASE}/auth/oauth/github`, { redirect: 'manual' });
  const githubLoc = githubRes.headers.get('location') || '';
  test('Unconfigured GitHub OAuth redirects cleanly with auth_error explanation',
    (githubRes.status === 302 || githubRes.status === 301) &&
    githubLoc.includes('auth_error=') &&
    githubLoc.includes('GitHub')
  );

  const twitterRes = await fetch(`${API_BASE}/auth/oauth/twitter`, { redirect: 'manual' });
  const twitterLoc = twitterRes.headers.get('location') || '';
  test('Unconfigured Twitter OAuth redirects cleanly with auth_error explanation',
    (twitterRes.status === 302 || twitterRes.status === 301) &&
    twitterLoc.includes('auth_error=') &&
    twitterLoc.includes('Twitter')
  );

  // 3. OAuth callback error redirect
  const callbackRes = await fetch(`${API_BASE}/auth/callback/google?error=access_denied&error_description=User+declined`, { redirect: 'manual' });
  const locationHeader = callbackRes.headers.get('location') || '';
  test('OAuth callback redirect on error sends to /?auth_error=...',
    (callbackRes.status === 302 || callbackRes.status === 301) &&
    locationHeader.includes('auth_error=')
  );

  // 4. Reject dummy/fake email injection on /api/auth/social
  const dummyRes = await fetch(`${API_BASE}/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', email: 'google_user_test@workmark.io' })
  });
  test('Rejects synthetic dummy email on /api/auth/social (400)', dummyRes.status === 400);

  // 5. Email registration validation
  const invalidEmailRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alex Smith', email: 'invalid-email', password: 'password123' })
  });
  test('Rejects registration with invalid email format (400)', invalidEmailRes.status === 400);

  // 6. Valid user registration
  const realEmail = `real_engineer_${Date.now()}@domain.com`;
  const registerRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Smith',
      email: realEmail,
      password: 'StrongAuthPassword2026',
      role: 'Staff Infrastructure Engineer'
    })
  });
  const regData = await registerRes.json();
  test('Registers real user account with 201', registerRes.status === 201);
  test('Returns valid JWT token', typeof regData.token === 'string' && regData.token.length > 20);
  test('Returns sanitized user object without password_hash', regData.user && !regData.user.password_hash);

  const userToken = regData.token;

  // 7. Verify session persistence via /api/auth/me
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const meData = await meRes.json();
  test('Session verified via /api/auth/me', meRes.status === 200 && meData.user?.email === realEmail);

  // 8. Login verification
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: realEmail,
      password: 'StrongAuthPassword2026'
    })
  });
  const loginData = await loginRes.json();
  test('Logs in successfully with real credentials (200)', loginRes.status === 200 && typeof loginData.token === 'string');

  // 9. Wrong password rejection
  const badLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: realEmail,
      password: 'IncorrectPassword'
    })
  });
  test('Rejects incorrect credentials with 401', badLoginRes.status === 401);

  console.log(`=== AUTH VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runAuthTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
