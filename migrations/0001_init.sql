-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (for Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email varchar UNIQUE NOT NULL,
  password varchar NOT NULL,
  first_name varchar,
  last_name varchar,
  is_admin boolean DEFAULT false NOT NULL,
  login_url text,
  draws integer,
  goals_scored integer,
  goals_conceded integer,
  wins integer,
  tier varchar(20),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Turfs table
CREATE TABLE IF NOT EXISTS turfs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  description text,
  location text NOT NULL,
  address text NOT NULL,
  turf_type varchar(50) NOT NULL,
  price_per_hour numeric(10,2) NOT NULL,
  image_url text,
  owner_id varchar,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS turfs_owner_id_idx ON turfs(owner_id);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id varchar NOT NULL REFERENCES users(id),
  turf_id varchar NOT NULL REFERENCES turfs(id),
  booking_date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  status varchar(20) DEFAULT '0',
  total_price numeric(10,2) NOT NULL,
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_turf_id_idx ON bookings(turf_id);
CREATE INDEX IF NOT EXISTS bookings_booking_date_idx ON bookings(booking_date);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  description text,
  organizer_id varchar REFERENCES users(id),
  location text,
  turf_type varchar(50),
  start_date date,
  end_date date,
  registration_deadline date,
  max_teams integer,
  prize_info text,
  entry_fee numeric(10,2),
  image_url text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS teams_organizer_id_idx ON teams(organizer_id);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_id varchar NOT NULL REFERENCES teams(id),
  user_id varchar NOT NULL REFERENCES users(id),
  position varchar(50),
  joined_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tournament_registrations text,
  team_id varchar REFERENCES teams(id),
  registered_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS tournaments_team_id_idx ON tournaments(team_id);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id varchar REFERENCES bookings(id),
  team_a_id varchar REFERENCES teams(id),
  team_b_id varchar REFERENCES teams(id),
  match_date date NOT NULL,
  match_time text,
  team_a_score integer,
  team_b_score integer,
  status varchar(20) DEFAULT '0',
  winner_id varchar REFERENCES users(id),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS matches_booking_id_idx ON matches(booking_id);
CREATE INDEX IF NOT EXISTS matches_team_a_id_idx ON matches(team_a_id);
CREATE INDEX IF NOT EXISTS matches_team_b_id_idx ON matches(team_b_id);
CREATE INDEX IF NOT EXISTS matches_match_date_idx ON matches(match_date);
