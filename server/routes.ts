import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { login, signUp, getCurrentUser, logout } from "./auth";
import { insertTurfSchema, insertTeamSchema, insertBookingSchema, insertMatchSchema, insertTournamentSchema, insertMatchInvitationSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.replace("Bearer ", "");
  try {
    const user = jwt.verify(token, process.env.SESSION_SECRET || "local-dev-secret-key");
    // @ts-ignore
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // No session middleware needed for JWT

  // Auth routes
  app.post('/api/auth/signup', signUp);
  app.post('/api/auth/login', login);
  app.get('/api/auth/user', getCurrentUser);
  app.get('/api/auth/logout', logout);

  // Turf routes
  app.get('/api/turfs', async (_req, res) => {
    try {
      const turfs = await storage.getTurfs();
      res.json(turfs);
    } catch (error) {
      console.error("Error fetching turfs:", error);
      res.status(500).json({ message: "Failed to fetch turfs" });
    }
  });

  app.get('/api/turfs/:id', async (req, res) => {
    try {
      const turf = await storage.getTurf(req.params.id);
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      res.json(turf);
    } catch (error) {
      console.error("Error fetching turf:", error);
      res.status(500).json({ message: "Failed to fetch turf" });
    }
  });

  app.get('/api/turfs/:id/bookings', async (req, res) => {
    try {
      const bookings = await storage.getBookingsByTurf(req.params.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/turfs', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const validated = insertTurfSchema.parse({ ...req.body, ownerId: userId });
      const turf = await storage.createTurf(validated);
      res.status(201).json(turf);
    } catch (error: any) {
      console.error("Error creating turf:", error);
      res.status(400).json({ message: error.message || "Failed to create turf" });
    }
  });

  // Team routes
  app.get('/api/teams', async (_req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/rankings', async (_req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ message: "Failed to fetch rankings" });
    }
  });

  app.get('/api/teams/my', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const teams = await storage.getTeamsByCaptain(userId);
      console.log(`[DEBUG] /api/teams/my for userId: ${userId}, result:`, teams);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/:id', async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post('/api/teams', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertTeamSchema.parse({ ...req.body, captainId: userId });
      const team = await storage.createTeam(validated);
      res.status(201).json(team);
    } catch (error: any) {
      console.error("Error creating team:", error);
      res.status(400).json({ message: error.message || "Failed to create team" });
    }
  });

  // Matchmaking routes
  app.get('/api/matchmaking/suggestions/:teamId', async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const myTeam = await storage.getTeam(teamId);
      
      if (!myTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      const allTeams = await storage.getTeams();
      
      // Filter out own team and calculate match scores
      const suggestions = allTeams
        .filter(t => t.id !== teamId)
        .map(team => {
          // Calculate matchmaking score based on ELO difference
          const eloDiff = Math.abs(myTeam.eloRating - team.eloRating);
          const eloScore = Math.max(0, 100 - eloDiff / 10);
          
          // Location match (simple check)
          const locationScore = myTeam.location === team.location ? 50 : 0;
          
          // Turf type preference match
          const turfScore = myTeam.preferredTurfType === team.preferredTurfType ? 30 : 0;
          
          const totalScore = eloScore + locationScore + turfScore;
          
          return { team, score: totalScore };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6) // Top 6 suggestions
        .map(item => item.team);

      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching matchmaking suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // Match invitation routes
  app.get('/api/match-invitations', async (_req, res) => {
    try {
      const invitations = await storage.getMatchInvitations();
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.post('/api/match-invitations', requireAuth, async (req, res) => {
    try {
      const validated = insertMatchInvitationSchema.parse(req.body);
      const invitation = await storage.createMatchInvitation(validated);
      res.status(201).json(invitation);
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      res.status(400).json({ message: error.message || "Failed to create invitation" });
    }
  });

  // Booking routes
  app.get('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByUser(userId);
      console.log(`[DEBUG] /api/bookings for userId: ${userId}, result:`, bookings);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Check for overlapping bookings
      const turfBookings = await storage.getBookingsByTurf(req.body.turfId);
      const newStart = req.body.startTime;
      const newEnd = req.body.endTime;
      const newDate = req.body.bookingDate;
      const hasConflict = turfBookings.some(booking => {
        if (booking.bookingDate !== newDate || booking.status === 'cancelled') {
          return false;
        }
        const existingStart = booking.startTime;
        const existingEnd = booking.endTime;
        // Check overlap
        return (newStart < existingEnd && newEnd > existingStart);
      });
      if (hasConflict) {
        return res.status(409).json({ message: "Time slot already booked" });
      }
      const validated = insertBookingSchema.parse({ ...req.body, userId });
      const booking = await storage.createBooking(validated);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  // Match routes
  app.get('/api/matches', async (_req, res) => {
    try {
      const matches = await storage.getMatches();
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post('/api/matches', async (req, res) => {
    try {
      const validated = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validated);
      res.status(201).json(match);
    } catch (error: any) {
      console.error("Error creating match:", error);
      res.status(400).json({ message: error.message || "Failed to create match" });
    }
  });

  app.patch('/api/matches/:id', async (req, res) => {
    try {
      const match = await storage.updateMatch(req.params.id, req.body);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // If match is completed, update ELO ratings
      if (req.body.status === 'completed' && match.teamAScore !== null && match.teamBScore !== null) {
        const teamA = await storage.getTeam(match.teamAId);
        const teamB = await storage.getTeam(match.teamBId);

        if (teamA && teamB) {
          // Calculate new ELO ratings
          const kFactor = 32;
          const expectedA = 1 / (1 + Math.pow(10, (teamB.eloRating - teamA.eloRating) / 400));
          const expectedB = 1 / (1 + Math.pow(10, (teamA.eloRating - teamB.eloRating) / 400));

          let scoreA, scoreB;
          if (match.teamAScore > match.teamBScore) {
            scoreA = 1;
            scoreB = 0;
          } else if (match.teamAScore < match.teamBScore) {
            scoreA = 0;
            scoreB = 1;
          } else {
            scoreA = 0.5;
            scoreB = 0.5;
          }

          const newEloA = Math.round(teamA.eloRating + kFactor * (scoreA - expectedA));
          const newEloB = Math.round(teamB.eloRating + kFactor * (scoreB - expectedB));

          // Determine tier based on ELO
          const getTier = (elo: number) => {
            if (elo >= 1600) return 'Platinum';
            if (elo >= 1400) return 'Gold';
            if (elo >= 1200) return 'Silver';
            return 'Bronze';
          };

          // Update team A
          await storage.updateTeam(teamA.id, {
            eloRating: newEloA,
            tier: getTier(newEloA),
            wins: teamA.wins + (scoreA === 1 ? 1 : 0),
            losses: teamA.losses + (scoreA === 0 ? 1 : 0),
            draws: teamA.draws + (scoreA === 0.5 ? 1 : 0),
            goalsScored: teamA.goalsScored + match.teamAScore,
            goalsConceded: teamA.goalsConceded + match.teamBScore,
          });

          // Update team B
          await storage.updateTeam(teamB.id, {
            eloRating: newEloB,
            tier: getTier(newEloB),
            wins: teamB.wins + (scoreB === 1 ? 1 : 0),
            losses: teamB.losses + (scoreB === 0 ? 1 : 0),
            draws: teamB.draws + (scoreB === 0.5 ? 1 : 0),
            goalsScored: teamB.goalsScored + match.teamBScore,
            goalsConceded: teamB.goalsConceded + match.teamAScore,
          });
        }
      }

      res.json(match);
    } catch (error: any) {
      console.error("Error updating match:", error);
      res.status(400).json({ message: error.message || "Failed to update match" });
    }
  });

  // Tournament routes
  app.get('/api/tournaments', async (_req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.get('/api/tournaments/:id', async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  app.post('/api/tournaments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertTournamentSchema.parse({ ...req.body, organizerId: userId });
      const tournament = await storage.createTournament(validated);
      res.status(201).json(tournament);
    } catch (error: any) {
      console.error("Error creating tournament:", error);
      res.status(400).json({ message: error.message || "Failed to create tournament" });
    }
  });

  // Admin routes
  app.get('/api/admin/turfs', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const turfs = await storage.getTurfs();
      res.json(turfs);
    } catch (error) {
      console.error("Error fetching admin turfs:", error);
      res.status(500).json({ message: "Failed to fetch turfs" });
    }
  });

  app.get('/api/admin/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin booking status update
  app.patch('/api/admin/bookings/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const bookingId = req.params.id;
      const { status } = req.body;
      if (!['confirmed', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateBooking(bookingId, { status });
      if (!updated) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
