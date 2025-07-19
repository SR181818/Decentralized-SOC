
import { IotaClient } from "@iota/iota-sdk/client"
import { Transaction } from "@iota/iota-sdk/transactions"
import { SupabaseService, DbTicket } from "./supabase"

// Contract configuration - Your actual Move contract
export const CONTRACT_PACKAGE_ID = "0xbec69147e6d51ff32994389b52eb3ee10a7414d07801bb9d5aaa1ba1c6e6b345"
export const MODULE_NAME = "SOCService"
export const CLT_MODULE_NAME = "CLTReward"

// Contract functions
export const CONTRACT_FUNCTIONS = {
  CREATE_STAKE: "create_stake",
  CREATE_TICKET: "create_ticket", 
  ASSIGN_ANALYST: "assign_analyst",
  SUBMIT_REPORT: "submit_report",
  VALIDATE_TICKET: "validate_ticket",
  MINT_CLT: "mint_clt"
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

  async createStake(amount: number, address: string): Promise<Transaction> {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.CREATE_STAKE}`,
      arguments: [tx.pure.u64(amount)],
    })

    // Store in Supabase for tracking
    try {
      await SupabaseService.createStakeToken({
        owner_address: address,
        amount: amount,
        is_used: false
      })
    } catch (error) {
      console.error('Error storing stake token in Supabase:', error)
    }

    return tx
  }

  async createTicket(
    storeId: string,
    stakeTokenId: string,
    evidenceHash: string,
    title: string,
    description: string,
    category: string,
    stakeAmount: number,
    address: string
  ): Promise<Transaction> {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.CREATE_TICKET}`,
      arguments: [
        tx.object(storeId),
        tx.object(stakeTokenId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(evidenceHash)))
      ],
    })

    // Store in Supabase
    try {
      await SupabaseService.createTicket({
        client_address: address,
        evidence_hash: evidenceHash,
        status: TICKET_STATUS.OPEN,
        stake_amount: stakeAmount,
        title,
        description,
        category
      })
    } catch (error) {
      console.error('Error storing ticket in Supabase:', error)
    }

    return tx
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
      const tickets = await SupabaseService.getOpenTickets()
      const ticket = tickets.find(t => t.ticket_id === ticketId)
      if (ticket) {
        await SupabaseService.updateTicket(ticket.id, {
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
      const tickets = await SupabaseService.getTicketsByAnalyst(address)
      const ticket = tickets.find(t => t.ticket_id === ticketId)
      if (ticket) {
        await SupabaseService.updateTicket(ticket.id, {
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
      const tickets = await SupabaseService.getTicketsByClient(address)
      const ticket = tickets.find(t => t.ticket_id === ticketId)
      if (ticket) {
        await SupabaseService.updateTicket(ticket.id, {
          status: approved ? TICKET_STATUS.APPROVED : TICKET_STATUS.REJECTED
        })

        // If approved, create CLT token record
        if (approved && ticket.analyst_address) {
          await SupabaseService.createCLTToken({
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
          return await SupabaseService.getTicketsByClient(userAddress)
        case 'analyst':
          return await SupabaseService.getTicketsByAnalyst(userAddress)
        case 'certifier':
          return await SupabaseService.getOpenTickets()
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
      return await SupabaseService.getUserStakeTokens(userAddress)
    } catch (error) {
      console.error('Error fetching stake tokens:', error)
      return []
    }
  }

  async getUserCLTTokens(userAddress: string) {
    try {
      return await SupabaseService.getUserCLTTokens(userAddress)
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
