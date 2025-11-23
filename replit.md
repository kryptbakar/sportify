# TurfBook - Football Turf Booking & Matchmaking Platform

## Overview

TurfBook is a full-stack web application for booking football turfs, team matchmaking, tournament management, and competitive rankings. The platform serves two user types: regular users who book turfs and manage teams, and admin users who manage turf facilities. The system implements intelligent matchmaking using ELO-based ranking, prevents booking conflicts through interval scheduling algorithms, and maintains a dynamic tournament and ranking system with a football-themed UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router dependency)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS with custom football-themed design tokens
- CSS variables for theming (light mode focused with primary green colors)
- Custom fonts: Inter (body), Bebas Neue (display/headlines), Roboto Mono (stats/times)

**State Management Strategy**
- Server state: TanStack Query with infinite stale time (manual invalidation)
- Form state: React Hook Form with Zod validation
- Authentication state: Query-based with session cookies
- Local UI state: React useState/useContext as needed

**Design System**
- Football-themed color palette (greens, whites, pitch patterns)
- Sports-inspired typography hierarchy (scoreboard fonts, athletic emphasis)
- Card-based layouts inspired by ESPN, FotMob, FIFA digital experiences
- Responsive grid system: 3-4 columns desktop, 2 tablet, 1 mobile

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Session-based authentication using Replit Auth (OpenID Connect)
- PostgreSQL sessions stored in database via connect-pg-simple
- Development mode: Vite middleware integration for HMR
- Production mode: Static file serving from dist/public

**API Design Pattern**
- RESTful endpoints organized by resource (/api/turfs, /api/teams, etc.)
- Authenticated routes protected by isAuthenticated middleware
- Request/response handled through custom apiRequest wrapper
- Error handling with appropriate HTTP status codes
- JSON request/response bodies with Zod validation

**Authentication & Authorization**
- Replit Auth (OpenID Connect) for user authentication
- Session-based auth with PostgreSQL session store (7-day TTL)
- User roles: regular users and admin users (isAdmin flag)
- Admin-only routes protected by role checks
- Automatic session refresh with token management

### Data Storage

**Database System**
- PostgreSQL via Neon serverless (@neondatabase/serverless)
- Connection pooling with neon-config and WebSocket support
- Schema managed in shared/schema.ts for client/server sharing

**ORM & Schema Management**
- Drizzle ORM for type-safe database queries
- Drizzle Kit for migrations (migrations/ directory)
- Zod schemas generated from Drizzle schemas (drizzle-zod)
- Schema-driven validation for API inputs

**Data Models**
- Users: Authentication, profile, admin flag
- Turfs: Football field details, pricing, location, type, availability
- Teams: Captain, members, ELO rating, location, preferences
- Bookings: Turf reservations with time slots, conflict prevention
- Matches: Team vs team games with scores and ELO updates
- Tournaments: Competition management with registrations
- Match Invitations: Team-to-team challenge system

**Key Algorithms**
- Booking conflict detection: Interval scheduling algorithm checking time slot overlaps
- Matchmaking: Weighted scoring based on ELO similarity, location, turf type preference
- ELO rating system: Dynamic team ranking calculation (K-factor 32)
- Tier system: Platinum (1600+), Gold (1400+), Silver (1200+), Bronze (<1200)

### External Dependencies

**Third-Party Services**
- Replit Auth: OpenID Connect authentication provider (issuer: replit.com/oidc)
- Neon Database: Serverless PostgreSQL hosting
- Google Fonts: Inter, Bebas Neue, Roboto Mono font families

**Development Tools**
- Replit-specific plugins: Cartographer, Dev Banner, Runtime Error Modal
- ESBuild for production server bundling
- TypeScript compiler with strict mode enabled

**UI Component Libraries**
- Radix UI: Headless component primitives (dialogs, dropdowns, etc.)
- cmdk: Command palette component
- date-fns: Date manipulation utilities
- lucide-react: Icon library
- react-day-picker: Calendar component
- vaul: Drawer component (mobile)

**Key Configuration Decisions**
- Module system: ESNext with bundler resolution
- Path aliases: @ for client/src, @shared for shared code, @assets for static files
- TypeScript strict mode for maximum type safety
- CSS variables for theming instead of hardcoded colors
- Session secret required via environment variable
- Database URL required via environment variable (DATABASE_URL)