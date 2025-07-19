# dSOC - Decentralized Security Operations Center

## Project Overview
A decentralized Security Operations Center (SOC) platform built on IOTA blockchain technology. The application provides role-based access control for security analysts, clients, and certifiers to manage security incidents and tickets through a decentralized workflow.

## Architecture
- **Frontend**: React + TypeScript + Vite + wouter for routing
- **Backend**: Express.js with TypeScript
- **Blockchain**: IOTA integration with dApp Kit
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for data fetching
- **Styling**: Dark theme with security-focused design

## Key Features
- IOTA wallet integration for authentication
- Role-based access (client, analyst, certifier)
- Security ticket management system
- Staking and rewards mechanism
- Document notarization on IOTA
- Real-time dashboard with role-specific views

## Recent Changes
- **2024-01-XX**: Migrated project from Lovable to Replit environment
- Converted routing system from react-router-dom to wouter
- Added IOTA dApp Kit integration
- Implemented theme provider for dark mode support
- Created comprehensive UI component library

## User Preferences
- Focus on security and blockchain integration
- Maintain professional, technical approach
- Dark theme preferred for security application aesthetics

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── Header.tsx     # Navigation header
│   │   │   ├── TicketForm.tsx # Ticket creation
│   │   │   └── TicketList.tsx # Ticket management
│   │   ├── pages/
│   │   │   ├── Index.tsx      # Main landing page
│   │   │   └── NotFound.tsx   # 404 page
│   │   └── lib/
│   │       ├── contract.ts    # IOTA smart contract integration
│   │       └── utils.ts       # Utility functions
├── server/
│   ├── index.ts              # Express server entry
│   ├── routes.ts             # API routes
│   └── storage.ts            # Data storage interface
└── shared/
    └── schema.ts             # Shared type definitions
```

## Development Notes
- Using Replit's full-stack template architecture
- IOTA integration requires testnet configuration
- Security-focused design with pulse animations for critical elements
- Comprehensive role-based permission system