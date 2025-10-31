import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, getPriceDisplay } from '../../config/subscriptionPlans';
import { createCheckoutSession } from '../../services/stripe';
import { User, SubscriptionTier } from '../../types';
import { QuickUpgrade } from '../admin/QuickUpgrade';

interface PricingPageProps {
  user: User | null;
  onClose?: () => void;
}

export function PricingPage({ user, onClose }: PricingPageProps) {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState('');

  const handleUpgrade = async (tier: Exclude<SubscriptionTier, 'FREE'>) => {
    if (!user) {
      setError('Please sign in to upgrade your account');
      return;
    }

    setLoading(tier);
    setError('');

    try {
      const { error: checkoutError } = await createCheckoutSession(
        tier,
        user.id,
        user.email
      );

      if (checkoutError) {
        setError(checkoutError);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const currentTier = user?.subscription.tier || 'FREE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {onClose && (
            <button
              onClick={onClose}
              className="mb-4 text-white hover:text-gray-300 flex items-center mx-auto"
            >
              ← Back to App
            </button>
          )}
          <h1 className="text-5xl font-black text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300">
            Start free, upgrade when you're ready for advanced features
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Quick Upgrade (Development Mode) */}
        {user && (
          <div className="max-w-4xl mx-auto">
            <QuickUpgrade user={user} onUpgradeComplete={() => {}} />
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className={`bg-white rounded-lg shadow-xl p-8 flex flex-col ${
            currentTier === 'FREE' ? 'ring-4 ring-gold-500' : ''
          }`}>
            {currentTier === 'FREE' && (
              <div className="bg-gold-500 text-white text-sm font-bold px-4 py-1 rounded-full self-start mb-4">
                CURRENT PLAN
              </div>
            )}

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {SUBSCRIPTION_PLANS.FREE.name}
            </h3>
            <div className="text-4xl font-black text-navy-700 mb-6">
              {getPriceDisplay('FREE')}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {SUBSCRIPTION_PLANS.FREE.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed"
            >
              {currentTier === 'FREE' ? 'Current Plan' : 'Free Forever'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`bg-white rounded-lg shadow-xl p-8 flex flex-col relative ${
            currentTier === 'PRO' ? 'ring-4 ring-gold-500' : 'md:scale-105'
          }`}>
            {currentTier !== 'PRO' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                MOST POPULAR
              </div>
            )}

            {currentTier === 'PRO' && (
              <div className="bg-gold-500 text-white text-sm font-bold px-4 py-1 rounded-full self-start mb-4">
                CURRENT PLAN
              </div>
            )}

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {SUBSCRIPTION_PLANS.PRO.name}
            </h3>
            <div className="text-4xl font-black text-navy-700 mb-6">
              {getPriceDisplay('PRO')}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {SUBSCRIPTION_PLANS.PRO.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('PRO')}
              disabled={currentTier === 'PRO' || loading === 'PRO'}
              className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-black disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {loading === 'PRO'
                ? 'Loading...'
                : currentTier === 'PRO'
                ? 'Current Plan'
                : 'Upgrade to Pro'
              }
            </button>
          </div>

          {/* Premium Plan */}
          <div className={`bg-white rounded-lg shadow-xl p-8 flex flex-col ${
            currentTier === 'PREMIUM' ? 'ring-4 ring-gold-500' : ''
          }`}>
            {currentTier === 'PREMIUM' && (
              <div className="bg-gold-500 text-white text-sm font-bold px-4 py-1 rounded-full self-start mb-4">
                CURRENT PLAN
              </div>
            )}

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {SUBSCRIPTION_PLANS.PREMIUM.name}
            </h3>
            <div className="text-4xl font-black text-navy-700 mb-2">
              {getPriceDisplay('PREMIUM')}
            </div>
            <p className="text-sm text-green-600 font-semibold mb-4">
              Save 17% with annual billing
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('PREMIUM')}
              disabled={currentTier === 'PREMIUM' || loading === 'PREMIUM'}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {loading === 'PREMIUM'
                ? 'Loading...'
                : currentTier === 'PREMIUM'
                ? 'Current Plan'
                : 'Upgrade to Premium'
              }
            </button>
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="max-w-3xl mx-auto mt-16 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-700">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-700">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe integration.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                What's the difference between scripted and case-based modes?
              </h3>
              <p className="text-gray-700">
                Scripted mode lets you paste your own Q&A scripts (great for practicing specific scenarios). Case-based mode generates dynamic examinations based on case facts you provide. Both require a Pro or Premium subscription.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Is the free tier really unlimited?
              </h3>
              <p className="text-gray-700">
                Yes! The AI-generated scenario mode is completely free with unlimited use. This gives you full access to practice with random cases and objections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
