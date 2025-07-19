import { IotaClient } from "@iota/iota-sdk/client";
import { Transaction } from "@iota/iota-sdk/transactions";
import { supabaseService } from "./supabase";
import { Buffer } from 'buffer';

// Contract configuration
export const CONTRACT_PACKAGE_ID = "0xbec69147e6d51ff32994389b52eb3ee10a7414d07801bb9d5aaa1ba1c6e6b345";
export const MODULE_NAME = "dsoc::SOCService";
export const CLT_MODULE_NAME = "dsoc::CLTReward";
import { Transaction } from "@iota/iota-sdk/transactions";
import { supabaseService } from "./supabase";

// Contract configuration
export const CONTRACT_PACKAGE_ID = "0xbec69147e6d51ff32994389b52eb3ee10a7414d07801bb9d5aaa1ba1c6e6b345"
export const MODULE_NAME = "dsoc::SOCService"
export const CLT_MODULE_NAME = "dsoc::CLTReward"

// Contract functions
export const CONTRACT_FUNCTIONS = {
  CREATE_STAKE: "create_stake",
  CREATE_TICKET: "create_ticket", 
  ASSIGN_ANALYST: "assign_analyst",
  SUBMIT_REPORT: "submit_report",
  VALIDATE_TICKET: "validate_ticket",
  MERGE_CLT: "merge",
  SPLIT_CLT: "split",
  GET_CLT_AMOUNT: "get_amount",
  GET_CLT_OWNER: "get_owner"
} as const

// Status constants matching Move contract
export const TICKET_STATUS = {
  OPEN: 0,
  CLAIMED: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  REJECTED: 4
} as const

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.OPEN]: "Open",
  [TICKET_STATUS.CLAIMED]: "Claimed",
  [TICKET_STATUS.SUBMITTED]: "Submitted", 
  [TICKET_STATUS.APPROVED]: "Approved",
  [TICKET_STATUS.REJECTED]: "Rejected"
}

export interface Ticket {
  id: string
  ticket_id: number
  client: string
  analyst?: string
  evidence_hash: string
  report_hash?: string
  status: number
  stake: number
  title?: string
  description?: string
  category?: string
  created_at?: string
}

export interface StakeToken {
  id: string
  amount: number
}

export interface CLTToken {
  id: string
  amount: number
  owner: string
}

// Contract interaction functions
export class ContractService {
  constructor(private client: IotaClient) {}

  private async submitTransaction(tx: Transaction): Promise<string> {
    return await this.client.submitTransaction(tx);
  }

  async createStake(amount: number, address: string): Promise<Transaction> {
    const tx = new Transaction();
    
    // Create stake token
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.CREATE_STAKE}`,
      arguments: [tx.pure.u64(amount)]
    });

    // Store in Supabase for tracking
    try {
      await supabaseService.createStakeToken({
        owner_address: address,
        amount: amount,
        is_used: false
      });
    } catch (error) {
      console.error('Error storing stake token in Supabase:', error);
    }

    return tx;
  }

  async createTicket(
    evidenceHash: string,
    title: string,
    description: string,
    category: string,
    stakeAmount: number,
    clientAddress: string
  ) {
    const tx = new Transaction();

    // First create the stake token
    const [stakeToken] = tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.CREATE_STAKE}`,
      arguments: [tx.pure.u64(stakeAmount)]
    });

    // Create ticket with stake
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.CREATE_TICKET}`,
      arguments: [
        tx.object('ticket_store'),
        stakeToken,
        tx.pure.vector.u8(Buffer.from(evidenceHash))
      ]
    });
    });

    // Store ticket info in Supabase for enhanced tracking
    try {
      await supabaseService.createTicket({
        client_address: clientAddress,
        title,
        description,
        category,
        evidence_hash: evidenceHash,
        stake_amount: stakeAmount,
        status: TICKET_STATUS.OPEN
      });
    } catch (error) {
      console.error('Error storing ticket in Supabase:', error);
    }

    return tx;
  }

  

  async assignAnalyst(
    storeId: string,
    ticketId: number,
    address: string
  ): Promise<Transaction> {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.ASSIGN_ANALYST}`,
      arguments: [
        tx.object(storeId),
        tx.pure.u64(ticketId)
      ],
    })

    // Update in Supabase
    try {
      const tickets = await supabaseService.getOpenTickets()
      const ticket = tickets.find(t => t.ticket_id === ticketId)
      if (ticket) {
        await supabaseService.updateTicket(ticket.id, {
          analyst_address: address,
          status: TICKET_STATUS.CLAIMED
        })
      }
    } catch (error) {
      console.error('Error updating ticket in Supabase:', error)
    }

    return tx
  }

  async submitReport(
    storeId: string,
    ticketId: number,
    reportHash: string,
    address: string
  ): Promise<Transaction> {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.SUBMIT_REPORT}`,
      arguments: [
        tx.object(storeId),
        tx.pure.u64(ticketId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(reportHash)))
      ],
    })

    // Update in Supabase
    try {
      const tickets = await supabaseService.getTicketsByAnalyst(address)
      const ticket = tickets.find(t => t.ticket_id === ticketId)
      if (ticket) {
        await supabaseService.updateTicket(ticket.id, {
          report_hash: reportHash,
          status: TICKET_STATUS.SUBMITTED
        })
      }
    } catch (error) {
      console.error('Error updating ticket in Supabase:', error)
    }

    return tx
  }

  async validateTicket(
    storeId: string,
    ticketId: number,
    approved: boolean,
    address: string
  ): Promise<Transaction> {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.VALIDATE_TICKET}`,
      arguments: [
        tx.object(storeId),
        tx.pure.u64(ticketId),
        tx.pure.bool(approved)
      ],
    })

    // Update in Supabase
    try {
      const tickets = await supabaseService.getTicketsByClient(address)
      const ticket = tickets.find(t => t.ticket_id === ticketId)
      if (ticket) {
        await supabaseService.updateTicket(ticket.id, {
          status: approved ? TICKET_STATUS.APPROVED : TICKET_STATUS.REJECTED
        })

        // If approved, create CLT token record
        if (approved && ticket.analyst_address) {
          await supabaseService.createCLTToken({
            owner_address: ticket.analyst_address,
            amount: ticket.stake_amount
          })
        }
      }
    } catch (error) {
      console.error('Error updating ticket in Supabase:', error)
    }

    return tx
  }

  async getTicketStore(storeId: string) {
    try {
      const object = await this.client.getObject({
        id: storeId,
        options: {
          showContent: true,
          showType: true,
        },
      })
      return object
    } catch (error) {
      console.error('Error fetching ticket store:', error)
      return null
    }
  }

  async getTickets(storeId: string): Promise<Ticket[]> {
    try {
      // Get from blockchain
      const storeObj = await this.getTicketStore(storeId)
      let blockchainTickets: Ticket[] = []

      if (storeObj && storeObj.data?.content && storeObj.data.content.dataType === 'moveObject') {
        const fields = (storeObj.data.content as any).fields
        const tickets = fields.tickets?.fields || []

        blockchainTickets = tickets.map((ticket: any) => ({
          id: ticket.id,
          ticket_id: ticket.ticket_id,
          client: ticket.client,
          analyst: ticket.analyst,
          evidence_hash: ticket.evidence_hash,
          report_hash: ticket.report_hash,
          status: ticket.status,
          stake: ticket.stake
        }))
      }

      return blockchainTickets
    } catch (error) {
      console.error('Error fetching tickets:', error)
      return []
    }
  }

  // Enhanced methods that use Supabase data
  async getTicketsForUser(userAddress: string, userRole: string): Promise<DbTicket[]> {
    try {
      switch (userRole) {
        case 'client':
          return await supabaseService.getTicketsByClient(userAddress)
        case 'analyst':
          return await supabaseService.getTicketsByAnalyst(userAddress)
        case 'certifier':
          return await supabaseService.getOpenTickets()
        default:
          return []
      }
    } catch (error) {
      console.error('Error fetching user tickets:', error)
      return []
    }
  }

  async getUserStakeTokens(userAddress: string) {
    try {
      return await supabaseService.getUserStakeTokens(userAddress)
    } catch (error) {
      console.error('Error fetching stake tokens:', error)
      return []
    }
  }

  async getUserCLTTokens(userAddress: string) {
    try {
      return await supabaseService.getUserCLTTokens(userAddress)
    } catch (error) {
      console.error('Error fetching CLT tokens:', error)
      return []
    }
  }

  // Event parsing helpers
  parseTicketCreatedEvent(event: any) {
    return {
      ticket_id: event.parsedJson.ticket_id,
      client: event.parsedJson.client,
      stake: event.parsedJson.stake
    }
  }

  parseTicketAssignedEvent(event: any) {
    return {
      ticket_id: event.parsedJson.ticket_id,
      analyst: event.parsedJson.analyst
    }
  }

  parseReportSubmittedEvent(event: any) {
    return {
      ticket_id: event.parsedJson.ticket_id,
      analyst: event.parsedJson.analyst,
      report_hash: event.parsedJson.report_hash
    }
  }

  parseTicketValidatedEvent(event: any) {
    return {
      ticket_id: event.parsedJson.ticket_id,
      approved: event.parsedJson.approved
    }
  }
}

export const createContractService = (client: IotaClient) => {
  return new ContractService(client)
}