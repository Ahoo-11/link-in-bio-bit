# LinkChain Deployment Guide

Complete guide to deploying LinkChain to production.

## Deployment Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Vercel        │      │   Railway/Render │      │  MongoDB Atlas  │
│   (Frontend)    │─────▶│   (Backend API)  │─────▶│   (Database)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                                                    
         │                                                    
         ▼                                                    
┌─────────────────┐                                          
│  Stacks Mainnet │                                          
│ (Smart Contract)│                                          
└─────────────────┘                                          
```

## Prerequisites

- GitHub account
- Vercel account (free)
- Railway/Render account (free tier available)
- MongoDB Atlas account (free tier available)
- Stacks wallet with STX for mainnet deployment

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create new project: "LinkChain"
4. Build a Database → Free Shared Cluster
5. Choose cloud provider and region (closest to users)
6. Cluster Name: "linkchain-prod"
7. Create Cluster (takes 3-5 minutes)

### 2. Configure Database Access

1. Database Access → Add New Database User
2. Authentication Method: Password
3. Username: `linkchain_admin`
4. Password: Generate secure password (save it!)
5. Database User Privileges: Read and write to any database
6. Add User

### 3. Configure Network Access

1. Network Access → Add IP Address
2. Allow Access From Anywhere: `0.0.0.0/0` (for production)
3. Add Entry

### 4. Get Connection String

1. Click "Connect" on your cluster
2. Connect your application
3. Copy connection string
4. Replace `<password>` with your password
5. Save for later

Example: `mongodb+srv://linkchain_admin:PASSWORD@linkchain-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Part 2: Smart Contract Deployment (Stacks Mainnet)

### Option 1: Using Clarinet CLI

```bash
# Make sure you have mainnet STX in your wallet

# Deploy to mainnet
clarinet deploy --mainnet

# Note the deployed contract address
```

### Option 2: Using Hiro Platform

1. Go to [Hiro Platform](https://platform.hiro.so/)
2. Connect mainnet wallet
3. Deploy New Contract
4. Name: `linkchain-tips`
5. Paste code from `contracts/linkchain-tips.clar`
6. Review and Deploy
7. Sign transaction
8. Wait for confirmation (10-20 minutes)
9. Copy contract address

**Important:** Save the mainnet contract address!

Example: `SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.linkchain-tips`

## Part 3: Backend Deployment (Railway)

### 1. Push to GitHub

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/linkchain.git
git push -u origin main
```

### 2. Deploy to Railway

1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select `linkchain` repository
5. Add service → Select repository
6. Configure:
   - Root Directory: `/`
   - Start Command: `node backend/server.js`

### 3. Add Environment Variables

In Railway dashboard, add these variables:

```env
MONGODB_URI=mongodb+srv://linkchain_admin:PASSWORD@linkchain-prod.xxxxx.mongodb.net/linkchain
JWT_SECRET=your_production_jwt_secret_very_secure
PORT=5000
NODE_ENV=production
```

### 4. Deploy

1. Railway will auto-deploy
2. Get your backend URL (e.g., `https://linkchain-backend.up.railway.app`)
3. Save this URL

### Alternative: Render

1. Go to [Render.com](https://render.com/)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `linkchain-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
5. Add environment variables (same as above)
6. Create Web Service

## Part 4: Frontend Deployment (Vercel)

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

Or via web:

1. Go to [Vercel](https://vercel.com/)
2. Import Git Repository
3. Select `linkchain` repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `/`

### 2. Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

```env
# MongoDB (not directly accessed by frontend, but needed for Next.js API routes if used)
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_production_jwt_secret

# Stacks Network (MAINNET)
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
NEXT_PUBLIC_CONTRACT_NAME=linkchain-tips

# URLs
NEXT_PUBLIC_APP_URL=https://linkchain.vercel.app
NEXT_PUBLIC_API_URL=https://linkchain-backend.up.railway.app

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Deploy

1. Click "Deploy"
2. Wait for build (2-5 minutes)
3. Get your production URL (e.g., `https://linkchain.vercel.app`)

## Part 5: Custom Domain (Optional)

### For Vercel (Frontend)

1. Go to Project Settings → Domains
2. Add domain: `linkchain.app` or `yourdomain.com`
3. Update DNS records at your domain provider:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (1-24 hours)

### For Railway (Backend)

1. Project Settings → Domains
2. Add custom domain for API
3. Update DNS records:
   ```
   Type: CNAME
   Name: api
   Value: your-backend.up.railway.app
   ```

## Part 6: Post-Deployment Checklist

### ✅ Verify Deployment

- [ ] Frontend loads at production URL
- [ ] Can create account
- [ ] Can login
- [ ] Wallet connection works (mainnet)
- [ ] Can customize profile
- [ ] Profile pages load correctly
- [ ] Tip flow works end-to-end
- [ ] Analytics displays data
- [ ] Settings page works

### ✅ Test Critical Flows

1. **Signup Flow**
   - Email signup works
   - Wallet signup works
   - Redirects to dashboard

2. **Profile Creation**
   - Can add buttons
   - Can customize styling
   - Changes save correctly

3. **Tipping Flow**
   - Profile loads for visitors
   - Tip modal opens
   - Wallet connects
   - Transaction completes
   - Success message shows
   - Tip appears in dashboard

4. **Mobile Experience**
   - All pages responsive
   - Wallet works on mobile
   - Forms work correctly

### ✅ Performance Optimization

```bash
# Check Lighthouse scores
npm run build
npm start

# Aim for:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

### ✅ Security

- [ ] All API endpoints require authentication
- [ ] JWT secrets are strong and unique
- [ ] CORS configured correctly
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection (React default)

### ✅ Monitoring

Set up monitoring:

1. **Vercel Analytics**
   - Enable in dashboard
   - Track page views

2. **Railway Logs**
   - Monitor API errors
   - Set up alerts

3. **MongoDB Atlas Monitoring**
   - Enable performance advisor
   - Set up slow query alerts

4. **Uptime Monitoring**
   - Use UptimeRobot (free)
   - Monitor frontend and backend

## Part 7: Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor transaction failures

**Weekly:**
- Review analytics
- Check database size
- Update dependencies if needed

**Monthly:**
- Review security alerts
- Backup database
- Performance optimization

### Updating Code

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main

# Vercel and Railway auto-deploy on push!
```

### Rollback

If something breaks:

**Vercel:**
- Go to Deployments
- Find working deployment
- Click "Promote to Production"

**Railway:**
- Go to Deployments
- Select previous deployment
- Redeploy

## Costs

### Free Tier (Sufficient for MVP)

- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Railway**: $5 free credit/month (runs backend 24/7)
- **MongoDB Atlas**: 512MB storage, shared cluster

### Estimated Costs (After Free Tier)

- **Vercel Pro**: $20/month (if you exceed free tier)
- **Railway**: ~$5-10/month for backend
- **MongoDB**: $9/month for 2GB cluster
- **Domain**: $10-15/year

**Total: ~$20-30/month** for a production app serving thousands of users

## Troubleshooting

### Issue: Frontend Can't Connect to Backend

**Check:**
1. CORS configuration in `backend/server.js`
2. `NEXT_PUBLIC_API_URL` matches Railway URL
3. Railway deployment is running

### Issue: Wallet Connection Fails

**Check:**
1. `NEXT_PUBLIC_NETWORK=mainnet`
2. Contract address is correct
3. User has mainnet STX

### Issue: Database Connection Fails

**Check:**
1. MongoDB IP whitelist includes `0.0.0.0/0`
2. Connection string is correct
3. Password doesn't contain special characters that need encoding

### Issue: Slow Performance

**Optimize:**
1. Enable Vercel Edge caching
2. Add database indexes
3. Optimize images (use Next.js Image)
4. Enable CDN

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Stacks Docs**: https://docs.stacks.co/

## Success! 🎉

Your LinkChain app is now live and ready to serve creators worldwide!

**Share your deployment:**
- Tweet about it
- Post in Stacks Discord
- Submit to Product Hunt
- Get feedback from users

---

Questions? Open an issue on GitHub or reach out to the community!
