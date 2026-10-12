const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';

async function runTests() {
  console.log('--- STARTING WORKMARK BACKEND END-TO-END VERIFICATION ---');
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

  // 1. Invalid registration: short password
  const res1 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@workmark.io', password: '123' })
  });
  test('Rejects registration with password < 6 chars', res1.status === 400);

  // 2. Real user registration
  const uniqueEmail = `test_${Date.now()}@workmark.io`;
  const res2 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: uniqueEmail,
      password: 'RealSecurePassword2026',
      role: 'Principal Cloud Architect'
    })
  });
  const data2 = await res2.json();
  test('Registers real user with status 201', res2.status === 201);
  test('Returns signed JWT token', typeof data2.token === 'string' && data2.token.length > 20);
  test('User record has correct email and name', data2.user && data2.user.email === uniqueEmail);
  const token = data2.token;

  // 3. Duplicate email rejection
  const res3 = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Duplicate',
      email: uniqueEmail,
      password: 'AnotherPassword'
    })
  });
  test('Rejects duplicate email registration with status 409', res3.status === 409);

  // 4. Invalid credentials login
  const res4 = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'WrongPassword' })
  });
  test('Rejects login with invalid password (401)', res4.status === 401);

  // 5. Valid credentials login
  const res5 = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'RealSecurePassword2026' })
  });
  const data5 = await res5.json();
  test('Logs in with valid credentials (200)', res5.status === 200 && !!data5.token);

  // 6. Access protected /me route
  const res6 = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data6 = await res6.json();
  test('Protected /me endpoint returns user profile', res6.status === 200 && data6.user.email === uniqueEmail);

  // 7. Create real post
  const res7 = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content: 'Building production distributed SQLite backend for Workmark.',
      codeLang: 'typescript',
      codeSnippet: 'const db = new DatabaseSync("./data/workmark.sqlite");',
      tags: ['Engineering', 'SQLite']
    })
  });
  const data7 = await res7.json();
  test('Creates real post in database (201)', res7.status === 201 && !!data7.postId);
  const postId = data7.postId;

  // 8. Like real post
  const res8 = await fetch(`${API_BASE}/posts/${postId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reactionType: 'like' })
  });
  test('Toggles reaction in database', res8.status === 200);

  // 9. Add comment to real post
  const res9 = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text: 'Verified real comment persistence!' })
  });
  test('Adds comment to database', res9.status === 201);

  // 10. Post a real job opening
  const res10 = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Senior Distributed Systems Engineer',
      company: 'Cyberdyne Systems',
      location: 'San Francisco, CA',
      salary: '$240,000 - $320,000',
      description: 'Lead production database architecture'
    })
  });
  const data10 = await res10.json();
  test('Posts real job opening to database (201)', res10.status === 201 && !!data10.jobId);
  const jobId = data10.jobId;

  // 11. Apply to real job
  const res11 = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      fullName: 'Sarah Connor',
      email: uniqueEmail,
      phone: '+1 415 555 0199',
      coverNote: 'Extensive experience in high availability architectures.'
    })
  });
  test('Applies to real job opening (201)', res11.status === 201);

  // 12. Fetch applications
  const res12 = await fetch(`${API_BASE}/jobs/applications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data12 = await res12.json();
  test('Fetches real submitted applications', res12.status === 200 && data12.applications.length >= 1);

  // 13. Update profile
  const res13 = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      bio: 'Verified production system engineer working on fault-tolerant systems.',
      location: 'Austin, TX'
    })
  });
  const data13 = await res13.json();
  test('Updates profile in database', res13.status === 200 && data13.user.location === 'Austin, TX');

  // 14. Add skill & endorse
  const res14 = await fetch(`${API_BASE}/users/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Distributed Consensus', score: 95 })
  });
  const data14 = await res14.json();
  test('Adds skill to database', res14.status === 201 && !!data14.skill?.id);
  const skillId = data14.skill?.id;

  if (skillId) {
    const res14b = await fetch(`${API_BASE}/users/skills/${skillId}/endorse`, { method: 'POST' });
    const data14b = await res14b.json();
    test('Endorses skill in database', res14b.status === 200 && data14b.skill.endorsements >= 1);
  }

  // 15. Add artifact & delete artifact
  const res15 = await fetch(`${API_BASE}/users/artifacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'High-Throughput Raft Cluster',
      role: 'Lead Architect',
      distribution: 'Designed consensus state machine',
      metric: 'Processed 500k ops/sec with <2ms latency',
      techStack: 'Rust, Tokio, gRPC'
    })
  });
  const data15 = await res15.json();
  test('Creates verified work artifact (201)', res15.status === 201 && !!data15.artifact?.id);
  const artifactId = data15.artifact?.id;

  if (artifactId) {
    const res15b = await fetch(`${API_BASE}/users/artifacts/${artifactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    test('Deletes work artifact cleanly', res15b.status === 200);
  }

  // 16. Create poll & vote
  const res16 = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content: 'What database engine do you rely on for single-node low latency?',
      pollQuestion: 'Primary Embedded Database?',
      pollOptions: ['SQLite WAL', 'DuckDB', 'RocksDB', 'LMDB']
    })
  });
  const data16 = await res16.json();
  test('Creates poll post in database', res16.status === 201 && !!data16.postId);
  const pollPostId = data16.postId;

  if (pollPostId) {
    const res16b = await fetch(`${API_BASE}/posts/${pollPostId}/poll/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ optionIndex: 0 })
    });
    test('Casts vote in database poll', res16b.status === 200);
  }

  const logoutRes = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  test('Revokes the server-side session on logout', logoutRes.status === 200);

  const revokedSessionRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  test('Rejects a revoked session on subsequent requests', revokedSessionRes.status === 401);

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
