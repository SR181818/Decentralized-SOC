
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sncziafbwxgjkvymkolp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY3ppYWZid3hnamt2eW1rb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTMyNTksImV4cCI6MjA2NjgyOTI1OX0.r8xYuUWST0Hx6ifGLuFLgxj0GlvMSY3MGgrf90u5x5o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DbTicket {
  id: string
  ticket_id: number
  client_address: string
  analyst_address?: string
  evidence_hash: string
  report_hash?: string
  status: number
  stake_amount: number
  created_at: string
  updated_at: string
  title: string
  description: string
  category: string
}

export interface DbStakeToken {
  id: string
  owner_address: string
  amount: number
  is_used: boolean
  created_at: string
}

export interface DbCLTToken {
  id: string
  owner_address: string
  amount: number
  created_at: string
}

// Supabase service functions
export class SupabaseService {
  static async createTicket(ticketData: Partial<DbTicket>) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async getTicketsByClient(clientAddress: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('client_address', clientAddress)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getTicketsByAnalyst(analystAddress: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('analyst_address', analystAddress)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getOpenTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 0)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async updateTicket(ticketId: string, updates: Partial<DbTicket>) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async createStakeToken(tokenData: Partial<DbStakeToken>) {
    const { data, error } = await supabase
      .from('stake_tokens')
      .insert([tokenData])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async getUserStakeTokens(ownerAddress: string) {
    const { data, error } = await supabase
      .from('stake_tokens')
      .select('*')
      .eq('owner_address', ownerAddress)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createCLTToken(tokenData: Partial<DbCLTToken>) {
    const { data, error } = await supabase
      .from('clt_tokens')
      .insert([tokenData])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async getUserCLTTokens(ownerAddress: string) {
    const { data, error } = await supabase
      .from('clt_tokens')
      .select('*')
      .eq('owner_address', ownerAddress)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
