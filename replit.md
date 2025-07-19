# dSOC - Decentralized Security Operations Center

## Overview
A blockchain-based security operations center built on IOTA that provides role-based access control, evidence notarization, and decentralized security services. The application features client-analyst-certifier workflow with staking mechanisms and gasless transactions.

## Project Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js with Drizzle ORM
- **Database**: PostgreSQL with comprehensive schema (users, tickets, staking, rewards)
- **Blockchain**: IOTA integration with dApp Kit and Gas Station
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Routing**: Wouter (migrated from React Router)
- **State Management**: TanStack Query with real-time data fetching

## Key Features
- IOTA Identity-based role assignment (client, analyst, certifier)
- Document notarization with cryptographic proofs
- Gas Station for gasless transactions
- Evidence anchoring on IOTA ledger
- Staking rewards system with CLT tokens

## Migration Status
✅ Successfully migrated from Lovable to Replit environment:
- ✅ Package dependencies installed
- ✅ Router migration from React Router to Wouter completed
- ✅ Component compatibility fixes applied
- ✅ IOTA wallet integration enhanced
- ✅ Smart contract communication system implemented
- ✅ PostgreSQL database integration completed
- ✅ Complete ticket management system with persistent storage
- ✅ User authentication and role-based access control
- ✅ Staking and rewards tracking system

## Recent Changes
- 2025-01-19: Started migration from Lovable to Replit
- 2025-01-19: Installed missing IOTA and React dependencies
- 2025-01-19: Updated routing from react-router-dom to wouter
- 2025-01-19: Created queryClient setup for TanStack Query
- 2025-01-19: Fixed CSS gradient and color issues
- 2025-01-19: Implemented proper QueryClient provider hierarchy
- 2025-01-19: Created useWallet hook for enhanced IOTA integration
- 2025-01-19: Added contract verification and status monitoring
- 2025-01-19: Enhanced TicketForm with proper transaction handling
- 2025-01-19: Completed PostgreSQL database integration with Drizzle ORM
- 2025-01-19: Created comprehensive schema for tickets, users, staking, and rewards
- 2025-01-19: Built complete API routes for all CRUD operations
- 2025-01-19: Enhanced wallet hook with persistent user data
- 2025-01-19: Created new TicketsDashboard with database-driven ticket management

## User Preferences
- Prioritize security and blockchain integration
- Maintain dSOC branding and security-focused UI
- Use TypeScript for type safety