# Local Database ERD Snapshot
**Date**: December 9, 2025  
**Purpose**: Backup of the local database schema before Railway and Vercel deployment

## Tables Overview

### Core Tables
- **public** (turfs, sessions, users, teams, tournaments, bookings, matches, team_members)

### Table Details

#### turfs
- id (character varying)
- name (text)
- description (text)
- location (text)
- address (text)
- turf_type (character varying(50))
- price_per_hour (numeric(10,2))
- image_url (text)
- owner_id (character varying)
- is_active (boolean)
- created_at (timestamp with out time zone)
- updated_at (timestamp with out time zone)

#### bookings
- id (character varying)
- user_id (character varying)
- turf_id (character varying)
- booking_date (date)
- start_time (text)
- end_time (text)
- status (character varying(2), 0)
- total_price (numeric(10,2))
- notes (text)
- created_at (timestamp with out time zone)
- updated_at (timestamp with out time zone)

#### sessions
- sid (character varying)
- id (character varying)
- email (character varying)
- engine (timestamp without time zone)
- message (text)
- created_at (timestamp with out time zone)
- updated_at (timestamp with out time zone)

#### users
- id (character varying)
- email (character varying)
- password (character varying)
- first_name (character varying)
- last_name (character varying)
- is_admin (boolean)
- created_at (timestamp with out time zone)
- updated_at (timestamp with out time zone)
- login_url (text)
- draws (integer)
- goals_scored (integer)
- goals_conceded (integer)
- wins (integer)
- tier (character varying(20))

#### teams
- id (character varying)
- name (text)
- description (text)
- organize_id (character varying)
- location (text)
- turf_type (character varying(50))
- start_date (date)
- end_date (date)
- registration_deadline (date)
- max_teams (integer)
- prize_info (text)
- entry_fee (numeric(10,2))
- image_url (text)
- created_at (timestamp with out time zone)
- updated_at (timestamp with out time zone)

#### tournaments
- id (character varying)
- tournament_registrations (text)
- tournament_id (character varying)
- team_id (character varying)
- registered_at (timestamp without time zone)

#### matches
- id (character varying)
- booking_id (character varying)
- team_a_id (character varying)
- team_b_id (character varying)
- match_date (date)
- match_time (text)
- team_a_score (integer)
- team_b_score (integer)
- status (character varying(2), 0)
- winner_id (character varying)
- created_at (timestamp with out time zone)
- updated_at (timestamp with out time zone)

#### team_members
- id (character varying)
- team_id (character varying)
- user_id (character varying)
- position (character varying(50))
- joined_at (timestamp without time zone)

## Relationships
- turfs ← bookings (turf_id references turfs.id)
- users ← bookings (user_id references users.id)
- teams ← team_members (team_id references teams.id)
- users ← team_members (user_id references users.id)
- teams ← tournaments (team_id references teams.id)
- bookings ← matches (booking_id references bookings.id)
- matches → team_a_id, team_b_id (references teams.id)
- matches → winner_id (references users.id)

## Important Notes for Deployment
1. This schema is running locally and verified working
2. Ensure all tables and relationships are replicated in Railway PostgreSQL
3. Environment variables for Railway connection need to be configured
4. Session management may need adjustment for Vercel deployment
5. File storage (image_url fields) needs to be configured (consider using Vercel Blob or similar)
6. Email configuration for sessions needs to work with production environment

## Next Steps
1. ✅ Local database verified and working
2. ⏳ Set up Railway PostgreSQL with this schema
3. ⏳ Configure environment variables
4. ⏳ Deploy backend to Vercel
5. ⏳ Deploy frontend to Vercel
6. ⏳ Test all endpoints in production
