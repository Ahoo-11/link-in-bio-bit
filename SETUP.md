# LinkChain Setup Guide

Complete guide to setting up and running LinkChain locally.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Stacks Wallet** - [Hiro Wallet](https://wallet.hiro.so/) for testing

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "d:\New folder\Linktree alternative"

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/linkchain

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_change_this_now

# Stacks Network Configuration
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_CONTRACT_NAME=linkchain-tips

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. MongoDB Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod

# MongoDB will run on mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

### 4. Smart Contract Deployment

#### Option A: Use Clarinet (Local Testing)

```bash
# Install Clarinet
# Windows: Download from https://github.com/hirosystems/clarinet/releases
# Mac: brew install clarinet
# Linux: wget -nv https://github.com/hirosystems/clarinet/releases/download/v1.0.0/clarinet-linux-x64.tar.gz -O clarinet-linux-x64.tar.gz

# Initialize Clarinet project
clarinet new linkchain-contract
cd linkchain-contract

# Copy smart contract
cp ../contracts/linkchain-tips.clar contracts/

# Test contract
clarinet test

# Deploy to testnet
clarinet deploy --testnet
```

#### Option B: Use Hiro Platform (Easiest)

1. Go to [Hiro Platform](https://platform.hiro.so/)
2. Create new contract
3. Paste code from `contracts/linkchain-tips.clar`
4. Deploy to testnet
5. Copy contract address to `.env.local`

### 5. Start Development Servers

Open **two terminals**:

#### Terminal 1: Next.js Frontend

```bash
npm run dev
```

Frontend will run on http://localhost:3000

#### Terminal 2: Express Backend

```bash
npm run server
```

Backend API will run on http://localhost:5000

## Verify Installation

1. **Open browser**: http://localhost:3000
2. **Sign up**: Create a test account
3. **Connect wallet**: Connect Hiro Wallet (testnet)
4. **Get testnet STX**: https://explorer.stacks.co/sandbox/faucet
5. **Test tipping**: Send yourself a test tip

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB service
# Windows: net start MongoDB
# Mac/Linux: sudo systemctl start mongod
```

### Issue: Port Already in Use

**Solution:**
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
#          taskkill /PID <PID> /F
# Mac/Linux: lsof -ti:3000 | xargs kill -9

# Or change port in package.json
"dev": "next dev -p 3001"
```

### Issue: Smart Contract Not Found

**Solution:**
1. Verify contract is deployed to testnet
2. Check contract address in `.env.local`
3. Ensure wallet is connected to testnet

### Issue: TypeScript Errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Testing the Application

### 1. Create Creator Profile

1. Navigate to http://localhost:3000
2. Click "Get Started"
3. Fill in username, name, email, password
4. Click "Create Account"

### 2. Customize Profile

1. Go to Dashboard
2. Click "Customize"
3. Add tip buttons and social links
4. Change colors and theme
5. Save changes

### 3. Test Tip Flow

1. Copy your profile URL (e.g., http://localhost:3000/yourname)
2. Open in incognito/private window
3. Click a tip button
4. Connect wallet
5. Send test tip with testnet STX

### 4. View Analytics

1. Go to Dashboard
2. Click "Analytics"
3. View visits, clicks, and earnings

## Development Tips

### Hot Reload

- Frontend: Automatic with Next.js
- Backend: Use nodemon for auto-restart

```bash
npm install -g nodemon
nodemon backend/server.js
```

### Database GUI

Install MongoDB Compass for visual database management:
- Download: https://www.mongodb.com/products/compass

### API Testing

Use Postman or Thunder Client to test API endpoints:
- Import: Create collection with backend routes
- Base URL: http://localhost:5000

## Next Steps

1. **Customize branding** - Update logo, colors, copy
2. **Add features** - Implement nice-to-have features
3. **Test thoroughly** - Test all user flows
4. **Deploy** - Follow DEPLOYMENT.md guide
5. **Launch** - Share with users!

## Need Help?

- **Stacks Docs**: https://docs.stacks.co/
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com/

---

Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.
