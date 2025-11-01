import React, { useState, useEffect } from 'react';
import { signUp } from '../../services/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface SignupAfterPaymentProps {
  onComplete: () => void;
}

export function SignupAfterPayment({ onComplete }: SignupAfterPaymentProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [tier, setTier] = useState<'PRO' | 'PREMIUM'>('PRO');

  // Get session ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session_id');
    if (session) {
      setSessionId(session);
      // Fetch session details to get the tier
      fetchSessionDetails(session);
    }
  }, []);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      // Call backend to get session details
      const response = await fetch('/api/get-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      if (data.tier) {
        setTier(data.tier);
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create account with FREE tier first
      const user = await signUp(email, password, displayName);

      // Upgrade account to paid tier from Stripe session
      if (sessionId) {
        // Fetch full session details from Stripe
        const response = await fetch('/api/get-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        const sessionData = await response.json();

        // Update user's subscription with Stripe data
        if (sessionData.customerId && sessionData.subscriptionId) {
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            'subscription.stripeCustomerId': sessionData.customerId,
            'subscription.stripeSubscriptionId': sessionData.subscriptionId,
            'subscription.tier': tier,
            'subscription.status': 'ACTIVE',
            'subscription.updatedAt': serverTimestamp()
          });
        }
      }

      // Navigate to home with upgraded account
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-300">
            You've upgraded to {tier === 'PREMIUM' ? 'Premium' : 'Pro'}. Now create your account to get started.
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-black disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account & Start'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
              <p className="text-xs text-gold-900 font-semibold mb-2">
                🎉 {tier === 'PREMIUM' ? 'Premium' : 'Pro'} Features Unlocked:
              </p>
              <ul className="text-xs text-gold-800 space-y-1">
                <li>✓ Unlimited AI-Generated scenarios</li>
                <li>✓ Scripted examination mode</li>
                <li>✓ Case-based dynamic mode</li>
                <li>✓ All evidence rulesets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
