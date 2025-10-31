import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User, SubscriptionTier } from '../../types';

interface QuickUpgradeProps {
  user: User;
  onUpgradeComplete: () => void;
}

/**
 * TEMPORARY: Quick upgrade component for testing without Stripe
 * This directly updates Firestore - FOR DEVELOPMENT ONLY
 * Remove this before production!
 */
export function QuickUpgrade({ user, onUpgradeComplete }: QuickUpgradeProps) {
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === 'FREE') return;

    setUpgrading(true);
    setError('');

    try {
      // Directly update user's subscription in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'subscription.tier': tier,
        'subscription.status': 'ACTIVE',
        'subscription.updatedAt': new Date()
      });

      alert(`✅ Upgraded to ${tier}! Refresh the page to see changes.`);
      onUpgradeComplete();

      // Force reload to update user state
      window.location.reload();
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.message || 'Failed to upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">
            Development Mode - Quick Upgrade
          </h3>
          <p className="text-sm text-yellow-800 mb-4">
            Stripe checkout requires backend deployment. Use these buttons to instantly upgrade for testing:
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 rounded p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleUpgrade('PRO')}
              disabled={upgrading || user.subscription.tier === 'PRO'}
              className="bg-navy-700 hover:bg-navy-800 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {upgrading ? 'Upgrading...' : 'Quick Upgrade to PRO'}
            </button>

            <button
              onClick={() => handleUpgrade('PREMIUM')}
              disabled={upgrading || user.subscription.tier === 'PREMIUM'}
              className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {upgrading ? 'Upgrading...' : 'Quick Upgrade to PREMIUM'}
            </button>
          </div>

          <p className="text-xs text-yellow-700 mt-3">
            ⚡ This directly updates your Firestore subscription without payment. Remove before production!
          </p>
        </div>
      </div>
    </div>
  );
}
