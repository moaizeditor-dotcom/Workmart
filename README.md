# WORKMARK 3D — Next-Generation Professional Network & Career Exchange

**Workmark** is an elevated, 3D animated professional network and talent platform engineered to supersede traditional platforms like LinkedIn through **interactive 3D spatial computing**, **cryptographic Proof-of-Work dossiers**, and **real-time talent exchanges**.

---

## 🌟 Key Features

### 1. 3D Spatial Computing & Visual Atmosphere
* **Interactive 3D Constellation Globe**: Live Three.js WebGL particle globe showing verified talent nodes, connecting arcs, and real-time network density.
* **Ambient Parallax Starfield**: Dynamic particle galaxy responding to mouse coordinates.
* **3D Perspective Card Tilt (`Card3DTilt`)**: Hardware-accelerated perspective tilt with dynamic specular gloss and iridescent holographic sheen.
* **Cryptographic Proof-of-Work Badges**: Verification badges displaying audited scores (e.g. `99.2 WM`) and cryptographic proof hashes.

### 2. Upgraded LinkedIn Capabilities
* **The Pulse (Feed)**: Verified technical milestones, code snippets, benchmarks, and multi-tier reactions (`Vouch`, `Insightful`, `Inspire`).
* **The Constellation (3D Network)**: Rotate, inspect, and connect with 1st, 2nd, and 3rd degree connections in an interactive 3D particle sphere.
* **The Exchange (Opportunities)**: AI-computed Skill Match scores (e.g. `98% Match`), salary transparency, culture metrics, and **Instant 1-Click Dossier Apply**.
* **Direct Wire (P2P Messaging)**: Encrypted instant messaging with conversation threads, schedule sync integration, and spatial video call shortcuts.
* **Workmark Dossier (Profile)**: Interactive 3D skill radar, open-source proof-of-work artifacts, and career architecture timelines.

### 3. Dedicated Admin Control Tower
* **Secure Authentication**: Restrictive admin login gateway.
* **Platform KPIs**: Track Total Users (148.9k), Daily Active Users (58.4k), Audited Proofs (112.8k), and Platform ARR ($2.85M).
* **Interactive Growth Graphs**: Dynamic SVG user acquisition and active node trends.
* **Talent Cluster Breakdown**: Domain distribution across AI, Distributed Systems, Spatial 3D, and Leadership.
* **User Governance Console**: Real-time user management (search, verify, reinstate, suspend, or ban flagged accounts).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

# Workmark

## Authentication and deployment configuration

Email authentication uses the Express API. Local development uses SQLite;
Netlify production requires a managed PostgreSQL database through `DATABASE_URL`
and fails closed if it is not configured. The first function startup runs
versioned, transactional schema migrations and uses a small connection pool.
Set a strong, unique `JWT_SECRET` (at least 32 characters) and the stable
`APP_URL=https://workmak.netlify.app` in Netlify's server-side environment
variables. Do not use `VITE_` prefixes for secrets. To provision an administrator,
set both `ADMIN_EMAIL` and `ADMIN_PASSWORD`; the application does not ship with
public default administrator credentials, and new signups are not administrators.

Google, GitHub, and Twitter/X sign-in require the corresponding provider client
credentials and a callback URL registered with that provider:

- Google: `https://workmak.netlify.app/api/auth/callback/google`
- GitHub: `https://workmak.netlify.app/api/auth/callback/github`
- Twitter/X: `https://workmak.netlify.app/api/auth/callback/twitter`

OAuth accounts are linked by the provider's stable account ID. Verified email
addresses are associated when available; Twitter/X can create an account even
when its API does not provide an email address.

### Production database setup and safe migration

1. Provision a managed PostgreSQL database (for example, Supabase or Neon).
2. Set `DATABASE_URL` to the provider's SSL-enabled connection URI and
   `JWT_SECRET` to a newly generated random value in Netlify's server-side
   environment variables. Set `APP_URL` to `https://workmak.netlify.app`.
3. Save the variables and trigger a fresh deploy; function runtime settings
   added after deployment are not present in an existing function bundle.
   The API runs its schema
   migrations at startup. The site does not use `/tmp` for production data.
4. To import an existing local SQLite database into a newly provisioned,
   empty PostgreSQL database, set `SQLITE_SOURCE_PATH` to the local file path
   and run `npm run db:import-sqlite`. The importer refuses a non-empty
   destination and never modifies the source database. Netlify's prior
   instance-local `/tmp` data is not available for migration from this workspace.
5. Verify signup, login, logout, and sessions on the live site before treating
   the cutover as complete.

Production sessions are signed with `JWT_SECRET` and also stored in PostgreSQL;
logout revokes the server-side session. A password-reset flow is not currently
implemented.
