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

Email authentication uses the Express API and SQLite database. Set a strong,
unique `JWT_SECRET` in the deployment environment. To provision an administrator,
set both `ADMIN_EMAIL` and `ADMIN_PASSWORD`; the application does not ship with
public default administrator credentials, and new signups are not administrators.

Google, GitHub, and Twitter/X sign-in require the corresponding provider client
credentials and a callback URL registered with that provider. The callback URL
is `https://<your-domain>/api/auth/callback/<provider>`. Twitter/X must return
a verified email address for account creation; a synthetic email is not used.

**Netlify limitation:** this project currently uses SQLite. Netlify function
storage under `/tmp` is temporary and local to a function instance, so it is not
a persistent shared production database. A persistent database and corresponding
backend integration are required before production signup, login, and session
verification can be considered reliable. `DATABASE_PATH` does not make Netlify
function storage persistent.
