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

  async getTicketsByUser(userAddress: string, role: string) {
    let query = supabase.from('tickets').select('*');

    if (role === 'client') {
      query = query.eq('client_address', userAddress);
    } else if (role === 'analyst') {
      query = query.or(`analyst_address.eq.${userAddress},status.eq.0`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateTicket(ticketId: number, updates: Partial<DbTicket>) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('ticket_id', ticketId)
      .single()

    if (error) throw error
    return data
  }

  async getUserCLTTokens(userAddress: string) {
    const { data, error } = await supabase
      .from('clt_tokens')
      .select('*')
      .eq('owner', userAddress)

    if (error) throw error
    return data || []
  }
}

// Export the class and singleton instance
export { SupabaseService };
export const supabaseService = new SupabaseService();