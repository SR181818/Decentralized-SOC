import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTicketSchema, 
  insertStakingRecordSchema,
  insertCltRewardSchema,
  type User,
  type Ticket
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with wallet address already exists
      const existingUser = await storage.getUserByWalletAddress(userData.walletAddress);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:walletAddress", async (req, res) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.walletAddress);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  // Ticket routes
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(400).json({ error: "Failed to create ticket" });
    }
  });

  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const role = req.query.role as string || "client";
      const tickets = await storage.getTicketsByUser(userId, role);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:ticketId", async (req, res) => {
    try {
      const ticket = await storage.getTicketByTicketId(req.params.ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.put("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updates = req.body;
      const ticket = await storage.updateTicket(ticketId, updates);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(400).json({ error: "Failed to update ticket" });
    }
  });

  // Staking routes
  app.post("/api/staking", async (req, res) => {
    try {
      const stakingData = insertStakingRecordSchema.parse(req.body);
      const record = await storage.createStakingRecord(stakingData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating staking record:", error);
      res.status(400).json({ error: "Failed to create staking record" });
    }
  });

  app.get("/api/staking/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const records = await storage.getStakingRecordsByUser(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching staking records:", error);
      res.status(500).json({ error: "Failed to fetch staking records" });
    }
  });

  // CLT Rewards routes
  app.post("/api/rewards", async (req, res) => {
    try {
      const rewardData = insertCltRewardSchema.parse(req.body);
      const reward = await storage.createCltReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      console.error("Error creating CLT reward:", error);
      res.status(400).json({ error: "Failed to create CLT reward" });
    }
  });

  app.get("/api/rewards/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const rewards = await storage.getCltRewardsByUser(userId);
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching CLT rewards:", error);
      res.status(500).json({ error: "Failed to fetch CLT rewards" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
