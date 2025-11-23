# Local Database Setup Guide

## Prerequisites
- PostgreSQL installed locally ([Download](https://www.postgresql.org/download/))
- PostgreSQL running on your machine

## Step 1: Create a Local Database

Open your PostgreSQL command line (psql) or use pgAdmin, then run:

```sql
-- Create the database
CREATE DATABASE football_turf_local;

-- Connect to the new database
\c football_turf_local
```

## Step 2: Set Environment Variable

Create or update your `.env.local` file in the root directory:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/football_turf_local
SESSION_SECRET=your-secret-key-here-change-this-to-something-random
REPL_ID=your-replit-id
ISSUER_URL=https://replit.com/oidc
```

Replace:
- `your_password` with your PostgreSQL password
- `your-secret-key-here` with a random string
- Other values based on your Replit setup (if using Replit Auth)

## Step 3: Create All Tables

Run this command in your project root:

```bash
npm run db:push
```

This will automatically create all tables from your Drizzle schema.

## Complete SQL Schema (Alternative Manual Setup)

If you prefer to run SQL manually, execute this in your PostgreSQL:

```sql
-- Create sessions table (required for Replit Auth)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IDX_session_expire ON sessions(expire);

-- Create users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create turfs table
CREATE TABLE turfs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  turf_type VARCHAR(50) NOT NULL,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  owner_id VARCHAR NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create teams table
CREATE TABLE teams (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  captain_id VARCHAR NOT NULL REFERENCES users(id),
  location TEXT NOT NULL,
  preferred_turf_type VARCHAR(50),
  logo_url TEXT,
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  tier VARCHAR(20) NOT NULL DEFAULT 'Bronze',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_conceded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(50),
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id VARCHAR NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  team_id VARCHAR REFERENCES teams(id),
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id VARCHAR NOT NULL REFERENCES teams(id),
  team_b_id VARCHAR NOT NULL REFERENCES teams(id),
  booking_id VARCHAR REFERENCES bookings(id),
  turf_id VARCHAR NOT NULL REFERENCES turfs(id),
  match_date DATE NOT NULL,
  match_time TEXT NOT NULL,
  team_a_score INTEGER,
  team_b_score INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  winner_id VARCHAR REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE tournaments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tournament_registrations table
CREATE TABLE tournament_registrations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id VARCHAR NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT NOW()
);

-- Create match_invitations table
CREATE TABLE match_invitations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  from_team_id VARCHAR NOT NULL REFERENCES teams(id),
  to_team_id VARCHAR NOT NULL REFERENCES teams(id),
  preferred_date DATE,
  preferred_time TEXT,
  turf_id VARCHAR REFERENCES turfs(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Step 4: Verify Tables Were Created

Run this query to see all tables:

```sql
\dt
```

You should see all 10 tables:
- sessions
- users
- turfs
- teams
- team_members
- bookings
- matches
- tournaments
- tournament_registrations
- match_invitations

## Step 5: Run Your App

```bash
npm install
npm run dev
```

Your app will now connect to the local database!

## Troubleshooting

### Connection Error: "connect ECONNREFUSED"
- Make sure PostgreSQL is running on your machine
- Verify the DATABASE_URL is correct
- Check username/password

### Error: "FATAL: role "postgres" does not exist"
- Use the correct PostgreSQL user (may not be `postgres`)
- Run `psql -U <username>` to find yours

### Port Already in Use
- Change the port in DATABASE_URL from 5432 to another port
- Or stop the other service using port 5432

---

## Quick Start (Using npm run db:push)

The easiest way is to just:

1. Update `.env.local` with your local PostgreSQL connection string
2. Run: `npm run db:push`
3. Run: `npm run dev`

Done! All tables will be created automatically.
