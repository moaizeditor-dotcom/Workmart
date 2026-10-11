import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const originalCwd = process.cwd();
const dataDir = mkdtempSync(path.join(tmpdir(), 'workmark-netlify-auth-'));
process.env.NETLIFY = 'true';
process.env.DATA_DIR = dataDir;
delete process.env.JWT_SECRET;
process.env.ADMIN_EMAIL = '';
process.env.ADMIN_PASSWORD = '';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.GITHUB_CLIENT_ID = 'test-github-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
process.env.TWITTER_CLIENT_ID = 'test-twitter-id';
process.env.TWITTER_CLIENT_SECRET = 'test-twitter-secret';
process.chdir(dataDir);

const { handler } = await import('../netlify/functions/api.mjs');
const { verifyOAuthState } = await import('../server/auth.js');
const { db } = await import('../server/db.js');

const check = (label, condition) => {
  assert.ok(condition, label);
  console.log(`PASS: ${label}`);
};

const invoke = (input, { method = 'GET', body, headers = {} } = {}) => {
  const url = new URL(input, 'https://workmart.netlify.app');
  return handler({
    httpMethod: method,
    path: url.pathname,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: {
      host: 'workmart.netlify.app',
      'x-forwarded-proto': 'https',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers
    },
    body: body === undefined ? null : JSON.stringify(body),
    isBase64Encoded: false
  }, {});
};

try {
  const configResponse = await invoke('/api/auth/oauth/config');
  const config = JSON.parse(configResponse.body);
  check('Netlify function serves OAuth config as JSON', configResponse.statusCode === 200);
  check('Netlify callback URL respects the forwarded production host',
    config.google.callbackUrl === 'https://workmart.netlify.app/api/auth/callback/google');

  for (const [provider, expectedHost] of [
    ['google', 'accounts.google.com'],
    ['github', 'github.com']
  ]) {
    const start = await invoke(`/api/auth/oauth/${provider}`);
    const authorizationUrl = new URL(start.headers.location);
    const state = authorizationUrl.searchParams.get('state');
    const cookie = start.headers['set-cookie'].match(new RegExp(`workmark_oauth_${provider}=([^;]+)`))?.[1];
    check(`${provider} OAuth redirects to its provider with validated state`,
      start.statusCode === 302 &&
      authorizationUrl.host === expectedHost &&
      !!verifyOAuthState(state, provider, cookie));
  }

  const email = `netlify-function-${Date.now()}@example.test`;
  const registration = await invoke('/api/auth/register', {
    method: 'POST',
    body: { name: 'Netlify Function Test', email, password: 'StrongPassword2026' }
  });
  const registeredUser = JSON.parse(registration.body);
  check('Netlify function parses JSON signup bodies', registration.statusCode === 201 && registeredUser.user.email === email);
  check('Public signup cannot grant administrator access', registeredUser.user.is_admin === 0);

  const duplicate = await invoke('/api/auth/register', {
    method: 'POST',
    body: { name: 'Netlify Function Test', email, password: 'AnotherPassword2026' }
  });
  check('Netlify function reports duplicate email as conflict', duplicate.statusCode === 409);

  const login = await invoke('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'StrongPassword2026' }
  });
  const loginData = JSON.parse(login.body);
  check('Netlify function verifies passwords', login.statusCode === 200 && typeof loginData.token === 'string');

  const me = await invoke('/api/auth/me', {
    headers: { authorization: `Bearer ${loginData.token}` }
  });
  check('Netlify function accepts a persisted bearer session',
    me.statusCode === 200 && JSON.parse(me.body).user.email === email);

  const twitterStart = await invoke('/api/auth/oauth/twitter');
  const authorizationUrl = new URL(twitterStart.headers.location);
  const rawCookie = twitterStart.headers['set-cookie'];
  const nonce = rawCookie.match(/workmark_oauth_twitter=([^;]+)/)?.[1];
  const state = authorizationUrl.searchParams.get('state');
  const stateContext = verifyOAuthState(state, 'twitter', nonce);
  const expectedChallenge = createHash('sha256').update(stateContext.verifier).digest('base64url');
  check('Twitter initiation uses signed state and S256 PKCE',
    authorizationUrl.searchParams.get('code_challenge_method') === 'S256' &&
    authorizationUrl.searchParams.get('code_challenge') === expectedChallenge);

  const callback = await invoke(`/api/auth/callback/twitter?${new URLSearchParams({ state, error: 'access_denied' })}`, {
    headers: { cookie: rawCookie.split(';')[0] }
  });
  const callbackUrl = new URL(callback.headers.location);
  check('OAuth callback validates state and reports provider denial',
    callback.statusCode === 302 && callbackUrl.searchParams.get('auth_error') === 'access_denied');

  console.log('Netlify function verification passed.');
} finally {
  db.close();
  process.chdir(originalCwd);
  rmSync(dataDir, { recursive: true, force: true });
}
