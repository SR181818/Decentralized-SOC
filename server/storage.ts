import { 
  users, 
  tickets, 
  stakingRecords, 
  cltRewards,
  type User, 
  type InsertUser,
  type Ticket,
  type InsertTicket,
  type StakingRecord,
  type InsertStakingRecord,
  type CltReward,
  type InsertCltReward
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByTicketId(ticketId: string): Promise<Ticket | undefined>;
  getTicketsByUser(userId: number, role: string): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: Partial<InsertTicket>): Promise<Ticket>;
  getAllTickets(): Promise<Ticket[]>;

  // Staking operations
  createStakingRecord(record: InsertStakingRecord): Promise<StakingRecord>;
  getStakingRecordsByUser(userId: number): Promise<StakingRecord[]>;
  updateStakingRecord(id: number, updates: Partial<InsertStakingRecord>): Promise<StakingRecord>;

  // CLT Rewards operations
  createCltReward(reward: InsertCltReward): Promise<CltReward>;
  getCltRewardsByUser(userId: number): Promise<CltReward[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getTicketByTicketId(ticketId: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, ticketId));
    return ticket || undefined;
  }

  async getTicketsByUser(userId: number, role: string): Promise<Ticket[]> {
    let query;
    
    switch (role) {
      case "client":
        query = db.select().from(tickets).where(eq(tickets.clientId, userId));
        break;
      case "analyst":
        query = db.select().from(tickets).where(eq(tickets.analystId, userId));
        break;
      case "certifier":
        query = db.select().from(tickets).where(eq(tickets.certifierId, userId));
        break;
      default:
        query = db.select().from(tickets).where(eq(tickets.clientId, userId));
    }
    
    return query.orderBy(desc(tickets.submittedAt));
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values({
        ...insertTicket,
        updatedAt: new Date(),
      })
      .returning();
    return ticket;
  }

  async updateTicket(id: number, updates: Partial<InsertTicket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return db.select().from(tickets).orderBy(desc(tickets.submittedAt));
  }

  // Staking operations
  async createStakingRecord(record: InsertStakingRecord): Promise<StakingRecord> {
    const [stakingRecord] = await db
      .insert(stakingRecords)
      .values({
        ...record,
        updatedAt: new Date(),
      })
      .returning();
    return stakingRecord;
  }

  async getStakingRecordsByUser(userId: number): Promise<StakingRecord[]> {
    return db.select().from(stakingRecords).where(eq(stakingRecords.userId, userId)).orderBy(desc(stakingRecords.createdAt));
  }

  async updateStakingRecord(id: number, updates: Partial<InsertStakingRecord>): Promise<StakingRecord> {
    const [record] = await db
      .update(stakingRecords)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(stakingRecords.id, id))
      .returning();
    return record;
  }

  // CLT Rewards operations
  async createCltReward(reward: InsertCltReward): Promise<CltReward> {
    const [cltReward] = await db
      .insert(cltRewards)
      .values(reward)
      .returning();
    return cltReward;
  }

  async getCltRewardsByUser(userId: number): Promise<CltReward[]> {
    return db.select().from(cltRewards).where(eq(cltRewards.userId, userId)).orderBy(desc(cltRewards.createdAt));
  }
}

export const storage = new DatabaseStorage();
