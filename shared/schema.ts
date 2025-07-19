import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core ticket management tables for dSOC
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id").notNull().unique(),
  client_address: varchar("client_address", { length: 255 }).notNull(),
  analyst_address: varchar("analyst_address", { length: 255 }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  evidence_hash: varchar("evidence_hash", { length: 64 }).notNull(),
  report_hash: varchar("report_hash", { length: 64 }),
  status: integer("status").notNull().default(0),
  stake_amount: integer("stake_amount").notNull(),
  transaction_hash: varchar("transaction_hash", { length: 64 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  wallet_address: varchar("wallet_address", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull(),
  clt_balance: integer("clt_balance").notNull().default(0),
  stake_balance: integer("stake_balance").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id").references(() => tickets.ticket_id),
  from_address: varchar("from_address", { length: 255 }).notNull(),
  to_address: varchar("to_address", { length: 255 }),
  transaction_hash: varchar("transaction_hash", { length: 64 }).notNull(),
  transaction_type: varchar("transaction_type", { length: 50 }).notNull(),
  amount: integer("amount"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const stake_tokens = pgTable("stake_tokens", {
  id: serial("id").primaryKey(),
  owner_address: varchar("owner_address", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  is_used: boolean("is_used").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const clt_tokens = pgTable("clt_tokens", {
  id: serial("id").primaryKey(),
  owner_address: varchar("owner_address", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  created_at: true,
});

export const insertStakeTokenSchema = createInsertSchema(stake_tokens).omit({
  id: true,
  created_at: true,
});

export const insertCLTTokenSchema = createInsertSchema(clt_tokens).omit({
  id: true,
  created_at: true,
});

// Types
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertStakeToken = z.infer<typeof insertStakeTokenSchema>;
export type StakeToken = typeof stake_tokens.$inferSelect;

export type InsertCLTToken = z.infer<typeof insertCLTTokenSchema>;
export type CLTToken = typeof clt_tokens.$inferSelect;
