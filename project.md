# Stacks Linktree for Blockchain - Complete Project Brief

## Project Overview
You're building a **Linktree alternative built on Stacks blockchain** called **LinkChain**. Instead of traditional links, users share customizable pages where visitors can send them crypto tips/payments directly. The UI/UX must be so intuitive that non-crypto users feel completely comfortable, and the feature set must rival or exceed Linktree's capabilities.

**Core Promise:** A beautiful, simple way for creators to receive blockchain payments without friction or confusion.

---

## Key Features (Must-Have for MVP)

### 1. User Authentication & Profile Setup
- **Easy onboarding:** Users sign up with email or connect their Stacks wallet (make both options available, email signup first to lower barriers)
- **Profile creation:** Set username, display name, profile picture, bio, and cover image
- **Wallet connection:** Users can connect their existing Stacks wallet or have one auto-generated during email signup
- **Profile dashboard:** Users see their analytics, recent tips, and earnings in an easy-to-understand format

### 2. Link/Button Customization (Feature-Rich)
Users should be able to add multiple types of buttons/links to their page:
- **Tip/Pay buttons:** Direct payment options with preset amounts ($5, $10, $25, $50, Custom) OR allow any custom amount
- **Social links:** Instagram, Twitter, TikTok, YouTube, Discord, etc. (traditional links)
- **External links:** Website, Linktree link, portfolio, etc.
- **Button customization:** 
  - Custom text
  - Custom colors/styling
  - Icon selection
  - Reorder buttons by drag-and-drop
  - Hide/show toggle for individual buttons

### 3. Page Customization & Design
- **Multiple page templates:** At least 3-5 professionally designed templates users can choose from
- **Color scheme picker:** 5-10 pre-made color palettes or custom color selection
- **Theme options:** Light/dark mode
- **Font selection:** 3-5 typography options
- **Background options:** Solid colors, gradients, or uploaded custom image
- **Layout options:** Centered, side-by-side (buttons on one side, info on other), etc.
- **Preview mode:** Users see exactly how their page looks before publishing

### 4. Tip/Payment Workflow (SUPER SMOOTH - This is Critical)
When a visitor clicks a tip button:
- **Modal popup appears** (not page redirect) showing payment details
- **Preset amounts displayed prominently** with one clearly highlighted as suggested
- **Custom amount input** option if they want to pay differently
- **Wallet connection prompt:** If visitor isn't connected to a Stacks wallet, show clear instructions (something like: "Connect your wallet with one click" with a simple button)
- **Confirmation screen:** "You're sending $X to @username" - super clear
- **Success celebration:** Confetti animation, heart animation, or celebratory message
- **Tip appears on creator's page:** Recent tips/supporters list shows who just sent money (with option to make anonymous)

### 5. Earnings Dashboard & Analytics
- **Total earnings display:** Large, prominent number showing total STX received
- **Recent tips list:** Who sent money, when, how much (sortable, filterable)
- **Earnings chart:** Weekly/monthly earnings visualization
- **Export data:** CSV download of earnings history
- **Tip history:** Searchable, sortable transaction history
- **Withdrawal options:** Button to withdraw earnings to their wallet (with gas fee estimate)

### 6. Page Sharing & Social Features
- **Unique profile URL:** Something like `linkchain.app/username`
- **Share buttons:** One-click copy link, share to social media (Twitter, Instagram, TikTok with pre-written posts)
- **QR code:** Shareable QR code that links to their profile
- **Public profile view:** See what non-logged-in visitors see
- **Visitor analytics:** (Optional but nice) See how many people visited this week

### 7. Settings & Account Management
- **Profile settings:** Edit all profile info, change email, change username
- **Wallet management:** Disconnect/reconnect wallet, view wallet address
- **Privacy settings:** Make earnings public/private, show/hide tip sources
- **Notification preferences:** Email notifications for new tips
- **Tax/Legal:** Simple disclaimer about crypto payments

---

## Technical Architecture

### Frontend (React/Next.js)
- **Pages:**
  - Landing page (marketing/sign-up)
  - Creator dashboard (main hub after login)
  - Profile editor (customize page)
  - Profile preview/public view
  - Settings page
  - Analytics dashboard
  - Wallet connection modal

- **Key libraries to use:**
  - **stacks.js** for wallet connection and blockchain interactions
  - **Tailwind CSS** or **shadcn/ui** for beautiful, modern UI
  - **Recharts** for analytics charts
  - **react-hot-toast** or **sonner** for notifications
  - **framer-motion** for smooth animations

### Smart Contracts (Clarity on Stacks)
- **Primary contract:** Handle tip transfers, track tips per creator
- **Features needed:**
  - Function to send tips/payments to a creator
  - Function to store tip metadata (amount, timestamp, sender)
  - Function for creator to withdraw balance
  - Query functions to get earnings, recent tips, etc.
  - Access control (only creator can withdraw their own funds)

### Backend (Optional but Recommended - Node.js/Express)
- Store user profiles, usernames, settings in a database (PostgreSQL or MongoDB)
- Store page customization data (colors, layout, buttons)
- Track analytics (page views, visitor info)
- Handle email notifications
- Bridge between frontend and Stacks blockchain for complex queries

---

## UI/UX Design Principles (CRITICAL)

### 1. Crypto Must Disappear
- **Never use confusing crypto terminology:** Instead of "Connect your wallet," say "Get Started - it takes 10 seconds"
- **Hide wallet addresses:** Show usernames, not hex addresses
- **Normalize payments:** Make it feel like tipping someone on any app, not a blockchain transaction
- **Gas fees handled gracefully:** If there are gas fees, absorb them or explain simply: "Standard network fee: $0.50" (don't say "gas")

### 2. Extreme Simplicity
- **Onboarding:** 3-4 steps max to create a profile and share a link
- **Payment flow:** 2 clicks from landing on a page to sending money (preset amount) or 3 clicks for custom amount
- **Dashboard:** Main metrics visible at a glance, deep dives available if they want them
- **No jargon:** No "STX," "Clarity," "smart contracts," "DeFi" in the user-facing UI

### 3. Visual Beauty & Polish
- **Modern design:** Clean, minimal, contemporary aesthetic
- **Animations:** Smooth transitions, satisfying button feedback, celebratory animations on successful tips
- **Accessibility:** High contrast, readable fonts, works on mobile (CRITICAL - most creators use mobile)
- **Responsive:** Perfect on desktop, tablet, and mobile
- **Loading states:** Skeleton screens, smooth loaders (never let users feel confused or stuck)

### 4. Mobile-First
- **Creators will customize on phone:** Make sure all customization works beautifully on mobile
- **Visitors access on phone:** The profile page must look amazing on mobile
- **Payments on mobile:** Wallet connection and tip sending must work flawlessly on mobile

---

## Feature-Rich Additions (Nice-to-Have for Competition with Linktree)

1. **Custom Domains:** Allow users to use their own domain instead of `linkchain.app/username`
2. **Advanced Analytics:** Traffic sources, click-through rates, geographic data
3. **Button Variants:**
   - Monthly subscription buttons (recurring payments)
   - Product/service links
   - Event ticket links
4. **Scheduling:** Schedule tip buttons to appear at certain times
5. **Themes Marketplace:** Users create and sell custom themes
6. **Affiliate System:** Referral bonuses for inviting creators
7. **Creator Badges:** Verified badges for top creators
8. **Tip Goals:** "Help me reach $X" progress bars
9. **Merch Integration:** Link to merch shop with built-in payments
10. **Email Capture:** Optional newsletter signup on profile page

---

## User Workflows (Exact User Journeys)

### Workflow 1: Creator Setting Up
1. Land on homepage → Click "Create Your Profile" (or similar CTA)
2. Choose email signup or wallet connection (email first option)
3. Fill in username, name, profile picture, bio (4 fields max)
4. Choose template and color scheme from presets
5. Add tip buttons and social links (drag-and-drop interface)
6. Preview page
7. Publish and get shareable link
8. **Total time: 5-10 minutes**

### Workflow 2: Creator Earning
1. Share their LinkChain URL or QR code anywhere (Instagram bio, TikTok, Twitch, etc.)
2. Someone visits page, clicks a preset tip amount button
3. Payment pops up in modal, they confirm
4. Transaction goes through (1-2 second confirmation)
5. Creator sees tip in dashboard with notification
6. Can withdraw earnings anytime

### Workflow 3: Visitor Paying
1. Receive LinkChain link from creator (via social, Twitch, QR code, etc.)
2. Visit page, see creator's profile and tip options
3. Click a tip amount button (e.g., "$10 - Support")
4. Modal shows: "You're sending $10 to @creator_name"
5. Click "Send Tip" → connects wallet if needed (one-click process) → confirms transaction
6. See success message: "Sent! Thanks for supporting [creator name]" with celebratory animation
7. See their name appear on the creator's page (with option to be anonymous)
8. **Total time: 30 seconds**

---

## Success Metrics (How to Know This Works)

- Non-crypto users can set up and receive payments without asking questions
- Users can send a tip in under 1 minute, even without prior crypto experience
- Mobile experience is flawless
- Page load times are fast (under 2 seconds)
- Smooth animations and transitions make it feel premium
- Feature parity or superiority to Linktree
- Zero confusion about blockchain/crypto terminology

---

## Tech Stack Summary

**Frontend:** Next.js, React, Tailwind CSS, stacks.js, Framer Motion
**Smart Contracts:** Clarity (Stacks)
**Backend:** Node.js/Express (optional but recommended), PostgreSQL
**Hosting:** Vercel (frontend), any Node host (backend)
**Blockchain:** Stacks (Testnet for development, Mainnet for production)

---

## Deliverables for Hackathon

1. ✅ GitHub repo with clean, well-documented code
2. ✅ README explaining setup, features, how to use
3. ✅ Deployed, live demo on public URL
4. ✅ Demo/pitch video (2-3 minutes) showing:
   - Creator setting up a profile
   - Visitor sending a tip
   - Dashboard/analytics view
5. ✅ Smart contract deployed on Stacks testnet/mainnet

---

## Important Reminders

- **Use AI tools (Claude Code, Cursor)** to accelerate development, but understand what's being built
- **Test thoroughly on mobile** - this will make or break the UX
- **Keep it simple first** - MVP with core features beats feature-bloated half-finished app
- **Focus on the payment flow** - this is the heart of the app; every tap should feel intentional and smooth
- **Make it beautiful** - UI excellence will make judges and users fall in love with it
- **Document everything** - README, code comments, setup instructions

Good luck! You're building something that could genuinely help creators worldwide.


## Resources
Stacks developer docs - https://docs.stacks.co/
Hiro docs - https://docs.hiro.so/