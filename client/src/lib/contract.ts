import { IotaClient } from "@iota/iota-sdk/client"
import { Transaction } from "@iota/iota-sdk/transactions"

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

export interface Ticket {
  id: string
  ticket_id: number
  client: string
  analyst?: string
  evidence_hash: string
  report_hash?: string
  status: number
  stake: number
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

  // Helper method to check if contract exists
  async verifyContract(): Promise<boolean> {
    try {
      const packageObj = await this.client.getObject({
        id: CONTRACT_PACKAGE_ID,
        options: {
          showContent: true,
          showType: true,
        },
      })
      return packageObj.data !== null
    } catch (error) {
      console.error('Contract verification failed:', error)
      return false
    }
  }

  async createStake(amount: number, address: string): Promise<Transaction> {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::${CONTRACT_FUNCTIONS.CREATE_STAKE}`,
      arguments: [tx.pure.u64(amount)],
    })
    return tx
  }

  async createTicket(
    storeId: string,
    stakeTokenId: string,
    evidenceHash: string,
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
      const storeObj = await this.getTicketStore(storeId)
      if (!storeObj || !storeObj.data?.content || storeObj.data.content.dataType !== 'moveObject') {
        return []
      }
      
      // Parse tickets from the store object
      const fields = (storeObj.data.content as any).fields
      const tickets = fields.tickets?.fields || []
      
      return tickets.map((ticket: any) => ({
        id: ticket.id,
        ticket_id: ticket.ticket_id,
        client: ticket.client,
        analyst: ticket.analyst,
        evidence_hash: ticket.evidence_hash,
        report_hash: ticket.report_hash,
        status: ticket.status,
        stake: ticket.stake
      }))
    } catch (error) {
      console.error('Error fetching tickets:', error)
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