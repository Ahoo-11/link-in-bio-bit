#!/bin/bash

# LinkChain Setup Script
# Automates the initial setup process

echo "🔗 LinkChain Setup Script"
echo "=========================="
echo ""

# Check Node.js
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have version $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check MongoDB
echo "🗄️  Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
else
    echo "⚠️  MongoDB not found locally. You can:"
    echo "   1. Install MongoDB locally"
    echo "   2. Use MongoDB Atlas (cloud)"
    echo ""
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Setup environment
echo "⚙️  Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "⚠️  IMPORTANT: Edit .env.local with your configuration!"
    echo ""
else
    echo "ℹ️  .env.local already exists, skipping..."
    echo ""
fi

# Generate JWT secret
echo "🔐 Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
if [ -f .env.local ]; then
    sed -i.bak "s/your_secure_jwt_secret_change_this_now/$JWT_SECRET/" .env.local
    rm .env.local.bak 2>/dev/null
    echo "✅ JWT secret generated and added to .env.local"
else
    echo "⚠️  Could not update .env.local with JWT secret"
fi
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB is running and accessible"
    
    # Offer to seed database
    echo ""
    echo "📊 Would you like to seed the database with sample data? (y/n)"
    read -r SEED_RESPONSE
    if [ "$SEED_RESPONSE" = "y" ] || [ "$SEED_RESPONSE" = "Y" ]; then
        echo "🌱 Seeding database..."
        npm run seed
        echo "✅ Database seeded with sample data"
        echo ""
        echo "📝 Sample login credentials:"
        echo "   Email: john@example.com"
        echo "   Password: Password123!"
    fi
else
    echo "⚠️  Could not connect to MongoDB"
    echo "   Make sure MongoDB is running or configure MongoDB Atlas"
fi
echo ""

# Build check
echo "🔨 Verifying build..."
npm run build &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "⚠️  Build check failed (this is normal during setup)"
fi
echo ""

# Summary
echo "================================"
echo "✨ Setup Complete!"
echo "================================"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Edit .env.local with your configuration"
echo "   - Update MONGODB_URI if using MongoDB Atlas"
echo "   - Update CONTRACT_ADDRESS after deploying smart contract"
echo ""
echo "2. Start the development servers:"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: npm run server"
echo ""
echo "   Or use: npm run dev:all (requires concurrently)"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full Setup: SETUP.md"
echo "   - Deployment: DEPLOYMENT.md"
echo ""
echo "Need help? Check the documentation or open an issue on GitHub!"
echo ""
