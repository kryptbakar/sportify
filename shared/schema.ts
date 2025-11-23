import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Turfs (football fields)
export const turfs = pgTable("turfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  address: text("address").notNull(),
  turfType: varchar("turf_type", { length: 50 }).notNull(), // '5-a-side', '7-a-side', '11-a-side'
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  captainId: varchar("captain_id").references(() => users.id).notNull(),
  location: text("location").notNull(),
  preferredTurfType: varchar("preferred_turf_type", { length: 50 }),
  logoUrl: text("logo_url"),
  eloRating: integer("elo_rating").default(1200).notNull(),
  tier: varchar("tier", { length: 20 }).default('Bronze').notNull(), // Bronze, Silver, Gold, Platinum
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  draws: integer("draws").default(0).notNull(),
  goalsScored: integer("goals_scored").default(0).notNull(),
  goalsConceded: integer("goals_conceded").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  position: varchar("position", { length: 50 }),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  turfId: varchar("turf_id").references(() => turfs.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  teamId: varchar("team_id").references(() => teams.id),
  bookingDate: date("booking_date").notNull(),
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  status: varchar("status", { length: 20 }).default('pending').notNull(), // pending, confirmed, cancelled
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Matches
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamAId: varchar("team_a_id").references(() => teams.id).notNull(),
  teamBId: varchar("team_b_id").references(() => teams.id).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  turfId: varchar("turf_id").references(() => turfs.id).notNull(),
  matchDate: date("match_date").notNull(),
  matchTime: text("match_time").notNull(),
  teamAScore: integer("team_a_score"),
  teamBScore: integer("team_b_score"),
  status: varchar("status", { length: 20 }).default('scheduled').notNull(), // scheduled, completed, cancelled
  winnerId: varchar("winner_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournaments
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  organizerId: varchar("organizer_id").references(() => users.id).notNull(),
  location: text("location").notNull(),
  turfType: varchar("turf_type", { length: 50 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  registrationDeadline: date("registration_deadline").notNull(),
  maxTeams: integer("max_teams").notNull(),
  prizeInfo: text("prize_info"),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default('upcoming').notNull(), // upcoming, ongoing, completed, cancelled
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournament registrations
export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id, { onDelete: 'cascade' }).notNull(),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Match invitations
export const matchInvitations = pgTable("match_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromTeamId: varchar("from_team_id").references(() => teams.id).notNull(),
  toTeamId: varchar("to_team_id").references(() => teams.id).notNull(),
  preferredDate: date("preferred_date"),
  preferredTime: text("preferred_time"),
  turfId: varchar("turf_id").references(() => turfs.id),
  status: varchar("status", { length: 20 }).default('pending').notNull(), // pending, accepted, rejected
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedTurfs: many(turfs),
  captainedTeams: many(teams),
  teamMemberships: many(teamMembers),
  bookings: many(bookings),
  organizedTournaments: many(tournaments),
}));

export const turfsRelations = relations(turfs, ({ one, many }) => ({
  owner: one(users, {
    fields: [turfs.ownerId],
    references: [users.id],
  }),
  bookings: many(bookings),
  matches: many(matches),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  members: many(teamMembers),
  bookings: many(bookings),
  matchesAsTeamA: many(matches, { relationName: 'teamA' }),
  matchesAsTeamB: many(matches, { relationName: 'teamB' }),
  wonMatches: many(matches, { relationName: 'winner' }),
  tournamentRegistrations: many(tournamentRegistrations),
  sentInvitations: many(matchInvitations, { relationName: 'fromTeam' }),
  receivedInvitations: many(matchInvitations, { relationName: 'toTeam' }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  turf: one(turfs, {
    fields: [bookings.turfId],
    references: [turfs.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [bookings.teamId],
    references: [teams.id],
  }),
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  teamA: one(teams, {
    fields: [matches.teamAId],
    references: [teams.id],
    relationName: 'teamA',
  }),
  teamB: one(teams, {
    fields: [matches.teamBId],
    references: [teams.id],
    relationName: 'teamB',
  }),
  winner: one(teams, {
    fields: [matches.winnerId],
    references: [teams.id],
    relationName: 'winner',
  }),
  turf: one(turfs, {
    fields: [matches.turfId],
    references: [turfs.id],
  }),
  booking: one(bookings, {
    fields: [matches.bookingId],
    references: [bookings.id],
  }),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  organizer: one(users, {
    fields: [tournaments.organizerId],
    references: [users.id],
  }),
  registrations: many(tournamentRegistrations),
}));

export const tournamentRegistrationsRelations = relations(tournamentRegistrations, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentRegistrations.tournamentId],
    references: [tournaments.id],
  }),
  team: one(teams, {
    fields: [tournamentRegistrations.teamId],
    references: [teams.id],
  }),
}));

export const matchInvitationsRelations = relations(matchInvitations, ({ one }) => ({
  fromTeam: one(teams, {
    fields: [matchInvitations.fromTeamId],
    references: [teams.id],
    relationName: 'fromTeam',
  }),
  toTeam: one(teams, {
    fields: [matchInvitations.toTeamId],
    references: [teams.id],
    relationName: 'toTeam',
  }),
  turf: one(turfs, {
    fields: [matchInvitations.turfId],
    references: [turfs.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTurfSchema = createInsertSchema(turfs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  eloRating: true,
  tier: true,
  wins: true,
  losses: true,
  draws: true,
  goalsScored: true,
  goalsConceded: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertMatchInvitationSchema = createInsertSchema(matchInvitations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTurf = z.infer<typeof insertTurfSchema>;
export type Turf = typeof turfs.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;
export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;

export type InsertMatchInvitation = z.infer<typeof insertMatchInvitationSchema>;
export type MatchInvitation = typeof matchInvitations.$inferSelect;
