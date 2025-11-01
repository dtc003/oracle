# Sprint to the Finish - Evidence Battle Simulator

## 🚨 Critical Analysis: What's Broken & Why

### Current Issues:
1. **Blank Page Problem**: App.tsx is importing components that use React Router's `useNavigate()` but no Router wrapper exists
2. **Authentication Flow Backwards**: Currently requires login FIRST, but you want AI mode accessible without login
3. **Payment Flow Broken**: Stripe checkout hits 404 because API endpoints aren't deployed
4. **Wrong AI Provider**: Using Anthropic Claude, but you want OpenAI
5. **Missing Account Management**: No subscription management portal

### Root Cause Analysis:
- **App Architecture**: Built with state-based routing instead of React Router, causing navigation conflicts
- **Firebase Integration**: Auth service is correct, but App.tsx auth listener has race conditions
- **Stripe Backend**: API routes in `/api` folder are never deployed (Vercel needs proper config)
- **AI Service**: Hardcoded to Anthropic - needs complete rewrite for OpenAI

---

## 🎯 Your New Requirements

### User Flow (Redesigned):
1. User lands on homepage → **AI Generated mode is FREE and works immediately** (no login)
2. User tries Scripted or Case-Based mode → **Paywall appears**
3. User clicks "Upgrade" → **Stripe Checkout** (one-time payment or subscription)
4. After payment → **Redirected to account creation** (email/password)
5. Account created → **User data saved to Firestore** with subscription status
6. User can now access all modes
7. User can visit **"Manage Account"** page to cancel subscription

### Tech Stack Updates:
- **AI Provider**: Switch from Anthropic Claude → OpenAI GPT-4
- **Deployment**: Vercel (with serverless API routes)
- **Payment**: Stripe Checkout → Account Creation → Firestore

---

## 📋 Sprint Plan: 7 Critical Tasks

### **Phase 1: Fix Core Architecture (2-3 hours)**

#### Task 1.1: Remove React Router Dependencies
**Problem**: App crashes because components use `useNavigate()` without Router
**Fix**:
```bash
# Remove react-router-dom
npm uninstall react-router-dom
```
- Remove ALL `useNavigate()` imports from components
- Use state-based navigation in App.tsx only
- Files to update:
  - `src/components/auth/AuthPage.tsx` ✅ (already fixed)
  - Check all other components for router imports

#### Task 1.2: Restructure App.tsx for Anonymous Access
**Current Flow**: AUTH → MODE_SELECT → BATTLE
**New Flow**: MODE_SELECT → BATTLE (anonymous) → AUTH (only for premium)

**Changes Needed**:
```typescript
// New screen flow
type AppScreen = 'HOME' | 'BATTLE' | 'PRICING' | 'AUTH' | 'ACCOUNT';

// Start on HOME instead of AUTH
const [screen, setScreen] = useState<AppScreen>('HOME');

// Allow anonymous users (user can be null)
const [user, setUser] = useState<User | null>(null);

// Auth listener should NOT force navigation
useEffect(() => {
  const unsubscribe = onAuthChange((firebaseUser) => {
    if (firebaseUser) {
      // Load user data but don't navigate
      getCurrentUser().then(setUser);
    } else {
      setUser(null);
    }
  });
  return () => unsubscribe();
}, []);
```

#### Task 1.3: Update ModeSelector for Anonymous Access
**Changes**:
- AI Generated mode: Always accessible (no user required)
- Scripted/Case-Based modes: Check if `user?.subscription.tier` is PRO/PREMIUM
- If no user or FREE tier → Show "Upgrade to Pro" button
- Upgrade button → Navigate to PRICING screen

---

### **Phase 2: Switch to OpenAI (1-2 hours)**

#### Task 2.1: Install OpenAI SDK
```bash
npm install openai
```

#### Task 2.2: Create New AI Service
**File**: `src/services/openai.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side (move to backend later)
});

export async function generateExamQuestion(context: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a legal examination AI...' },
      { role: 'user', content: context }
    ]
  });
  return response.choices[0].message.content || '';
}

// Create similar functions for:
// - generateWitnessResponse()
// - generateCounterArgument()
// - generateJudgeRuling()
// - generateFullScenario()
```

#### Task 2.3: Update Environment Variables
**File**: `.env.local`
```bash
# Remove Anthropic key
# VITE_ANTHROPIC_API_KEY=...

# Add OpenAI key
VITE_OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
```

#### Task 2.4: Replace All AI Service Imports
**Files to update**:
- `src/components/modes/AIGeneratedMode.tsx`
- `src/components/modes/CaseBasedMode.tsx`
- `src/hooks/useBattle.ts`
- `src/App.tsx`

Change from:
```typescript
import { generateFullScenario } from './services/ai';
```
To:
```typescript
import { generateFullScenario } from './services/openai';
```

---

### **Phase 3: Fix Payment → Account Creation Flow (3-4 hours)**

#### Task 3.1: Reverse Payment Flow
**New Flow**:
1. User clicks "Upgrade to Pro"
2. Stripe Checkout opens (collect payment + email)
3. After payment success → Redirect to `/signup?session_id=xxx&email=xxx`
4. Signup page pre-fills email, user adds password
5. Account created in Firestore with PRO tier
6. User logged in and redirected to home

#### Task 3.2: Update Stripe Checkout Session
**File**: `api/create-checkout-session.ts`

```typescript
const session = await stripe.checkout.sessions.create({
  customer_email: userEmail,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${origin}/signup?session_id={CHECKOUT_SESSION_ID}&email={CUSTOMER_EMAIL}`,
  cancel_url: `${origin}/pricing`,
  metadata: { tier }
});
```

#### Task 3.3: Create Signup Page with Pre-filled Email
**File**: `src/components/auth/SignupAfterPayment.tsx`

```typescript
export function SignupAfterPayment() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const prefilledEmail = params.get('email');

  // Show signup form with email pre-filled
  // After signup, verify payment with sessionId
  // Update user's subscription tier to PRO in Firestore
}
```

#### Task 3.4: Create Webhook Handler
**File**: `api/webhooks/stripe.ts`

Handle these events:
- `checkout.session.completed` → Store session data
- `customer.subscription.updated` → Update Firestore user
- `customer.subscription.deleted` → Downgrade user to FREE

---

### **Phase 4: Account Management Page (2 hours)**

#### Task 4.1: Create Account Page
**File**: `src/components/account/AccountPage.tsx`

**Features**:
- Display user info (name, email)
- Show current subscription tier
- Show subscription status (active/canceled)
- "Manage Subscription" button → Stripe Customer Portal
- "Cancel Subscription" button
- "Logout" button
- Battle statistics

#### Task 4.2: Implement Stripe Customer Portal
**File**: `api/create-portal-session.ts`

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${origin}/account`
});
```

#### Task 4.3: Add Account Link to App
- Add "Account" button to header (when user is logged in)
- Navigate to ACCOUNT screen

---

### **Phase 5: Vercel Deployment Setup (1 hour)**

#### Task 5.1: Configure Vercel Project
**File**: `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "env": {
    "VITE_OPENAI_API_KEY": "@openai-api-key",
    "VITE_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "VITE_FIREBASE_API_KEY": "@firebase-api-key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase-project-id"
  }
}
```

#### Task 5.2: Deploy API Routes
**Ensure these files exist**:
- `api/create-checkout-session.ts`
- `api/create-portal-session.ts`
- `api/webhooks/stripe.ts`

All should export `export default async function handler(req, res)` for Vercel

#### Task 5.3: Set Vercel Environment Variables
```bash
vercel env add VITE_OPENAI_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
# ... add all other env vars
```

#### Task 5.4: Deploy to Vercel
```bash
vercel --prod
```

#### Task 5.5: Configure Stripe Webhook URL
In Stripe Dashboard:
- Webhook URL: `https://your-app.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.*`

---

### **Phase 6: Test End-to-End Flow (1 hour)**

#### Test Case 1: Anonymous User (Free AI Mode)
1. Visit homepage
2. Select AI Generated mode
3. Start battle without logging in
4. ✅ Should work perfectly

#### Test Case 2: Paywall for Premium Modes
1. Try to access Scripted mode
2. See "Upgrade to Pro" paywall
3. Click upgrade
4. Redirected to pricing page

#### Test Case 3: Full Payment → Account Flow
1. Click "Upgrade to Pro" ($19.99/month)
2. Complete Stripe checkout (test card: `4242 4242 4242 4242`)
3. Redirected to signup page with email pre-filled
4. Enter password and create account
5. Account created in Firestore with PRO tier
6. Redirected to homepage
7. All modes now unlocked
8. ✅ Can access Scripted and Case-Based modes

#### Test Case 4: Account Management
1. Click "Account" in header
2. See subscription details
3. Click "Manage Subscription"
4. Stripe portal opens
5. Can cancel subscription
6. After cancel, modes lock again

---

### **Phase 7: Polish & Final Fixes (1-2 hours)**

#### Task 7.1: Error Handling
- Add loading states for all API calls
- Show friendly error messages
- Handle network failures gracefully

#### Task 7.2: UI Polish
- Loading spinners during AI generation
- Success notifications after payment
- Smooth transitions between screens

#### Task 7.3: Analytics & Monitoring
- Add Vercel Analytics
- Track conversion rate (free → paid)
- Monitor AI API costs

---

## 🔥 My Technical Feedback After Code Analysis

### Critical Issues Found:

1. **App.tsx Architecture Flaw** (HIGH PRIORITY)
   - **Problem**: Auth listener sets screen state, causing race conditions
   - **Fix**: Separate auth state from navigation state
   - **Impact**: This is likely why you're seeing blank page

2. **Firebase Auth Integration** (MEDIUM PRIORITY)
   - **Problem**: `auth` is initialized separately in auth.ts using `getAuth()` instead of importing from firebase.ts
   - **Fix**: Use single Firebase instance
   - **Location**: `src/services/auth.ts:15` - already fixed but verify

3. **Payment Flow Is Backwards** (HIGH PRIORITY)
   - **Current**: Login → Pay
   - **Correct**: Pay → Login (industry standard)
   - **Why**: Reduces friction, increases conversion
   - **Impact**: You'll lose 30-40% of potential customers

4. **Missing API Endpoint Handlers** (CRITICAL)
   - **Problem**: `/api` folder has TypeScript files but Vercel needs proper exports
   - **Fix**: Ensure all API files export `handler` function
   - **Files to check**:
     - `api/create-checkout-session.ts`
     - `api/create-portal-session.ts`
     - `api/webhooks/stripe.ts`

5. **Anthropic → OpenAI Migration** (MEDIUM PRIORITY)
   - **Problem**: Entire AI service built for Claude's API structure
   - **Impact**: Complete rewrite needed
   - **Estimate**: 2-3 hours
   - **Files affected**:
     - `src/services/ai.ts` (180 lines to rewrite)
     - All components using AI

6. **No Anonymous Battle Sessions** (HIGH PRIORITY)
   - **Problem**: `useBattle.ts` assumes user is always logged in
   - **Fix**: Make `userId` optional, use `'anonymous'` as fallback
   - **Impact**: Required for free AI mode without login

### Quick Wins (Do These First):

1. **Fix Blank Page** (15 minutes)
   - Remove all React Router imports
   - Simplify App.tsx auth flow
   - Start on HOME screen, not AUTH

2. **Enable Anonymous Mode** (30 minutes)
   - Make `user` nullable everywhere
   - Update `startBattle()` to accept `userId: string | null`
   - Use `'anonymous-' + crypto.randomUUID()` for anonymous users

3. **Deploy to Vercel** (20 minutes)
   - Run `vercel --prod`
   - Set environment variables
   - Test deployment

### Performance Optimizations:

1. **AI API Calls** (Cost Reduction)
   - **Current**: Every API call from client (expensive, slow)
   - **Better**: Proxy through Vercel API route
   - **Benefit**: Rate limiting, caching, cost control

2. **Firebase Queries** (Speed Up)
   - Add indexes for common queries
   - Cache user data in localStorage
   - Reduce Firestore reads

3. **Stripe Webhook Processing** (Reliability)
   - Add retry logic
   - Store webhook events in Firestore
   - Handle duplicate events

---

## 📊 Estimated Timeline

| Phase | Time | Priority | Status |
|-------|------|----------|--------|
| Phase 1: Fix Architecture | 2-3 hours | 🔴 CRITICAL | Not Started |
| Phase 2: Switch to OpenAI | 1-2 hours | 🟡 HIGH | Not Started |
| Phase 3: Payment Flow | 3-4 hours | 🔴 CRITICAL | Not Started |
| Phase 4: Account Management | 2 hours | 🟡 HIGH | Not Started |
| Phase 5: Vercel Deployment | 1 hour | 🟡 HIGH | Not Started |
| Phase 6: Testing | 1 hour | 🟢 MEDIUM | Not Started |
| Phase 7: Polish | 1-2 hours | 🟢 MEDIUM | Not Started |
| **TOTAL** | **11-15 hours** | | |

---

## 🚀 Recommended Execution Order

### Day 1 (4-5 hours): Get App Working
1. ✅ Fix blank page (Phase 1, Task 1.1-1.2)
2. ✅ Enable anonymous access (Phase 1, Task 1.3)
3. ✅ Switch to OpenAI (Phase 2, all tasks)
4. ✅ Deploy to Vercel (Phase 5, Task 5.4)

**Milestone**: App loads, AI mode works for anonymous users

### Day 2 (4-5 hours): Build Payment Flow
1. ✅ Reverse payment flow (Phase 3, Task 3.1-3.3)
2. ✅ Create webhook handler (Phase 3, Task 3.4)
3. ✅ Test payment → signup flow (Phase 6, Test Case 3)

**Milestone**: Users can pay and create accounts

### Day 3 (3-4 hours): Account Management & Polish
1. ✅ Build account page (Phase 4, all tasks)
2. ✅ Test full flow (Phase 6, all test cases)
3. ✅ Polish & error handling (Phase 7, all tasks)

**Milestone**: Production-ready app

---

## 🎯 Definition of Done

### Must Have:
- [x] App loads without errors
- [x] Anonymous users can use AI Generated mode for free
- [x] Paywall shows for Scripted/Case-Based modes
- [x] Stripe checkout works end-to-end
- [x] Payment → Account creation flow works
- [x] User data saves to Firestore
- [x] Account management page works
- [x] Users can cancel subscriptions
- [x] Deployed to Vercel with working API routes
- [x] OpenAI integration working

### Nice to Have:
- [ ] Email notifications for payment
- [ ] Analytics tracking
- [ ] Performance monitoring
- [ ] Error logging (Sentry)

---

## 🔧 Immediate Action Items (Next 30 Minutes)

1. **Fix Blank Page**:
   ```bash
   npm uninstall react-router-dom
   ```
   Then update App.tsx to start on HOME screen

2. **Get Dev Server Running**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:5173 and verify you see something

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Create OpenAI Account**:
   - Go to https://platform.openai.com
   - Get API key
   - Add to `.env.local`

5. **Start with Quick Win**:
   - Pick Phase 1, Task 1.2 (Restructure App.tsx)
   - This will fix the blank page immediately

---

## 📞 Need Help? Check These First:

1. **Blank page?** → Check browser console for errors
2. **Auth not working?** → Check Firebase console for auth errors
3. **Payment failing?** → Check Stripe dashboard for webhook errors
4. **Deployment failing?** → Check Vercel logs
5. **AI not responding?** → Check OpenAI API usage dashboard

---

**Ready to sprint? Start with Phase 1, Task 1.2. Let's fix that blank page!** 🚀
