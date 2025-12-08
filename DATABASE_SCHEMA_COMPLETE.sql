-- =====================================================
-- TURF MAX DATABASE SCHEMA - COMPLETE SETUP
-- =====================================================
-- This SQL file creates all necessary tables for the Turf Max application
-- Run this file against your local PostgreSQL database to set up the schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SESSIONS TABLE (Required for Replit Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- =====================================================
-- USERS TABLE (Required for Replit Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TURFS TABLE (Football Fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS turfs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  turf_type VARCHAR(50) NOT NULL, -- '5-a-side', '7-a-side', '11-a-side'
  price_per_hour DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  owner_id VARCHAR NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_turfs_owner_id" ON turfs(owner_id);
CREATE INDEX IF NOT EXISTS "idx_turfs_is_active" ON turfs(is_active);

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  captain_id VARCHAR NOT NULL REFERENCES users(id),
  location TEXT NOT NULL,
  preferred_turf_type VARCHAR(50), -- '5-a-side', '7-a-side', '11-a-side'
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  tier VARCHAR(20) NOT NULL DEFAULT 'Bronze', -- Bronze, Silver, Gold, Platinum
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_conceded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_teams_captain_id" ON teams(captain_id);
CREATE INDEX IF NOT EXISTS "idx_teams_elo_rating" ON teams(elo_rating DESC);

-- =====================================================
-- TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(50),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_team_members_team_id" ON team_members(team_id);
CREATE INDEX IF NOT EXISTS "idx_team_members_user_id" ON team_members(user_id);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  turf_id VARCHAR NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  team_id VARCHAR REFERENCES teams(id),
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL, -- HH:MM format
  end_time TEXT NOT NULL, -- HH:MM format
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_bookings_turf_id" ON bookings(turf_id);
CREATE INDEX IF NOT EXISTS "idx_bookings_user_id" ON bookings(user_id);
CREATE INDEX IF NOT EXISTS "idx_bookings_team_id" ON bookings(team_id);
CREATE INDEX IF NOT EXISTS "idx_bookings_booking_date" ON bookings(booking_date);

-- =====================================================
-- MATCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_a_id VARCHAR NOT NULL REFERENCES teams(id),
  team_b_id VARCHAR NOT NULL REFERENCES teams(id),
  booking_id VARCHAR REFERENCES bookings(id),
  turf_id VARCHAR NOT NULL REFERENCES turfs(id),
  match_date DATE NOT NULL,
  match_time TEXT NOT NULL,
  team_a_score INTEGER,
  team_b_score INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  winner_id VARCHAR REFERENCES teams(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_matches_team_a_id" ON matches(team_a_id);
CREATE INDEX IF NOT EXISTS "idx_matches_team_b_id" ON matches(team_b_id);
CREATE INDEX IF NOT EXISTS "idx_matches_turf_id" ON matches(turf_id);
CREATE INDEX IF NOT EXISTS "idx_matches_match_date" ON matches(match_date);
CREATE INDEX IF NOT EXISTS "idx_matches_status" ON matches(status);

-- =====================================================
-- TOURNAMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  organizer_id VARCHAR NOT NULL REFERENCES users(id),
  location TEXT NOT NULL,
  turf_type VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE NOT NULL,
  max_teams INTEGER NOT NULL,
  prize_info TEXT,
  entry_fee DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_tournaments_organizer_id" ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS "idx_tournaments_status" ON tournaments(status);
CREATE INDEX IF NOT EXISTS "idx_tournaments_start_date" ON tournaments(start_date);

-- =====================================================
-- TOURNAMENT REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tournament_id VARCHAR NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  registered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_tournament_registrations_tournament_id" ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS "idx_tournament_registrations_team_id" ON tournament_registrations(team_id);

-- =====================================================
-- MATCH INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS match_invitations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_team_id VARCHAR NOT NULL REFERENCES teams(id),
  to_team_id VARCHAR NOT NULL REFERENCES teams(id),
  preferred_date DATE,
  preferred_time TEXT,
  turf_id VARCHAR REFERENCES turfs(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_match_invitations_from_team_id" ON match_invitations(from_team_id);
CREATE INDEX IF NOT EXISTS "idx_match_invitations_to_team_id" ON match_invitations(to_team_id);
CREATE INDEX IF NOT EXISTS "idx_match_invitations_status" ON match_invitations(status);

-- =====================================================
-- SEED DATA (OPTIONAL - For Testing)
-- =====================================================
-- Uncomment below to add sample data for local testing

/*
-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, is_admin) VALUES
  ('user1', 'admin@example.com', 'Admin', 'User', TRUE),
  ('user2', 'john@example.com', 'John', 'Doe', FALSE),
  ('user3', 'jane@example.com', 'Jane', 'Smith', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample turfs
INSERT INTO turfs (id, name, location, address, turf_type, price_per_hour, owner_id, is_active) VALUES
  ('turf1', 'Downtown 5-a-side', 'Downtown', '123 Main St', '5-a-side', 50.00, 'user1', TRUE),
  ('turf2', 'Uptown 7-a-side', 'Uptown', '456 Oak Ave', '7-a-side', 75.00, 'user1', TRUE),
  ('turf3', 'Westside 11-a-side', 'Westside', '789 Pine Rd', '11-a-side', 100.00, 'user1', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample teams
INSERT INTO teams (id, name, captain_id, location, preferred_turf_type, elo_rating, tier) VALUES
  ('team1', 'City United', 'user2', 'Downtown', '5-a-side', 1200, 'Silver'),
  ('team2', 'Uptown Hawks', 'user3', 'Uptown', '7-a-side', 1350, 'Gold')
ON CONFLICT (id) DO NOTHING;
*/
