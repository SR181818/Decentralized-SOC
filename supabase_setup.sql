-- dSOC Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL UNIQUE,
    client_address VARCHAR(255) NOT NULL,
    analyst_address VARCHAR(255),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    evidence_hash VARCHAR(64) NOT NULL,
    report_hash VARCHAR(64),
    status INTEGER NOT NULL DEFAULT 0,
    stake_amount INTEGER NOT NULL,
    transaction_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    clt_balance INTEGER NOT NULL DEFAULT 0,
    stake_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(ticket_id),
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255),
    transaction_hash VARCHAR(64) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create stake_tokens table
CREATE TABLE IF NOT EXISTS stake_tokens (
    id SERIAL PRIMARY KEY,
    owner_address VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create clt_tokens table
CREATE TABLE IF NOT EXISTS clt_tokens (
    id SERIAL PRIMARY KEY,
    owner_address VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_client_address ON tickets(client_address);
CREATE INDEX IF NOT EXISTS idx_tickets_analyst_address ON tickets(analyst_address);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_ticket_id ON transactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_stake_tokens_owner ON stake_tokens(owner_address);
CREATE INDEX IF NOT EXISTS idx_clt_tokens_owner ON clt_tokens(owner_address);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at field
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO users (wallet_address, role, clt_balance, stake_balance) VALUES
('0x1234567890abcdef1234567890abcdef12345678', 'client', 0, 1000),
('0xabcdef1234567890abcdef1234567890abcdef12', 'analyst', 500, 500),
('0x9876543210fedcba9876543210fedcba98765432', 'certifier', 1000, 200)
ON CONFLICT (wallet_address) DO NOTHING;