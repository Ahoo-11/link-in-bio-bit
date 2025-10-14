# LinkChain - Command Reference

Quick reference for all commands you'll need.

## 🚀 Initial Setup

```bash
# Install all dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit environment variables (use your preferred editor)
notepad .env.local   # Windows
nano .env.local      # Mac/Linux
code .env.local      # VS Code
```

## 💻 Development

### Start Development Servers

**Frontend (Terminal 1):**
```bash
npm run dev
```
Runs on http://localhost:3000

**Backend (Terminal 2):**
```bash
npm run server
```
Runs on http://localhost:5000

**Both at once (Windows PowerShell):**
```powershell
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
Start-Process -FilePath "npm" -ArgumentList "run", "server" -NoNewWindow
```

### Build & Production

```bash
# Build frontend for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🗄️ Database

### Local MongoDB

```bash
# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (Mac/Linux)
sudo systemctl start mongod

# Check if MongoDB is running
mongod --version

# Connect to MongoDB shell
mongosh
```

### MongoDB Commands

```javascript
// Show all databases
show dbs

// Use linkchain database
use linkchain

// Show collections
show collections

// View users
db.users.find().pretty()

// View tips
db.tips.find().pretty()

// Clear all data (CAUTION!)
db.users.deleteMany({})
db.tips.deleteMany({})
db.analytics.deleteMany({})
```

## 🔗 Smart Contract

### Using Clarinet

```bash
# Install Clarinet
# Windows: Download from https://github.com/hirosystems/clarinet/releases
# Mac: brew install clarinet
# Linux: wget https://github.com/hirosystems/clarinet/releases/download/v1.0.0/clarinet-linux-x64.tar.gz

# Initialize new contract project
clarinet new linkchain-contract

# Check contract syntax
clarinet check

# Run contract tests
clarinet test

# Deploy to testnet
clarinet deploy --testnet

# Deploy to mainnet
clarinet deploy --mainnet
```

## 🔧 Git Commands

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Create GitHub repo (on GitHub website), then:
git remote add origin https://github.com/yourusername/linkchain.git
git branch -M main
git push -u origin main

# Daily workflow
git add .
git commit -m "Description of changes"
git push
```

## 🚢 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy preview
vercel
```

### Railway (Backend)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# Deploy
railway up
```

## 🧪 Testing

### Manual Testing Checklist

```bash
# 1. Start servers
npm run dev        # Terminal 1
npm run server     # Terminal 2

# 2. Open browser
# Navigate to http://localhost:3000

# 3. Test flows:
# - Sign up with email
# - Create profile
# - Customize page
# - View public profile
# - Test tip button
# - Check analytics
```

### Test Accounts

Create these test accounts:

```bash
# Creator Account
Username: testcreator
Email: creator@test.com
Password: Test123456!

# Supporter Account  
Username: testsupporter
Email: supporter@test.com
Password: Test123456!
```

## 📦 Package Management

```bash
# Add new package
npm install package-name

# Add dev dependency
npm install -D package-name

# Remove package
npm uninstall package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Debugging

### View Logs

```bash
# Frontend logs (in terminal running npm run dev)
# Check terminal output

# Backend logs (in terminal running npm run server)
# Check terminal output

# MongoDB logs
# Windows: C:\Program Files\MongoDB\Server\7.0\log\mongod.log
# Mac/Linux: /var/log/mongodb/mongod.log

# Vercel logs
vercel logs

# Railway logs
railway logs
```

### Clear Caches

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Start fresh
rm -rf .next node_modules package-lock.json
npm install
```

## 🔐 Environment Variables

### View Current Environment

```bash
# Print all env variables (careful, contains secrets!)
cat .env.local

# Check if variable is set
echo $MONGODB_URI          # Mac/Linux
echo %MONGODB_URI%         # Windows CMD
echo $env:MONGODB_URI      # Windows PowerShell
```

### Set Environment Variable (temporary)

```bash
# Mac/Linux
export MONGODB_URI="mongodb://localhost:27017/linkchain"

# Windows CMD
set MONGODB_URI=mongodb://localhost:27017/linkchain

# Windows PowerShell
$env:MONGODB_URI="mongodb://localhost:27017/linkchain"
```

## 📊 Monitoring

### Check Service Status

```bash
# Check if frontend is running
curl http://localhost:3000

# Check if backend is running  
curl http://localhost:5000/health

# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### Port Management

```bash
# Find what's using a port (Windows)
netstat -ano | findstr :3000

# Find what's using a port (Mac/Linux)
lsof -ti:3000

# Kill process on port (Windows)
taskkill /PID <PID> /F

# Kill process on port (Mac/Linux)
kill -9 $(lsof -ti:3000)
```

## 🎨 Code Quality

```bash
# Format code (if Prettier is set up)
npx prettier --write .

# Lint and fix
npm run lint -- --fix

# Type check
npx tsc --noEmit
```

## 📝 Documentation

```bash
# Generate JSDoc (if configured)
npm run docs

# View README in terminal
cat README.md

# Open documentation in browser
# Just open the .md files in GitHub or VS Code
```

## ⚡ Quick Commands

```bash
# Kill all Node processes (use with caution!)
# Windows:
taskkill /F /IM node.exe
# Mac/Linux:
killall node

# Restart everything
npm run dev &
npm run server &

# Check Node & npm versions
node --version
npm --version

# Update Node & npm
npm install -g npm@latest
```

## 🆘 Emergency Commands

### Site Down

```bash
# 1. Check if services are running
curl http://localhost:3000
curl http://localhost:5000/health

# 2. Restart services
# Stop all: Ctrl+C in terminals
# Start again: npm run dev && npm run server

# 3. Check logs for errors
# Look in terminal output

# 4. Rollback deployment
vercel rollback    # Frontend
# Railway: Use dashboard to rollback
```

### Database Issues

```bash
# Backup database
mongodump --db linkchain --out ./backup

# Restore database
mongorestore --db linkchain ./backup/linkchain

# Reset database (CAUTION: Deletes all data!)
mongosh
use linkchain
db.dropDatabase()
```

### Clear Everything and Start Fresh

```bash
# CAUTION: This deletes everything!

# Stop all servers
# Press Ctrl+C in all terminals

# Remove all generated files
rm -rf node_modules
rm -rf .next
rm -rf backend/node_modules
rm package-lock.json

# Reinstall
npm install

# Reset environment
cp .env.example .env.local
# Edit .env.local with your values

# Restart
npm run dev     # Terminal 1
npm run server  # Terminal 2
```

## 📚 Helpful Aliases

Add these to your `.bashrc` or `.zshrc` (Mac/Linux):

```bash
alias lc-dev="npm run dev"
alias lc-server="npm run server"
alias lc-build="npm run build"
alias lc-start="npm start"
alias lc-logs="tail -f backend/logs/*.log"
```

## 🎯 Next Steps

After running these commands, visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
- MongoDB: mongodb://localhost:27017

Need more help? Check:
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [SETUP.md](./SETUP.md) - Detailed setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production

---

**Pro tip**: Keep these commands handy! Bookmark this file or print it out.
