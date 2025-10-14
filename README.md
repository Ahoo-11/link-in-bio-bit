# LinkChain 🔗⚡

> **A Linktree alternative built on Stacks blockchain** - Accept crypto tips through beautiful, customizable link-in-bio pages.

[![Made with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Built on Stacks](https://img.shields.io/badge/Stacks-Blockchain-purple)](https://stacks.co/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ What is LinkChain?

LinkChain makes it **ridiculously easy** for creators to receive cryptocurrency payments. Share one link, accept tips in crypto, and get paid instantly—all with zero blockchain jargon.

### Key Features

✨ **Beautiful Profile Pages** - Customizable templates, colors, and layouts  
💰 **Direct Crypto Tips** - Accept payments in STX with preset or custom amounts  
📊 **Analytics Dashboard** - Track earnings, tips, and visitor analytics  
🎨 **Full Customization** - Drag-and-drop buttons, custom styling, themes  
📱 **Mobile-First Design** - Perfect experience on all devices  
🔒 **Secure** - Built on Stacks blockchain with smart contracts  
🌐 **Open Source** - Self-hostable, community-driven

### Why LinkChain?

| Feature | LinkChain | Traditional Platforms |
|---------|-----------|----------------------|
| Crypto Payments | ✅ Native | ❌ or 🔌 Plugins |
| Transaction Fees | 2% | 5-10% |
| Open Source | ✅ | ❌ |
| Self-Hostable | ✅ | ❌ |
| No Commission | ✅ | ❌ |

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Stacks (Clarity smart contracts)
- **Backend**: Node.js, Express, MongoDB
- **UI Libraries**: Framer Motion, Recharts, Lucide Icons, Sonner
- **Wallet Integration**: @stacks/connect

## 🚀 Quick Start

### One-Line Install
```bash
npm install && cp .env.example .env.local && npm run dev
```

**That's it!** Open http://localhost:3000 and start building your profile.

### Detailed Setup

Need more guidance? We have comprehensive documentation:

📖 **[Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes  
📖 **[Full Setup Guide](./SETUP.md)** - Detailed installation instructions  
📖 **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production  
📖 **[Command Reference](./COMMANDS.md)** - All commands you'll need  
📖 **[Feature List](./FEATURES.md)** - Complete feature documentation  
📖 **[Project Summary](./PROJECT_SUMMARY.md)** - Architecture and overview

### Environment Variables

Create a `.env.local` file with:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# Stacks Network
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_CONTRACT_NAME=linkchain-tips

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Smart Contract Deployment

1. Navigate to the `contracts` directory
2. Deploy the `linkchain-tips.clar` contract to Stacks testnet using Clarinet or Hiro Platform
3. Update `.env.local` with the deployed contract address

## Project Structure

```
linkchain/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Creator dashboard
│   ├── editor/            # Profile editor
│   ├── [username]/        # Public profile pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   ├── editor/            # Editor components
│   └── profile/           # Profile view components
├── lib/                   # Utility functions
│   ├── stacks.ts          # Blockchain utilities
│   ├── db.ts              # Database utilities
│   └── utils.ts           # General utilities
├── contracts/             # Clarity smart contracts
│   └── linkchain-tips.clar
├── backend/               # Express backend
│   ├── server.js          # Main server
│   ├── models/            # Mongoose models
│   └── routes/            # API routes
└── public/                # Static assets
```

## Usage

### For Creators

1. **Sign up** - Create account with email or connect wallet
2. **Customize** - Choose template, add buttons, customize colors
3. **Share** - Get your unique `linkchain.app/username` link
4. **Earn** - Receive tips directly to your wallet

### For Supporters

1. **Visit** - Open creator's LinkChain profile
2. **Select Amount** - Choose preset or custom tip amount
3. **Pay** - Connect wallet and confirm transaction
4. **Celebrate** - See success animation and support the creator

## Key Features

### Profile Customization
- 5 professional templates
- 10 color schemes + custom colors
- Light/dark mode
- Custom fonts and backgrounds
- Drag-and-drop button ordering

### Payment Options
- Preset tip amounts ($5, $10, $25, $50)
- Custom amount input
- Anonymous tipping option
- Instant confirmation
- Success celebrations

### Analytics
- Total earnings
- Recent tips list
- Earnings charts
- Transaction history
- Export to CSV

## Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run backend
npm run server
```

## Testing

Test the app with Stacks testnet:
1. Get testnet STX from faucet
2. Connect wallet to testnet
3. Send test tips
4. Verify transactions on explorer

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Backend (Railway/Heroku)
1. Push to GitHub
2. Connect to hosting platform
3. Add environment variables
4. Deploy

### Smart Contract
1. Deploy to Stacks mainnet using Clarinet
2. Update frontend with contract address
3. Test thoroughly before going live

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT License

## Support

For questions or support, open an issue on GitHub.

---

Built with ❤️ for creators worldwide
