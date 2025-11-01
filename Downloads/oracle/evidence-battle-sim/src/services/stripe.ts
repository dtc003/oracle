import { loadStripe, Stripe } from '@stripe/stripe-js';
import { SubscriptionTier } from '../types';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';

// Initialize Stripe with publishable key
let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment variables');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

/**
 * Create a Stripe Checkout session for subscription
 * This redirects the user to Stripe's hosted checkout page
 */
export async function createCheckoutSession(
  tier: Exclude<SubscriptionTier, 'FREE'>,
  userId: string,
  userEmail: string
): Promise<{ error?: string }> {
  try {
    const plan = SUBSCRIPTION_PLANS[tier];

    if (!plan.stripePriceId) {
      throw new Error('Stripe price ID not configured for this plan');
    }

    // Call your backend API to create a Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priceId: plan.stripePriceId,
        userId,
        userEmail,
        tier
      })
    });

    // Check if response is ok
    if (!response.ok) {
      // API not available (likely local dev without Vercel CLI)
      console.error('API endpoint not available. Deploy to Vercel to enable payments.');
      return { error: 'Payment system not available in local development. Please deploy to Vercel to test payments.' };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    if (!data.url) {
      return { error: 'No checkout URL returned from server' };
    }

    // Redirect to Stripe Checkout URL
    window.location.href = data.url;

    return {};
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { error: 'API not available. Deploy to Vercel to enable payments.' };
  }
}

/**
 * Create a Stripe Customer Portal session
 * This allows users to manage their subscription (cancel, update payment method, etc.)
 */
export async function createPortalSession(userId: string): Promise<{ url?: string; error?: string }> {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    const { url, error } = await response.json();

    if (error) {
      return { error };
    }

    return { url };
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return { error: error.message || 'Failed to create portal session' };
  }
}

/**
 * Format price in dollars
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Get price display string with interval
 */
export function getPriceDisplay(tier: SubscriptionTier): string {
  const plan = SUBSCRIPTION_PLANS[tier];

  if (plan.price === 0) {
    return 'Free';
  }

  const price = formatPrice(plan.price);
  const interval = plan.interval === 'month' ? '/month' : '/year';

  return `${price}${interval}`;
}
