# Sportify (TURF MAX)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)

---

## 🚀 Project Overview
**Sportify (TURF MAX)** is a full-stack sports booking and match-management platform centered around turf/ground reservations, team management, matchmaking, tournaments, and match history.

This repository is unusually documentation-rich (audit reports, schema docs, local setup guides). The purpose of this `README.md` is to provide a single, clean entry-point (similar to your AI-Integrated IDS README), while keeping the existing detailed documents as the source of truth.

---

## 🧾 Recruiter-Friendly Summary (What you should know)
- Full-stack TypeScript application with a **client**, **server**, and **shared** modules.
- Backed by a **PostgreSQL** database with a fully documented schema.
- Supports **turf bookings**, **teams**, **matches**, **tournaments**, and related workflows.
- Includes extensive verification artifacts: audit, schema walkthrough, and setup docs.

---

## ✨ Key Features
### Core Platform
- Turf listing, filtering, and detail views
- Booking creation with conflict checking
- Team creation and team membership management
- Match creation, match history, and match invitations
- Tournament listing and registrations

### Competitive / Ranking
- Team rating (ELO) support (documented in schema docs)

### Admin / Operations
- Admin-visible user and system data (as documented in the audit)

---

## 🏗️ Architecture (High Level)
```
client/   -> Frontend (Vite + TS)
server/   -> Backend API (Node/TS)
shared/   -> Shared types/utilities
migrations/ + drizzle.config.ts -> DB migrations / ORM config
```

---

## 📁 Repository Layout (Root)
This repo contains multiple “docs-first” files:
- `INDEX.md` — documentation map / start-here
- `QUICK_START.md` — minimal quick start steps
- `LOCAL_SETUP.md` — detailed local setup
- `DATABASE_SCHEMA_COMPLETE.sql` — ready-to-run schema
- `DATABASE_SCHEMA_DETAILED.md` — deep schema documentation
- `AUDIT_REPORT.md` — verification across frontend/backend/db
- `COMPLETE_VERIFICATION_SUMMARY.md` — executive summary

---

## ▶️ Quick Start (Recommended)
Follow the official repo docs in this order:
1. Read: `QUICK_START.md`
2. If you get stuck: `LOCAL_SETUP.md`
3. For understanding DB: `DATABASE_SCHEMA_DETAILED.md`

---

## 🗄️ Database Setup (Summary)
This project expects a local PostgreSQL database.

Typical steps (exact commands are in `LOCAL_SETUP.md`):
- Create a PostgreSQL database
- Run the schema file: `DATABASE_SCHEMA_COMPLETE.sql`
- Set your connection string in `.env.local` (or equivalent)

---

## 🧪 Verification / Audit
This repository includes a full verification trail:
- Schema completeness
- Endpoint checks
- Frontend ↔ backend ↔ database alignment

Start with `COMPLETE_VERIFICATION_SUMMARY.md` for a top-level view.

---

## 📚 Documentation Index
If you want the fastest “where do I look?” map:
- Read `INDEX.md` (it links everything)

---

## 🤝 Contributing
- Open issues for bugs / missing docs / setup friction
- PRs welcome (especially improving environment setup and deployment scripts)

---

## 📄 License
Add a `LICENSE` file if you want to define usage terms.
