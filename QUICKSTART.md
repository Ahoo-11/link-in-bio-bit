# LinkChain - Quick Start Guide

Get LinkChain running in under 5 minutes!

## 🚀 One-Line Install

```bash
npm install && cp .env.example .env.local && npm run dev
```

## 📋 Prerequisites

- Node.js 18+
- MongoDB running locally OR MongoDB Atlas account

## 🎯 Step-by-Step

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Configure Environment (1 minute)

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
# At minimum, update:
# - MONGODB_URI (if using MongoDB Atlas)
# - JWT_SECRET (any random secure string)
```

### 3. Start MongoDB (if local)

```bash
# Make sure MongoDB is running
mongod
```

### 4. Start Backend (30 seconds)

Open terminal 1:
```bash
npm run server
```

Backend runs on http://localhost:5000

### 5. Start Frontend (30 seconds)

Open terminal 2:
```bash
npm run dev
```

Frontend runs on http://localhost:3000

## ✨ You're Ready!

1. Open http://localhost:3000
2. Click "Get Started"
3. Create your profile
4. Customize your page
5. Share your link!

## 🧪 Test with Testnet

1. Install [Hiro Wallet](https://wallet.hiro.so/)
2. Switch to Testnet
3. Get free testnet STX: https://explorer.stacks.co/sandbox/faucet
4. Connect wallet in LinkChain
5. Send yourself a test tip!

## 📖 Next Steps

- **Customize**: Edit colors, templates in the editor
- **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to go live
- **Learn More**: Read full [SETUP.md](./SETUP.md) guide

## 🐛 Issues?

**Port already in use?**
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

**MongoDB not connecting?**
```bash
# Check if MongoDB is running
mongod --version

# Or use MongoDB Atlas (free):
# 1. Create account at mongodb.com/cloud/atlas
# 2. Get connection string
# 3. Update MONGODB_URI in .env.local
```

**Still stuck?**
- Check [SETUP.md](./SETUP.md) for detailed instructions
- Open an issue on GitHub

## 🎉 Happy Building!

You're now running LinkChain locally. Time to customize and make it yours!

---

**Made with ❤️ for creators everywhere**
