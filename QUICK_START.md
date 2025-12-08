# LOCAL SETUP QUICK REFERENCE

## Quick Start (Windows PowerShell)

### 1. Create Database
```powershell
psql -U postgres -c "CREATE DATABASE turf_max;"
```

### 2. Load Schema
```powershell
psql -U postgres -d turf_max -f "c:\Users\dumbutthehe\Desktop\turf max\Turf\DATABASE_SCHEMA_COMPLETE.sql"
```

### 3. Setup .env.local
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/turf_max
NODE_ENV=development
PORT=5000
REPLIT_AUTH_URL=http://localhost:5000/api/auth
```

### 4. Install & Run
```powershell
cd "c:\Users\dumbutthehe\Desktop\turf max\Turf"
npm install
npm run dev
```

## All Database Entities (Ready to Use)

✅ **users** - User profiles with admin flag
✅ **turfs** - Football fields (5-a-side, 7-a-side, 11-a-side)
✅ **teams** - Team records with ELO ratings (1200-1600 range)
✅ **bookings** - Time slot reservations for turfs
✅ **matches** - Head-to-head games with scoring
✅ **tournaments** - Multi-team competitive events
✅ **team_members** - Team membership tracking
✅ **match_invitations** - Team-to-team challenge requests
✅ **sessions** - Authentication sessions (Replit Auth)

## What Frontend Requests (All Supported)

✅ GET /api/turfs → lists all turfs
✅ GET /api/turfs/:id → specific turf details
✅ POST /api/turfs → create turf (admin only)
✅ GET /api/teams → all teams with rankings
✅ POST /api/teams → create new team (authenticated)
✅ GET /api/teams/my → user's teams
✅ GET /api/matchmaking/suggestions/:teamId → AI-matched opponents
✅ GET /api/bookings → user's bookings
✅ POST /api/bookings → create booking (with conflict checking)
✅ GET /api/matches → all matches
✅ PATCH /api/matches/:id → update score & auto-update ELO
✅ GET /api/tournaments → tournament listings
✅ GET /api/match-invitations → pending invites
✅ POST /api/match-invitations → send match invite
✅ GET /api/admin/turfs → admin dashboard data
✅ GET /api/admin/bookings → admin booking management

## Schema Verified ✓

Every field the frontend requests exists in the database:
- Turf browsing filters (name, location, turfType, pricePerHour)
- Team stats (eloRating, tier, wins, losses, goalsScored)
- Booking management (bookingDate, startTime, endTime, status)
- Match calculations (teamAScore, teamBScore, winnerId)
- Tournament data (startDate, endDate, registrationDeadline, entryFee)

## No Errors Expected

✓ No missing tables
✓ No unknown fields requested
✓ No type mismatches
✓ No relationship issues
✓ All foreign keys properly defined
✓ Cascade deletes configured
✓ Indexes for performance
✓ Default values set correctly

Ready to run locally without any data errors!
