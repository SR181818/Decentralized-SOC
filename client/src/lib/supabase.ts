import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbTicket {
  id: string;
  ticket_id: number;
  client_address: string;
  analyst_address?: string;
  title: string;
  description: string;
  category: string;
  evidence_hash: string;
  report_hash?: string;
  status: number;
  stake_amount: number;
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
}

export interface DbUser {
  id: string;
  wallet_address: string;
  role: string;
  clt_balance: number;
  stake_balance: number;
  created_at: string;
  updated_at: string;
}

export interface DbTransaction {
  id: string;
  ticket_id: number;
  from_address: string;
  to_address?: string;
  transaction_hash: string;
  transaction_type: string;
  amount?: number;
  status: string;
  created_at: string;
}

// Supabase service functions
export interface DbStakeToken {
  id: string;
  owner_address: string;
  amount: number;
  is_used: boolean;
  created_at: string;
}

export interface DbCLTToken {
  id: string;
  owner_address: string;
  amount: number;
  created_at: string;
}

export class SupabaseService {
  // Ticket operations
  async createTicket(ticket: Omit<DbTicket, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTicketsByClient(userAddress: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('client_address', userAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTicketsByAnalyst(userAddress: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .or(`analyst_address.eq.${userAddress},status.eq.0`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getOpenTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateTicket(ticketId: number, updates: Partial<DbTicket>) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('ticket_id', ticketId)
      .single();

    if (error) throw error;
    return data;
  }

  // Stake Token operations
  async createStakeToken(stakeToken: Omit<DbStakeToken, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('stake_tokens')
      .insert([stakeToken])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStakeTokens(userAddress: string) {
    const { data, error } = await supabase
      .from('stake_tokens')
      .select('*')
      .eq('owner_address', userAddress)
      .eq('is_used', false);

    if (error) throw error;
    return data || [];
  }

  // CLT Token operations
  async createCLTToken(cltToken: Omit<DbCLTToken, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clt_tokens')
      .insert([cltToken])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserCLTTokens(userAddress: string) {
    const { data, error } = await supabase
      .from('clt_tokens')
      .select('*')
      .eq('owner_address', userAddress);

    if (error) throw error;
    return data || [];
  }
}

// Export the singleton instance
export const supabaseService = new SupabaseService();