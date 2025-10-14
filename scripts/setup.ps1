# LinkChain Setup Script for Windows PowerShell
# Run with: .\scripts\setup.ps1

Write-Host "🔗 LinkChain Setup Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js 18+ required. You have version $nodeVersion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check MongoDB
Write-Host "🗄️  Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version 2>$null
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB not found locally. You can:" -ForegroundColor Yellow
    Write-Host "   1. Install MongoDB locally" -ForegroundColor Gray
    Write-Host "   2. Use MongoDB Atlas (cloud)" -ForegroundColor Gray
}
Write-Host ""

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup environment
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local with your configuration!" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env.local already exists, skipping..." -ForegroundColor Gray
}
Write-Host ""

# Generate JWT secret
Write-Host "🔐 Generating JWT secret..." -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
if (Test-Path .env.local) {
    (Get-Content .env.local) -replace 'your_secure_jwt_secret_change_this_now', $jwtSecret | Set-Content .env.local
    Write-Host "✅ JWT secret generated and added to .env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not update .env.local with JWT secret" -ForegroundColor Yellow
}
Write-Host ""

# Check MongoDB connection
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.adminCommand('ping')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is running and accessible" -ForegroundColor Green
        
        # Offer to seed database
        Write-Host ""
        $seedResponse = Read-Host "📊 Would you like to seed the database with sample data? (y/n)"
        if ($seedResponse -eq 'y' -or $seedResponse -eq 'Y') {
            Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
            npm run seed
            Write-Host "✅ Database seeded with sample data" -ForegroundColor Green
            Write-Host ""
            Write-Host "📝 Sample login credentials:" -ForegroundColor Cyan
            Write-Host "   Email: john@example.com" -ForegroundColor Gray
            Write-Host "   Password: Password123!" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠️  Could not connect to MongoDB" -ForegroundColor Yellow
    Write-Host "   Make sure MongoDB is running or configure MongoDB Atlas" -ForegroundColor Gray
}
Write-Host ""

# Build check
Write-Host "🔨 Verifying build..." -ForegroundColor Yellow
npm run build *>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  Build check failed (this is normal during setup)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env.local with your configuration" -ForegroundColor White
Write-Host "   - Update MONGODB_URI if using MongoDB Atlas" -ForegroundColor Gray
Write-Host "   - Update CONTRACT_ADDRESS after deploying smart contract" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development servers:" -ForegroundColor White
Write-Host "   Terminal 1: npm run dev" -ForegroundColor Gray
Write-Host "   Terminal 2: npm run server" -ForegroundColor Gray
Write-Host ""
Write-Host "   Or use: npm run dev:all (requires concurrently)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start: QUICKSTART.md" -ForegroundColor Gray
Write-Host "   - Full Setup: SETUP.md" -ForegroundColor Gray
Write-Host "   - Deployment: DEPLOYMENT.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Need help? Check the documentation or open an issue on GitHub!" -ForegroundColor Yellow
Write-Host ""
