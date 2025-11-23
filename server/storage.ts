import {
  users,
  turfs,
  teams,
  teamMembers,
  bookings,
  matches,
  tournaments,
  tournamentRegistrations,
  matchInvitations,
  type User,
  type UpsertUser,
  type Turf,
  type InsertTurf,
  type Team,
  type InsertTeam,
  type InsertTeamMember,
  type TeamMember,
  type Booking,
  type InsertBooking,
  type Match,
  type InsertMatch,
  type Tournament,
  type InsertTournament,
  type InsertTournamentRegistration,
  type TournamentRegistration,
  type MatchInvitation,
  type InsertMatchInvitation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Turf operations
  getTurfs(): Promise<Turf[]>;
  getTurf(id: string): Promise<Turf | undefined>;
  createTurf(turf: InsertTurf): Promise<Turf>;
  updateTurf(id: string, turf: Partial<InsertTurf>): Promise<Turf | undefined>;

  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsByCaptain(captainId: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<Team>): Promise<Team | undefined>;

  // Team member operations
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;

  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByTurf(turfId: string): Promise<Booking[]>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Match operations
  getMatches(): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  getMatchesByTeam(teamId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;

  // Tournament operations
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, tournament: Partial<InsertTournament>): Promise<Tournament | undefined>;

  // Tournament registration operations
  getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]>;
  registerTeamForTournament(registration: InsertTournamentRegistration): Promise<TournamentRegistration>;

  // Match invitation operations
  getMatchInvitations(): Promise<MatchInvitation[]>;
  getMatchInvitationsByTeam(teamId: string): Promise<MatchInvitation[]>;
  createMatchInvitation(invitation: InsertMatchInvitation): Promise<MatchInvitation>;
  updateMatchInvitation(id: string, invitation: Partial<InsertMatchInvitation>): Promise<MatchInvitation | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Turf operations
  async getTurfs(): Promise<Turf[]> {
    return await db.select().from(turfs).where(eq(turfs.isActive, true));
  }

  async getTurf(id: string): Promise<Turf | undefined> {
    const [turf] = await db.select().from(turfs).where(eq(turfs.id, id));
    return turf;
  }

  async createTurf(turf: InsertTurf): Promise<Turf> {
    const [newTurf] = await db.insert(turfs).values(turf).returning();
    return newTurf;
  }

  async updateTurf(id: string, turf: Partial<InsertTurf>): Promise<Turf | undefined> {
    const [updated] = await db
      .update(turfs)
      .set({ ...turf, updatedAt: new Date() })
      .where(eq(turfs.id, id))
      .returning();
    return updated;
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(desc(teams.eloRating));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamsByCaptain(captainId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.captainId, captainId));
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, team: Partial<Team>): Promise<Team | undefined> {
    const [updated] = await db
      .update(teams)
      .set({ ...team, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  // Team member operations
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.bookingDate));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByTurf(turfId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.turfId, turfId));
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  // Match operations
  async getMatches(): Promise<Match[]> {
    return await db.select().from(matches).orderBy(desc(matches.matchDate));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getMatchesByTeam(teamId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(sql`${matches.teamAId} = ${teamId} OR ${matches.teamBId} = ${teamId}`)
      .orderBy(desc(matches.matchDate));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined> {
    const [updated] = await db
      .update(matches)
      .set({ ...match, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return updated;
  }

  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(desc(tournaments.startDate));
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  async updateTournament(id: string, tournament: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const [updated] = await db
      .update(tournaments)
      .set({ ...tournament, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return updated;
  }

  // Tournament registration operations
  async getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
    return await db
      .select()
      .from(tournamentRegistrations)
      .where(eq(tournamentRegistrations.tournamentId, tournamentId));
  }

  async registerTeamForTournament(registration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const [newRegistration] = await db
      .insert(tournamentRegistrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  // Match invitation operations
  async getMatchInvitations(): Promise<MatchInvitation[]> {
    return await db.select().from(matchInvitations).orderBy(desc(matchInvitations.createdAt));
  }

  async getMatchInvitationsByTeam(teamId: string): Promise<MatchInvitation[]> {
    return await db
      .select()
      .from(matchInvitations)
      .where(sql`${matchInvitations.fromTeamId} = ${teamId} OR ${matchInvitations.toTeamId} = ${teamId}`)
      .orderBy(desc(matchInvitations.createdAt));
  }

  async createMatchInvitation(invitation: InsertMatchInvitation): Promise<MatchInvitation> {
    const [newInvitation] = await db.insert(matchInvitations).values(invitation).returning();
    return newInvitation;
  }

  async updateMatchInvitation(id: string, invitation: Partial<InsertMatchInvitation>): Promise<MatchInvitation | undefined> {
    const [updated] = await db
      .update(matchInvitations)
      .set({ ...invitation, updatedAt: new Date() })
      .where(eq(matchInvitations.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
