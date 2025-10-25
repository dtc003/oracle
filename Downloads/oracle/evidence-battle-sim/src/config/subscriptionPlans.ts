import { SubscriptionPlan, ExaminationMode } from '../types';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    interval: 'month',
    battlesPerMonth: null, // unlimited for AI-generated mode only
    features: [
      'Unlimited AI-generated scenarios',
      'FRE and Mock Trial rulesets',
      'Basic battle history',
      'Learn with random cases'
    ]
  },
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    price: 1999, // $19.99/month
    interval: 'month',
    battlesPerMonth: null, // unlimited for all modes
    features: [
      'Everything in Free, plus:',
      'Scripted examination mode',
      'Case-based dynamic mode',
      'Unlimited practice battles',
      'Detailed performance analytics',
      'Export battle transcripts',
      'Priority AI responses'
    ],
    stripeProductId: 'prod_TIaOju6YqJMJA8',
    stripePriceId: 'price_1SLzDnJZP5hNG0tKt6mkci8J'
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Premium (Annual)',
    price: 19900, // $199/year (saves ~$40)
    interval: 'year',
    battlesPerMonth: null, // unlimited
    features: [
      'Everything in Pro',
      'Annual billing (save 17%)',
      'Custom scenario builder',
      'Advanced AI arguments',
      'Priority email support',
      'Early access to new features'
    ],
    stripeProductId: 'prod_TIaQUoRZrumpq3',
    stripePriceId: 'price_1SLzFiJZP5hNG0tKLzKvEJtz'
  }
};

export function getPlanForTier(tier: SubscriptionPlan['tier']): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

/**
 * Check if user can access a specific examination mode
 * FREE tier: Only AI_GENERATED mode
 * PRO/PREMIUM: All modes
 */
export function canAccessMode(mode: ExaminationMode, tier: SubscriptionPlan['tier']): boolean {
  // AI-generated mode is always free
  if (mode === 'AI_GENERATED') {
    return true;
  }

  // Scripted and Case-based require PRO or PREMIUM
  return tier === 'PRO' || tier === 'PREMIUM';
}

/**
 * Check if user can start a battle (general check, not mode-specific)
 */
export function canStartBattle(battlesUsed: number, tier: SubscriptionPlan['tier']): boolean {
  const plan = getPlanForTier(tier);

  // Unlimited battles
  if (plan.battlesPerMonth === null) {
    return true;
  }

  // Check if under limit
  return battlesUsed < plan.battlesPerMonth;
}

export function getBattlesRemaining(battlesUsed: number, tier: SubscriptionPlan['tier']): number | null {
  const plan = getPlanForTier(tier);

  if (plan.battlesPerMonth === null) {
    return null; // unlimited
  }

  return Math.max(0, plan.battlesPerMonth - battlesUsed);
}
