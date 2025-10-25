# Authentication & Payment Setup Summary

## ✅ Completed Features

### 1. Authentication System
- **Files Created:**
  - `/src/services/auth.ts` - Complete Firebase Auth integration
  - `/src/components/auth/AuthPage.tsx` - Login/Signup UI

- **Features:**
  - Email/password signup with display name
  - Email/password login
  - Password reset via email
  - User session management
  - Auto-create user document in Firestore on signup

### 2. Subscription Model (Freemium)
- **File:** `/src/config/subscriptionPlans.ts`

- **Three Tiers:**
  1. **FREE** ($0/month)
     - Unlimited AI-generated scenarios
     - Perfect for casual users to get hooked
     - Full access to FRE and Mock Trial rulesets

  2. **PRO** ($19.99/month)
     - Everything in Free
     - Scripted examination mode (paste your own Q&A)
     - Case-based dynamic mode (input case details)
     - Unlimited battles in all modes
     - Performance analytics

  3. **PREMIUM** ($199/year - saves 17%)
     - Everything in Pro
     - Annual billing discount
     - Priority support
     - Early access to new features

### 3. Stripe Integration
- **Files Created:**
  - `/src/services/stripe.ts` - Client-side Stripe integration
  - `/api/create-checkout-session.ts` - Backend: Create checkout
  - `/api/create-portal-session.ts` - Backend: Billing portal
  - `/api/webhooks/stripe.ts` - Backend: Handle Stripe events

- **Environment Variables Added:**
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SLyw8JZP5hNG0tK...
  STRIPE_SECRET_KEY=sk_test_51SLyw8JZP5hNG0tKY0NtZKXe...
  ```

### 4. UI Components
- **Pricing Page:** `/src/components/pricing/PricingPage.tsx`
  - Beautiful cards for each tier
  - FAQ section
  - Upgrade buttons with Stripe checkout

- **Paywall in Mode Selector:** `/src/components/modes/ModeSelector.tsx`
  - Lock icons on paid modes
  - "Upgrade to Pro" buttons
  - Free badge on AI-generated mode
  - Green highlight on free mode

### 5. Type Definitions
- **File:** `/src/types/index.ts`
- Added types:
  - `SubscriptionTier`
  - `SubscriptionStatus`
  - `SubscriptionPlan`
  - `UserSubscription`
  - `User`

---

## 🚧 Setup Required

### Step 1: Enable Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `oracle-772da`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### Step 2: Create Stripe Products
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Create two products:

   **Product 1: Pro (Monthly)**
   - Name: "Evidence Battle Simulator - Pro"
   - Pricing: $19.99/month recurring
   - Copy the Price ID (starts with `price_xxx`)

   **Product 2: Premium (Annual)**
   - Name: "Evidence Battle Simulator - Premium"
   - Pricing: $199/year recurring
   - Copy the Price ID

3. Update `/src/config/subscriptionPlans.ts`:
   ```typescript
   PRO: {
     ...
     stripePriceId: 'price_YOUR_PRO_PRICE_ID_HERE'
   },
   PREMIUM: {
     ...
     stripePriceId: 'price_YOUR_PREMIUM_PRICE_ID_HERE'
   }
   ```

### Step 3: Set up Stripe Webhooks
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

### Step 4: Deploy Backend API
The `/api` folder contains serverless functions. You'll need to deploy these:

**Option A: Vercel (Recommended)**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Vercel will automatically detect the `/api` folder
4. Set environment variables in Vercel dashboard

**Option B: Netlify Functions**
1. Create `netlify.toml`:
   ```toml
   [build]
     functions = "api"
   ```
2. Deploy to Netlify
3. Set environment variables in Netlify dashboard

---

## 📝 How It Works

### User Signup Flow:
1. User fills out signup form ([AuthPage.tsx](src/components/auth/AuthPage.tsx:1-232))
2. `signUp()` creates Firebase Auth user
3. User document created in Firestore with FREE tier
4. User redirected to mode selector
5. Can use AI-generated mode immediately (free)
6. Scripted and case-based modes show "Upgrade" button

### Upgrade Flow:
1. User clicks "Upgrade to Pro" button
2. Redirected to pricing page
3. Clicks upgrade button for Pro or Premium
4. `createCheckoutSession()` called
5. Stripe Checkout page opens
6. User enters payment details
7. On success, webhook fires
8. Webhook updates Firestore user subscription
9. User can now access all modes

### Access Control:
- Function `canAccessMode()` checks if user can access a mode
- Free users: Only `AI_GENERATED` mode
- Pro/Premium users: All modes unlocked

---

## 🎯 Next Steps

1. **Test Authentication:**
   - Create a test account
   - Verify user document in Firestore
   - Test login/logout

2. **Test Freemium Model:**
   - Sign up as free user
   - Verify AI-generated mode works
   - Verify scripted/case-based show locks
   - Click "Upgrade" button

3. **Test Stripe (Test Mode):**
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Verify webhook receives event
   - Check Firestore subscription updated

4. **Deploy to Production:**
   - Deploy API endpoints
   - Update success/cancel URLs in checkout
   - Set up webhook endpoint
   - Test end-to-end flow

---

## 🔐 Security Notes

- ✅ Stripe secret key is server-side only (in `/api` folder)
- ✅ Publishable key is safe to expose (prefixed with `pk_test_`)
- ⚠️ Backend API needs CORS configuration for production
- ⚠️ Webhook endpoint must verify signatures (already implemented)
- ⚠️ Consider adding rate limiting to API endpoints

---

## 📊 Firestore Data Structure

```
users/{userId}
  ├── id: string
  ├── email: string
  ├── displayName: string
  ├── subscription
  │   ├── tier: "FREE" | "PRO" | "PREMIUM"
  │   ├── status: "ACTIVE" | "CANCELED" | ...
  │   ├── stripeCustomerId: string
  │   ├── stripeSubscriptionId: string
  │   ├── battlesUsedThisMonth: number
  │   └── ...
  ├── stats
  │   ├── totalBattles: number
  │   ├── totalObjections: number
  │   └── ...
  └── ...
```

---

## 🐛 Troubleshooting

**Issue: "Failed to load Stripe"**
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Restart dev server after adding env vars

**Issue: Checkout doesn't work**
- Verify API endpoint is accessible
- Check browser console for errors
- Verify Stripe keys are correct (test mode vs live mode)

**Issue: Webhook not firing**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook signing secret matches

**Issue: Users can't access paid modes after payment**
- Check webhook fired successfully
- Verify Firestore user document updated
- Check subscription status in Firestore

---

## ✨ Features Ready to Use

✅ User signup/login
✅ Free tier (unlimited AI mode)
✅ Paywall on premium modes
✅ Stripe checkout integration
✅ Subscription management ready
✅ Beautiful pricing page
✅ Access control system

**The payment infrastructure is complete and ready to monetize!** 🚀
