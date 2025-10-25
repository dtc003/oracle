import React from 'react';

interface SuccessPageProps {
  onContinue: () => void;
}

export function SuccessPage({ onContinue }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          Welcome to Premium!
        </h1>
        <p className="text-gray-700 mb-6">
          Your payment was successful! You now have access to all premium features including:
        </p>
        <ul className="text-left text-gray-700 mb-8 space-y-2">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Scripted examination mode</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Case-based dynamic mode</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Unlimited practice battles</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Detailed performance analytics</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Export battle transcripts</span>
          </li>
        </ul>
        <button
          onClick={onContinue}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Start Practicing! →
        </button>
      </div>
    </div>
  );
}
