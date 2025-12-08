# LOCAL SETUP GUIDE - COMPLETE WALKTHROUGH

## Prerequisites

- PostgreSQL 12+ installed locally
- Node.js 18+ installed
- psql command-line tool available
- PowerShell or Command Prompt

## Step-by-Step Setup

### STEP 1: Install PostgreSQL (if not already installed)

Download from: https://www.postgresql.org/download/windows/

During installation, remember the superuser password you set for the `postgres` user.

### STEP 2: Verify PostgreSQL Installation

Open PowerShell and run:

```powershell
psql --version
```

Expected output: `psql (PostgreSQL) 12.x` or higher

### STEP 3: Create Local Database

```powershell
# Connect to PostgreSQL with default superuser
psql -U postgres

# At the prompt, create the database
CREATE DATABASE turf_max;

# Exit psql
\q
```

Or in one command:

```powershell
psql -U postgres -c "CREATE DATABASE turf_max;"
```

### STEP 4: Load Database Schema

Copy the full path to your schema file. Navigate to your project:

```powershell
cd "c:\Users\dumbutthehe\Desktop\turf max\Turf"
```

Load the schema into your local database:

```powershell
psql -U postgres -d turf_max -f DATABASE_SCHEMA_COMPLETE.sql
```

Expected output:
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
...
```

### STEP 5: Verify Schema Installation

```powershell
# Connect to your local database
psql -U postgres -d turf_max

# List all tables
\dt

# Expected tables:
# - bookings
# - match_invitations
# - matches
# - sessions
# - team_members
# - teams
# - tournaments
# - tournament_registrations
# - turfs
# - users

# Exit psql
\q
```

### STEP 6: Setup Environment Variables

In your project root (`c:\Users\dumbutthehe\Desktop\turf max\Turf`), create a file named `.env.local`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/turf_max
NODE_ENV=development
PORT=5000
REPLIT_AUTH_URL=http://localhost:5000/api/auth
```

**Replace `your_password` with the PostgreSQL superuser password you set during installation.**

### STEP 7: Install Dependencies

```powershell
cd "c:\Users\dumbutthehe\Desktop\turf max\Turf"
npm install
```

This will install all required packages from `package.json`.

### STEP 8: (Optional) Run Drizzle Migrations

If you want to use Drizzle kit for migrations:

```powershell
npm run db:push
```

This will synchronize any pending migrations from the drizzle config.

### STEP 9: Start Development Server

```powershell
npm run dev
```

Expected output:
```
[timestamp] [express] serving on port 5000
```

### STEP 10: Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

---

## Testing the Setup

### Test 1: Verify Database Connection

Run this in PowerShell:

```powershell
psql -U postgres -d turf_max -c "SELECT COUNT(*) FROM users;"
```

Expected output: Should return a count (likely 0 initially)

### Test 2: Add Test Data (Optional)

```powershell
psql -U postgres -d turf_max
```

Then paste this SQL:

```sql
-- Insert test admin user
INSERT INTO users (id, email, first_name, last_name, is_admin) 
VALUES ('admin-user-1', 'admin@local.test', 'Admin', 'User', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert test regular user
INSERT INTO users (id, email, first_name, last_name, is_admin) 
VALUES ('user-1', 'john@local.test', 'John', 'Doe', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert test turf
INSERT INTO turfs (id, name, location, address, turf_type, price_per_hour, owner_id, is_active)
VALUES ('turf-1', 'Downtown 5-a-side', 'Downtown', '123 Main St', '5-a-side', 50.00, 'admin-user-1', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert test team
INSERT INTO teams (id, name, captain_id, location, preferred_turf_type)
VALUES ('team-1', 'City United', 'user-1', 'Downtown', '5-a-side')
ON CONFLICT (id) DO NOTHING;

-- Verify insertions
SELECT * FROM users;
SELECT * FROM turfs;
SELECT * FROM teams;
```

Then exit:

```powershell
\q
```

### Test 3: Test API Endpoints

Once the server is running (`npm run dev`), test these in your browser:

```
http://localhost:5000/api/turfs
http://localhost:5000/api/teams
http://localhost:5000/api/tournaments
http://localhost:5000/api/matches
```

Expected: JSON arrays returned (may be empty or with test data)

---

## Troubleshooting

### Error: "psql: command not found"

**Solution**: PostgreSQL is not in your PATH. Either:
1. Add PostgreSQL bin folder to PATH: `C:\Program Files\PostgreSQL\15\bin`
2. Or use full path: `"C:\Program Files\PostgreSQL\15\bin\psql"`

### Error: "FATAL: password authentication failed"

**Solution**: Wrong PostgreSQL password. Use:
```powershell
psql -U postgres  # Will prompt for password
```

Or verify password and update `.env.local`

### Error: "database 'turf_max' does not exist"

**Solution**: Database wasn't created. Run:
```powershell
psql -U postgres -c "CREATE DATABASE turf_max;"
```

### Error: "relation 'turfs' does not exist"

**Solution**: Schema not loaded. Run:
```powershell
psql -U postgres -d turf_max -f DATABASE_SCHEMA_COMPLETE.sql
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Solution**: PostgreSQL service not running. Start it:
```powershell
# On Windows, PostgreSQL should start automatically
# If not, restart the PostgreSQL service:
net start PostgreSQL
# Or use Services app
```

### Error: "npm: command not found"

**Solution**: Node.js not installed or not in PATH. Download from: https://nodejs.org/

### Error: Port 5000 already in use

**Solution**: Change PORT in `.env.local`:
```env
PORT=5001
```

Then access at: `http://localhost:5001`

---

## Database Cleanup

To reset your local database:

```powershell
# Drop the database
psql -U postgres -c "DROP DATABASE turf_max;"

# Recreate it
psql -U postgres -c "CREATE DATABASE turf_max;"

# Reload schema
psql -U postgres -d turf_max -f DATABASE_SCHEMA_COMPLETE.sql
```

---

## All Entities Ready to Use

After successful setup, these are fully populated:

✅ **users** table - No data initially (unless you add test data)
✅ **turfs** table - Ready for data entry (admin only)
✅ **teams** table - Ready for user teams
✅ **bookings** table - Ready for reservations
✅ **matches** table - Ready for games
✅ **tournaments** table - Ready for events
✅ **team_members** table - Ready for memberships
✅ **match_invitations** table - Ready for challenges
✅ **sessions** table - Used by Replit Auth

---

## Frontend Features Available

After completing setup, all features should work:

✅ Browse Turfs (lists from `turfs` table)
✅ Turf Booking (creates in `bookings` table)
✅ Browse Teams (lists from `teams` table)
✅ Create Teams (inserts into `teams` table)
✅ Team Rankings (reads `teams` table sorted by ELO)
✅ Matchmaking (queries `teams` table with filters)
✅ Tournaments (reads from `tournaments` table)
✅ Match Invitations (CRUD on `match_invitations`)
✅ Admin Dashboard (views all data)

---

## Environment Variables Reference

```env
# Database Connection (REQUIRED)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Examples:
# Local: postgresql://postgres:password@localhost:5432/turf_max
# Remote: postgresql://user:pass@db.example.com:5432/turf_max

# Node Environment
NODE_ENV=development  # or production

# Server Port
PORT=5000

# Auth Settings (if using Replit Auth)
REPLIT_AUTH_URL=http://localhost:5000/api/auth
```

---

## Verification Checklist

Before considering setup complete, verify:

- [ ] PostgreSQL installed and running
- [ ] `turf_max` database created
- [ ] Schema loaded (10 tables visible)
- [ ] `.env.local` created with DATABASE_URL
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts server on port 5000
- [ ] Browser shows landing page at localhost:5000
- [ ] `/api/turfs` endpoint returns JSON
- [ ] No database connection errors in console

---

## Next Steps After Setup

1. **Add Test Data** (optional): Follow "Test 2" above
2. **Test All Features**: Create teams, book turfs, etc.
3. **Check Admin Panel**: Verify all data visible at `/admin`
4. **Run Tests**: If test suite exists, run `npm test`
5. **Deploy**: Follow production setup when ready

---

## Support Files Created

You now have these reference files:

- `DATABASE_SCHEMA_COMPLETE.sql` - Complete schema to load
- `AUDIT_REPORT.md` - Complete analysis
- `DATABASE_SCHEMA_DETAILED.md` - Detailed table documentation
- `QUICK_START.md` - Quick reference
- `LOCAL_SETUP.md` - This file

All files are in: `c:\Users\dumbutthehe\Desktop\turf max\Turf\`

---

## You're All Set! 🚀

Your local environment is ready to use. No data inconsistencies, all entities defined, and all frontend requests supported by the database schema.

Happy coding!
