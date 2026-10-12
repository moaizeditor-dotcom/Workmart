import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const originalCwd = process.cwd();
const dataDir = mkdtempSync(path.join(tmpdir(), 'workmark-oauth-callback-'));
process.env.NODE_ENV = 'test';
process.env.NETLIFY = 'true';
process.env.DATA_DIR = dataDir;
process.env.APP_URL = 'https://workmak.netlify.app';
process.env.JWT_SECRET = 'oauth-callback-test-secret-at-least-32';
process.env.ADMIN_EMAIL = '';
process.env.ADMIN_PASSWORD = '';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.GITHUB_CLIENT_ID = 'test-github-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
process.env.TWITTER_CLIENT_ID = 'test-twitter-id';
process.env.TWITTER_CLIENT_SECRET = 'test-twitter-secret';
process.chdir(dataDir);

const profiles = {
  google: { id: 'google-subject-1', email: 'google-oauth@example.test', verified_email: true, name: 'Google Test' },
  github: { id: 42, login: 'github-test', name: 'GitHub Test', avatar_url: 'https://example.test/github.png' },
  twitter: { id: 'twitter-subject-1', username: 'twitter-test', name: 'Twitter Test' }
};

globalThis.fetch = async (input) => {
  const url = String(input);
  if (url.includes('/token') || url.includes('/access_token')) {
    return Response.json({ access_token: 'fake-provider-access-token' });
  }
  if (url.includes('googleapis.com')) {
    return Response.json(profiles.google);
  }
  if (url.endsWith('/user/emails')) {
    return Response.json([{ email: 'github-oauth@example.test', primary: true, verified: true }]);
  }
  if (url.endsWith('/user')) {
    return Response.json(profiles.github);
  }
  if (url.includes('api.twitter.com/2/users/me')) {
    return Response.json({ data: profiles.twitter });
  }
  throw new Error(`Unexpected OAuth provider request: ${url}`);
};

const { handler } = await import('../netlify/functions/api.mjs');
const { db } = await import('../server/db.js');
const invoke = (input, { headers = {} } = {}) => {
  const url = new URL(input, 'https://workmak.netlify.app');
  return handler({
    httpMethod: 'GET',
    path: url.pathname,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: { host: 'workmak.netlify.app', 'x-forwarded-proto': 'https', ...headers },
    body: null,
    isBase64Encoded: false
  }, {});
};

try {
  for (const [provider, expectedEmail] of [
    ['google', 'google-oauth@example.test'],
    ['github', 'github-oauth@example.test'],
    ['twitter', null]
  ]) {
    const initiation = await invoke(`/api/auth/oauth/${provider}`);
    assert.equal(initiation.statusCode, 302);
    const authorizationUrl = new URL(initiation.headers.location);
    const state = authorizationUrl.searchParams.get('state');
    const cookieName = `workmark_oauth_${provider}`;
    const nonce = initiation.headers['set-cookie'].match(new RegExp(`${cookieName}=([^;]+)`))?.[1];
    assert.ok(state && nonce, `${provider} OAuth state and cookie should be present`);

    const callback = await invoke(`/api/auth/callback/${provider}?${new URLSearchParams({ code: 'fake-code', state })}`, {
      headers: { cookie: `${cookieName}=${nonce}` }
    });
    assert.equal(callback.statusCode, 302);
    const redirect = new URL(callback.headers.location);
    const token = new URLSearchParams(redirect.hash.slice(1)).get('token');
    assert.ok(token, `${provider} callback should create a session`);

    const me = await invoke('/api/auth/me', { headers: { authorization: `Bearer ${token}` } });
    assert.equal(me.statusCode, 200);
    assert.equal(JSON.parse(me.body).user.email, expectedEmail);

    if (provider === 'twitter') {
      const userId = JSON.parse(me.body).user.id;
      const repeatInitiation = await invoke('/api/auth/oauth/twitter');
      const repeatState = new URL(repeatInitiation.headers.location).searchParams.get('state');
      const repeatNonce = repeatInitiation.headers['set-cookie'].match(/workmark_oauth_twitter=([^;]+)/)?.[1];
      const repeatCallback = await invoke(`/api/auth/callback/twitter?${new URLSearchParams({ code: 'fake-code', state: repeatState })}`, {
        headers: { cookie: `workmark_oauth_twitter=${repeatNonce}` }
      });
      const repeatedToken = new URLSearchParams(new URL(repeatCallback.headers.location).hash.slice(1)).get('token');
      const repeatedMe = await invoke('/api/auth/me', { headers: { authorization: `Bearer ${repeatedToken}` } });
      assert.equal(JSON.parse(repeatedMe.body).user.id, userId);
      assert.equal(db.prepare("SELECT count(*) AS count FROM users WHERE auth_provider = 'twitter'").get().count, 1);
    }

    console.log(`PASS: ${provider} OAuth callback issues a database-backed session.`);
  }
} finally {
  await db.close();
  process.chdir(originalCwd);
  rmSync(dataDir, { recursive: true, force: true });
}
