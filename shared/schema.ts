import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for dSOC platform
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  userRole: text("user_role").notNull(), // client, analyst, certifier
  stakingBalance: integer("staking_balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Security tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  clientId: integer("client_id").notNull(),
  analystId: integer("analyst_id"),
  certifierId: integer("certifier_id"),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"), // open, claimed, submitted, approved, rejected
  evidenceHash: text("evidence_hash").notNull(),
  reportHash: text("report_hash"),
  fileName: text("file_name"),
  stakeAmount: integer("stake_amount").notNull(),
  iotaTransactionHash: text("iota_transaction_hash"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Staking records table
export const stakingRecords = pgTable("staking_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ticketId: integer("ticket_id"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("active"), // active, released, slashed
  iotaTokenId: text("iota_token_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// CLT reward tokens table
export const cltRewards = pgTable("clt_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ticketId: integer("ticket_id").notNull(),
  amount: integer("amount").notNull(),
  rewardType: text("reward_type").notNull(), // analysis, certification, completion
  iotaTokenId: text("iota_token_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  clientTickets: many(tickets, { relationName: "clientTickets" }),
  analystTickets: many(tickets, { relationName: "analystTickets" }),
  certifierTickets: many(tickets, { relationName: "certifierTickets" }),
  stakingRecords: many(stakingRecords),
  cltRewards: many(cltRewards),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  client: one(users, {
    fields: [tickets.clientId],
    references: [users.id],
    relationName: "clientTickets",
  }),
  analyst: one(users, {
    fields: [tickets.analystId],
    references: [users.id],
    relationName: "analystTickets",
  }),
  certifier: one(users, {
    fields: [tickets.certifierId],
    references: [users.id],
    relationName: "certifierTickets",
  }),
  stakingRecords: many(stakingRecords),
  cltRewards: many(cltRewards),
}));

export const stakingRecordsRelations = relations(stakingRecords, ({ one }) => ({
  user: one(users, {
    fields: [stakingRecords.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [stakingRecords.ticketId],
    references: [tickets.id],
  }),
}));

export const cltRewardsRelations = relations(cltRewards, ({ one }) => ({
  user: one(users, {
    fields: [cltRewards.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [cltRewards.ticketId],
    references: [tickets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
});

export const insertStakingRecordSchema = createInsertSchema(stakingRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCltRewardSchema = createInsertSchema(cltRewards).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type StakingRecord = typeof stakingRecords.$inferSelect;
export type InsertStakingRecord = z.infer<typeof insertStakingRecordSchema>;

export type CltReward = typeof cltRewards.$inferSelect;
export type InsertCltReward = z.infer<typeof insertCltRewardSchema>;
