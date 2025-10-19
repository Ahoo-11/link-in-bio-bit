# LinkChain - Blockchain Link-in-Bio Platform

A decentralized link-in-bio platform built on **Stacks blockchain** with **Clarity smart contracts** for direct STX payments to creators.

## Overview

LinkChain enables creators to accept cryptocurrency tips through customizable profile pages. Built with Stacks.js, featuring on-chain payments via Clarity smart contracts, and YouTube content integration.

**Tech Stack:**
- **Blockchain:** Stacks (Clarity smart contracts)
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Supabase (PostgreSQL)
- **Wallet:** @stacks/connect, @stacks/transactions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd link-in-bio-bit

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run database migration (see Supabase Setup below)

# Start development servers
npm run dev:all
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## ⚙️ Environment Setup

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Backend
JWT_SECRET=your_random_jwt_secret_min_32_chars
PORT=5000

# Stacks Blockchain
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_CONTRACT_NAME=linkchain-tips

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: OpenRouter AI (for AI assistant)
OPENROUTER_API_KEY=your_openrouter_key
```

---

## 🔗 Supabase Setup

1. **Create Project:** https://supabase.com/dashboard
2. **Run Migration:**

```bash
# In Supabase SQL Editor, run:
backend/supabase-migration.sql
```

3. **Get Credentials:**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Settings → API → anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Settings → API → service_role → `SUPABASE_SERVICE_KEY`

---

## 🔐 Stacks Blockchain Integration

### Smart Contract (`contracts/linkchain-tips.clar`)

**On-chain functionality:**
- Direct STX transfers between users
- 2% platform fee collection
- Earnings tracking per creator
- Tip history with messages
- Anonymous tipping support

**Key Functions:**
```clarity
(define-public (send-tip 
  (creator principal) 
  (amount uint) 
  (message (optional (string-utf8 280)))
  (anonymous bool)
)

(define-read-only (get-creator-earnings (creator principal))
(define-read-only (get-tip-count (creator principal))
```

### Wallet Integration (`lib/stacks.ts`)

**Using Stacks.js:**
```typescript
// Connect wallet
import { showConnect } from '@stacks/connect';

// Execute contract call
import { makeContractCall, broadcastTransaction } from '@stacks/transactions';

// Read blockchain state
import { callReadOnlyFunction } from '@stacks/transactions';
```

**Features:**
- Hiro/Leather wallet connection
- Mainnet/Testnet support
- Transaction broadcasting
- Read-only function calls
- Balance queries via Stacks API

---

## 🏗️ Architecture

```
┌─────────────┐
│   Next.js   │ ← Frontend (React, TypeScript)
│  Frontend   │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│   Express   │   │   Stacks    │
│   Backend   │   │ Blockchain  │
└──────┬──────┘   └──────┬──────┘
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│  Supabase   │   │  Clarity    │
│  Database   │   │  Contract   │
└─────────────┘   └─────────────┘
```

**Data Flow:**
1. User connects Stacks wallet (@stacks/connect)
2. Frontend calls smart contract (makeContractCall)
3. Transaction broadcast to Stacks blockchain
4. Backend stores metadata in Supabase
5. Analytics tracked via visitor tracking system

---

## 📦 Key Features

### Blockchain Features
- ✅ Clarity smart contract for tipping
- ✅ Wallet authentication (Hiro/Leather)
- ✅ On-chain payment verification
- ✅ Mainnet/Testnet support
- ✅ Direct STX transfers (peer-to-peer)

### Platform Features
- ✅ Customizable profile pages
- ✅ YouTube integration (RSS-based, no OAuth)
- ✅ Visitor analytics with session tracking
- ✅ AI assistant (OpenRouter integration)
- ✅ Real-time earnings dashboard

---

## 🧪 Testing

### Test on Stacks Testnet

1. **Get Testnet STX:**
   - https://explorer.stacks.co/sandbox/faucet

2. **Connect Wallet:**
   - Use Hiro/Leather wallet
   - Switch to Testnet

3. **Test Tipping:**
   - Create profile
   - Connect wallet
   - Send test tip
   - Verify on explorer

**Testnet Explorer:** https://explorer.stacks.co/?chain=testnet

---

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── [username]/          # Public profiles
│   ├── dashboard/           # Creator dashboard
│   ├── editor/              # Profile customization
│   └── analytics/           # Analytics page
├── backend/
│   ├── routes/              # Express API routes
│   ├── services/            # Business logic
│   │   ├── oauth-service.js         # OAuth handling
│   │   ├── integration-manager.js   # External integrations
│   │   └── integrations/
│   │       ├── spotify-connector.js
│   │       └── youtube-connector.js # RSS-based YouTube
│   └── supabase-migration.sql       # Database schema
├── contracts/
│   └── linkchain-tips.clar  # Clarity smart contract
├── lib/
│   ├── stacks.ts           # Blockchain utilities
│   └── visitor-tracking.ts # Analytics tracking
└── components/
    ├── AIChat.tsx          # AI assistant widget
    └── visitor-analytics.tsx
```

---

## 🚢 Deployment

### Smart Contract
```bash
# Using Clarinet
clarinet deploy contracts/linkchain-tips.clar --network testnet

# Update .env.local with deployed address
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-address>
```

### Frontend (Vercel)
```bash
vercel --prod
# Add all environment variables in Vercel dashboard
```

### Backend (Railway)
```bash
railway up
# Configure environment variables
```

---

## 🔧 Development Commands

```bash
# Start frontend + backend
npm run dev:all

# Frontend only
npm run dev

# Backend only  
npm run server

# Build production
npm run build

# Production server
npm start
```

---

## 🤝 Contributing

Built for Stacks hackathon. Contributions welcome!

## 📄 License

MIT License

---

**Built with Stacks blockchain for decentralized creator monetization**
